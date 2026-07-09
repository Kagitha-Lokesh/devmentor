export class ExecutionResult {
  constructor({
    stdout = '',
    stderr = '',
    exitCode = 0,
    compileOutput = '',
    runtime = 0, // milliseconds
    memory = 0 // kilobytes
  }) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.exitCode = exitCode;
    this.compileOutput = compileOutput;
    this.runtime = runtime;
    this.memory = memory;
  }

  hasError() {
    return this.exitCode !== 0 || this.stderr.length > 0 || this.compileOutput.length > 0;
  }
}
export default ExecutionResult;
