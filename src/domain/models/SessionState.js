export class SessionState {
  constructor({
    problemId,
    language,
    code = '',
    cursorLine = 1,
    cursorColumn = 1,
    scrollTop = 0,
    scrollLeft = 0,
    timestamp = Date.now()
  }) {
    if (!problemId) throw new Error('SessionState requires a problemId.');
    if (!language) throw new Error('SessionState requires a language.');

    this.problemId = problemId;
    this.language = language;
    this.code = code;
    this.cursorLine = cursorLine;
    this.cursorColumn = cursorColumn;
    this.scrollTop = scrollTop;
    this.scrollLeft = scrollLeft;
    this.timestamp = timestamp;
  }
}
export default SessionState;
