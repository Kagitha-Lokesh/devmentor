/**
 * IExecutionProvider Interface
 * Contract for code runtimes execution engines.
 */
export class IExecutionProvider {
  /**
   * Executes source code against inputs.
   * @param {string} language Code runtime name (java, javascript, sql)
   * @param {string} code Source code characters
   * @param {string} stdin Process standard input
   * @returns {Promise<ExecutionResult>} Normalized execution output wrapper
   */
  async executeCode(language, code, stdin) {
    throw new Error('Method not implemented: executeCode');
  }
}
export default IExecutionProvider;
