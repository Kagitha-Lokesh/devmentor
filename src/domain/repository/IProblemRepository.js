/**
 * IProblemRepository Interface
 * Contract for fetching static problems.
 */
export class IProblemRepository {
  async listProblems() {
    throw new Error('Method not implemented: listProblems');
  }

  async getProblem(problemId) {
    throw new Error('Method not implemented: getProblem');
  }
}
export default IProblemRepository;
