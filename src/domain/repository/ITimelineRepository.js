export class ITimelineRepository {
  async getEvents(uid) {
    throw new Error('Not implemented.');
  }

  async recordEvent(uid, event) {
    throw new Error('Not implemented.');
  }
}
export default ITimelineRepository;
