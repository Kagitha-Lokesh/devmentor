import { IExecutionProvider } from '../../domain/execution/IExecutionProvider';
import { ExecutionResult } from '../../domain/models/ExecutionResult';
import { NetworkError } from '../../shared/error/errors';

// Free public Judge0 CE instance — no API key required
// Rate limit: ~100 requests/day per IP (generous for dev/personal use)
const JUDGE0_BASE_URL = 'https://ce.judge0.com';

const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILE_ERROR: 6,
};

const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 20;

export class Judge0ExecutionProvider extends IExecutionProvider {
  _getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Judge0 CE saves Java source as "Main.java" and executes the `Main` class.
   * We must rename the top-level class (e.g. `Solution`) to `Main` so the
   * filename, class name, and JVM entry point all match.
   * All references to the old class name in the code are also replaced.
   */
  _prepareCode(languageId, code) {
    if (languageId === 62) {
      // Extract the top-level public class name
      const match = code.match(/public\s+class\s+(\w+)/);
      if (match) {
        const originalName = match[1];
        if (originalName !== 'Main') {
          // Replace every occurrence of the class name with Main
          return code.replace(new RegExp(`\\b${originalName}\\b`, 'g'), 'Main');
        }
      }
    }
    return code;
  }

  async executeCode(languageProvider, code, stdin) {
    const languageId = languageProvider.getJudge0LanguageId();
    if (!languageId) {
      throw new NetworkError(
        `Language "${languageProvider.getLanguageId()}" is not supported by Judge0 yet.`
      );
    }

    const preparedCode = this._prepareCode(languageId, code);
    const startTime = Date.now();

    // Step 1 — Submit token
    const submitRes = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({
        language_id: languageId,
        source_code: preparedCode,
        stdin: stdin || '',
      }),
    });

    if (!submitRes.ok) {
      const text = await submitRes.text().catch(() => '');
      throw new NetworkError(`Judge0 submission failed (HTTP ${submitRes.status}): ${text}`);
    }

    const { token } = await submitRes.json();
    if (!token) {
      throw new NetworkError('Judge0 did not return a submission token.');
    }

    // Step 2 — Poll for result
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollRes = await fetch(
        `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,exit_code,time,memory`,
        { method: 'GET', headers: this._getHeaders() }
      );

      if (!pollRes.ok) continue;

      const data = await pollRes.json();
      const statusId = data.status?.id;

      // Still queued/running — keep polling
      if (statusId === STATUS.IN_QUEUE || statusId === STATUS.PROCESSING) continue;

      const runtime = Date.now() - startTime;

      const stdout = data.stdout || '';
      const stderr = data.stderr || '';
      const compileOutput = data.compile_output || '';
      const exitCode = statusId === STATUS.ACCEPTED ? 0 : (data.exit_code ?? 1);

      return new ExecutionResult({
        stdout,
        stderr,
        exitCode,
        compileOutput,
        runtime,
        memory: data.memory || 0,
      });
    }

    throw new NetworkError('Code execution timed out waiting for Judge0 result.');
  }
}

export default Judge0ExecutionProvider;
