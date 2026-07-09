import { Verdict } from '../models/Verdict';

export class IEvaluationService {
  /**
   * Evaluates an execution result against expected outputs.
   * @param {ExecutionResult} result Normalized output from sandbox runtimes
   * @param {string} expectedOutput The anticipated correct response text
   * @returns {string} One of the Verdict enum values
   */
  evaluate(result, expectedOutput) {
    // 1. Compile Error check
    if (result.compileOutput && result.compileOutput.trim().length > 0) {
      return Verdict.CompileError;
    }

    // 2. Runtime Error check
    if (result.exitCode !== 0 || (result.stderr && result.stderr.trim().length > 0)) {
      return Verdict.RuntimeError;
    }

    // 3. Normalization logic
    const normalize = (str) => {
      if (!str) return '';
      return str
        .replace(/\r/g, '') // remove carriage returns
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .trim();
    };

    const actualNormalized = normalize(result.stdout);
    const expectedNormalized = normalize(expectedOutput);

    if (actualNormalized === expectedNormalized) {
      return Verdict.Accepted;
    }

    return Verdict.WrongAnswer;
  }
}
export default IEvaluationService;
