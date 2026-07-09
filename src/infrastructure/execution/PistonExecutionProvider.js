import { IExecutionProvider } from '../../domain/execution/IExecutionProvider';
import { ExecutionResult } from '../../domain/models/ExecutionResult';
import { NetworkError } from '../../shared/error/errors';

export class PistonExecutionProvider extends IExecutionProvider {
  async executeCode(languageProvider, code, stdin) {
    const url = 'https://emkc.org/api/v2/piston/execute';
    const payload = {
      language: languageProvider.getPistonLanguageName(),
      version: languageProvider.getPistonVersion(),
      files: [
        {
          name: languageProvider.getStarterFileName(),
          content: code
        }
      ],
      stdin: stdin
    };

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Piston API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract results safely from Piston schema
      const run = data.run || {};
      const compile = data.compile || {};

      const stdout = run.stdout || '';
      const stderr = run.stderr || '';
      // If compile exit code exists and is non-zero, treat that as main exit code
      const exitCode = (compile.code !== undefined && compile.code !== 0) 
        ? compile.code 
        : (run.code !== undefined ? run.code : 0);
      const compileOutput = compile.stderr || compile.stdout || '';

      return new ExecutionResult({
        stdout,
        stderr,
        exitCode,
        compileOutput,
        runtime: latency, // Use latency as proxy for runtime metric
        memory: 0 // Free tier Piston does not supply detailed memory usage
      });
    } catch (err) {
      throw new NetworkError(`Sandbox execution failed: ${err.message}`, err);
    }
  }
}
export default PistonExecutionProvider;
