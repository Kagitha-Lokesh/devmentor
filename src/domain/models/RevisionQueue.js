/**
 * Domain entity representing the complete set of segmented queues for a user's revision task list.
 */
export class RevisionQueue {
  /**
   * @param {object} params
   * @param {Array<object>} params.today - Topics due for review today
   * @param {Array<object>} params.overdue - Overdue topics
   * @param {Array<object>} params.upcoming - Upcoming topics
   * @param {Array<object>} params.weakTopics - Topics identified as having low retention/mastery
   */
  constructor({ today = [], overdue = [], upcoming = [], weakTopics = [] }) {
    this.today = Array.isArray(today) ? today : [];
    this.overdue = Array.isArray(overdue) ? overdue : [];
    this.upcoming = Array.isArray(upcoming) ? upcoming : [];
    this.weakTopics = Array.isArray(weakTopics) ? weakTopics : [];
  }
}

export default RevisionQueue;
