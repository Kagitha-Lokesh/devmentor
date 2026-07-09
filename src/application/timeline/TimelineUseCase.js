import { container } from '../../infrastructure/di/container';
import { TimelineEvent } from '../../domain/models/TimelineEvent';

export class TimelineUseCase {
  _getRepo() {
    return container.resolve('ITimelineRepository');
  }

  async getEvents(uid) {
    return this._getRepo().getEvents(uid);
  }

  /**
   * Records a new event in the user's learning timeline.
   * @param {string} uid
   * @param {{ type: string, title: string, description: string, metadata?: object }} eventData
   */
  async recordEvent(uid, { type, title, description, metadata }) {
    const event = new TimelineEvent({ userId: uid, type, title, description, metadata });
    await this._getRepo().recordEvent(uid, event);
    return event;
  }

  async getFilteredEvents(uid, { type, from, to } = {}) {
    const all = await this.getEvents(uid);
    return all.filter(evt => {
      if (type && evt.type !== type) return false;
      if (from && evt.timestamp < new Date(from)) return false;
      if (to && evt.timestamp > new Date(to)) return false;
      return true;
    });
  }

  async getStatistics(uid) {
    const all = await this.getEvents(uid);
    const counts = {};
    all.forEach(evt => { counts[evt.type] = (counts[evt.type] || 0) + 1; });
    return { total: all.length, byType: counts };
  }
}
export default TimelineUseCase;
