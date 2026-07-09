import { container } from '../../infrastructure/di/container';
import { Result } from '../../shared/result/Result';

export class CourseUseCase {
  constructor() {
    this.courseRepo = container.resolve('ICourseRepository');
    this.logger = container.resolve('ILogger');
  }

  async getCourseDetails(courseId) {
    this.logger.info(`Fetching course details for: ${courseId}`);
    try {
      const course = await this.courseRepo.getCourse(courseId);
      if (!course) {
        return Result.empty();
      }
      return Result.success(course);
    } catch (err) {
      this.logger.error(`Error loading course details for ${courseId}: ${err.message}`, err);
      return Result.failure(err);
    }
  }

  async getTopicBySlug(courseId, topicSlug) {
    this.logger.info(`Fetching topic for slug: ${topicSlug}`);
    try {
      const topic = await this.courseRepo.getTopicBySlug(courseId, topicSlug);
      if (!topic) {
        return Result.empty();
      }
      return Result.success(topic);
    } catch (err) {
      this.logger.error(`Error fetching topic for slug ${topicSlug}: ${err.message}`, err);
      return Result.failure(err);
    }
  }
}
export default CourseUseCase;
