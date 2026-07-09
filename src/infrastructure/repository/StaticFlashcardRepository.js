import { IFlashcardRepository } from '../../domain/repository/IFlashcardRepository';
import { Flashcard } from '../../domain/models/Flashcard';
import { localDB } from '../../shared/utils/indexedDB';
import fcIndex from '../../shared/generated/flashcard-index.json';

export class StaticFlashcardRepository extends IFlashcardRepository {
  async getFlashcardsByTopic(topicId) {
    // 1. Try local IndexedDB cache first (offline support)
    const cached = await localDB.get('flashcardCache', topicId);
    if (cached && Array.isArray(cached)) {
      return cached.map((c) => new Flashcard(c));
    }

    // 2. Resolve topic path using build-time generated index
    const match = fcIndex.find((item) => item.topicId === topicId);
    if (!match) {
      return [];
    }

    try {
      const response = await fetch(`/content/${match.path}`);
      if (!response.ok) {
        throw new Error(`Failed to load flashcard resources at: ${match.path}`);
      }
      
      const rawData = await response.json();
      const list = rawData.map((c) => new Flashcard({
        id: c.id,
        topicId,
        front: c.front,
        back: c.back,
        tags: c.tags || []
      }));

      // Cache raw objects in IndexedDB
      await localDB.put('flashcardCache', topicId, rawData);
      return list;
    } catch (err) {
      console.warn(`[StaticFlashcardRepository] Fetch failed for topic ${topicId}:`, err);
      return [];
    }
  }

  async getFlashcardById(topicId, id) {
    const list = await this.getFlashcardsByTopic(topicId);
    return list.find((fc) => fc.id === id) || null;
  }
}

export default StaticFlashcardRepository;
