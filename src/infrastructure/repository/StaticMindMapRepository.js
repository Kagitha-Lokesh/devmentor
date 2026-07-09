import { IMindMapRepository } from '../../domain/repository/IMindMapRepository';
import { MindMap } from '../../domain/models/MindMap';
import { localDB } from '../../shared/utils/indexedDB';
import mmIndex from '../../shared/generated/mindmap-index.json';

export class StaticMindMapRepository extends IMindMapRepository {
  async getMindMap(topicId) {
    // 1. Check local IndexedDB cache first
    const cached = await localDB.get('mindMapCache', topicId);
    if (cached) {
      return new MindMap(cached);
    }

    // 2. Resolve topic path using build-time generated index
    const match = mmIndex.find((item) => item.topicId === topicId || item.slug === topicId);
    if (!match) {
      return null;
    }

    try {
      const response = await fetch(`/content/${match.path}`);
      if (!response.ok) {
        throw new Error(`Failed to load mindmap resources at: ${match.path}`);
      }
      
      const rawData = await response.json();
      const mindMap = new MindMap({
        topicId: match.topicId,
        slug: match.slug,
        title: rawData.title || match.title,
        nodes: rawData.nodes || []
      });

      // Cache raw object in IndexedDB
      await localDB.put('mindMapCache', match.topicId, {
        topicId: match.topicId,
        slug: match.slug,
        title: mindMap.title,
        nodes: mindMap.nodes
      });
      
      return mindMap;
    } catch (err) {
      console.warn(`[StaticMindMapRepository] Fetch failed for topic ${topicId}:`, err);
      return null;
    }
  }
}

export default StaticMindMapRepository;
