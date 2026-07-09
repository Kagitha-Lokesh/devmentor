/**
 * Domain entity representing a static flashcard item.
 */
export class Flashcard {
  /**
   * @param {object} params
   * @param {string} params.id - Unique ID (e.g. topicId-fc-1)
   * @param {string} params.topicId - Parent topic reference ID
   * @param {string} params.front - Flashcard front text (question)
   * @param {string} params.back - Flashcard back text (answer)
   * @param {string[]} [params.tags] - Category tags
   */
  constructor({ id, topicId, front, back, tags = [] }) {
    if (!id) throw new Error('Flashcard entity requires an id.');
    if (!topicId) throw new Error('Flashcard entity requires a topicId.');
    if (!front) throw new Error('Flashcard entity requires front text.');
    if (!back) throw new Error('Flashcard entity requires back text.');

    this.id = id;
    this.topicId = topicId;
    this.front = front;
    this.back = back;
    this.tags = Array.isArray(tags) ? tags : [];
  }
}

export default Flashcard;
