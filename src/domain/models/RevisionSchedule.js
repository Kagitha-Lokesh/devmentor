/**
 * Domain entity representing a scheduled revision task for a topic.
 */
export class RevisionSchedule {
  /**
   * @param {object} params
   * @param {string} params.topicId - Reference ID to topic
   * @param {string} params.uid - Reference ID to user
   * @param {Date|string} params.dueDate - Date when revision becomes due
   * @param {number} params.overdueBy - Count of days overdue (0 = due today, positive = days overdue)
   * @param {number} params.cardsDue - Count of cards due for this topic
   * @param {number} [params.priority] - Priority score for sorting (computed based on weights)
   */
  constructor({
    topicId,
    uid,
    dueDate,
    overdueBy,
    cardsDue,
    priority = 0
  }) {
    if (!topicId) throw new Error('RevisionSchedule requires topicId.');
    if (!uid) throw new Error('RevisionSchedule requires uid.');
    if (!dueDate) throw new Error('RevisionSchedule requires dueDate.');

    this.topicId = topicId;
    this.uid = uid;
    this.dueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
    this.overdueBy = overdueBy;
    this.cardsDue = cardsDue;
    this.priority = priority;
  }
}

export default RevisionSchedule;
