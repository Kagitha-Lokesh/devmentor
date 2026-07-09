import { ICheatSheetRepository } from '../../domain/repository/ICheatSheetRepository';
import { CheatSheet } from '../../domain/models/CheatSheet';
import registry from '../../shared/generated/content-registry.json';
import revisionIndex from '../../shared/generated/revision-index.json';

export class StaticCheatSheetRepository extends ICheatSheetRepository {
  async getCheatSheet(topicId) {
    // 1. Confirm topic has cheatsheet from revisionIndex
    const match = revisionIndex.find((r) => r.topicId === topicId || r.slug === topicId);
    if (!match || !match.hasCheatSheet) {
      return null;
    }

    // 2. Resolve cheatsheet path from registry
    let foundPath = null;
    let title = '';
    let slug = '';
    
    for (const courseId in registry.courses) {
      const course = registry.courses[courseId];
      for (const vol of course.volumes) {
        for (const chap of vol.chapters) {
          const topic = chap.topics.find((t) => t.id === topicId || t.slug === topicId);
          if (topic) {
            foundPath = topic.paths.cheatsheet;
            title = topic.title;
            slug = topic.slug;
            break;
          }
        }
        if (foundPath) break;
      }
      if (foundPath) break;
    }

    if (!foundPath) {
      return null;
    }

    return new CheatSheet({
      topicId: match.topicId,
      slug,
      title,
      markdownPath: `/content/${foundPath}`
    });
  }
}

export default StaticCheatSheetRepository;
