/**
 * IMasteryRepository Interface
 * Contract for managing user topic mastery score records.
 */
export class IMasteryRepository {
  async saveMastery(uid, mastery) {
    throw new Error('Method not implemented: saveMastery');
  }

  async getMastery(uid, topicId) {
    throw new Error('Method not implemented: getMastery');
  }

  async listMastery(uid) {
    throw new Error('Method not implemented: listMastery');
  }
}
export default IMasteryRepository;
