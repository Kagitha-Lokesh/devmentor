/**
 * IProgressRepository Interface
 * Contract for checking/saving lesson read percentages and task completions.
 */
export class IProgressRepository {
  async saveProgress(uid, progress) {
    throw new Error('Method not implemented: saveProgress');
  }

  async getProgress(uid, topicId) {
    throw new Error('Method not implemented: getProgress');
  }

  async listProgress(uid) {
    throw new Error('Method not implemented: listProgress');
  }
}
export default IProgressRepository;
