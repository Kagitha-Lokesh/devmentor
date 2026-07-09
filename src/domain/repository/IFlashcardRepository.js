/**
 * Interface contract for fetching static course/topic flashcards.
 */
export class IFlashcardRepository {
  /**
   * Fetch all static flashcards for a specific topic.
   * @param {string} topicId - Topic ID
   * @returns {Promise<Flashcard[]>}
   */
  async getFlashcardsByTopic(topicId) {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch a single flashcard by topic and card ID.
   * @param {string} topicId - Topic ID
   * @param {string} id - Flashcard ID
   * @returns {Promise<Flashcard|null>}
   */
  async getFlashcardById(topicId, id) {
    throw new Error('Not implemented.');
  }
}

export default IFlashcardRepository;
