import { container } from '../../infrastructure/di/container';
import { Result } from '../../shared/result/Result';

export class ContentLoaderUseCase {
  constructor() {
    this.contentRepo = container.resolve('IContentRepository');
    this.logger = container.resolve('ILogger');
  }

  async loadLessonContent(topic) {
    this.logger.info(`Orchestrating content loading for topic: ${topic.id}`);
    try {
      const lesson = await this.contentRepo.loadLesson(topic);
      return Result.success(lesson);
    } catch (err) {
      this.logger.error(`Error loading content for topic ${topic.id}: ${err.message}`, err);
      return Result.failure(err);
    }
  }
}
export default ContentLoaderUseCase;
