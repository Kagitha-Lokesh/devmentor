export class Submission {
  constructor({
    id,
    userId,
    problemId,
    language,
    verdict,
    runtime = 0,
    memory = 0,
    createdAt = new Date(),
    sourceCode = '' // Primarily cached locally in IndexedDB
  }) {
    this.id = id;
    this.userId = userId;
    this.problemId = problemId;
    this.language = language;
    this.verdict = verdict;
    this.runtime = runtime;
    this.memory = memory;
    this.createdAt = createdAt;
    this.sourceCode = sourceCode;
  }
}
export default Submission;
