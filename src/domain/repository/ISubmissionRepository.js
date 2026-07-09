/**
 * ISubmissionRepository Interface
 * Contract for recording and querying user practice code execution logs.
 */
export class ISubmissionRepository {
  async saveSubmission(uid, submission) {
    throw new Error('Method not implemented: saveSubmission');
  }

  async getSubmissionsByProblem(uid, problemId) {
    throw new Error('Method not implemented: getSubmissionsByProblem');
  }

  async getSubmissionsHistory(uid) {
    throw new Error('Method not implemented: getSubmissionsHistory');
  }
}
export default ISubmissionRepository;
