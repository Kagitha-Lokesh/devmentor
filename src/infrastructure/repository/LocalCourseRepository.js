import registry from '../../shared/generated/content-registry.json';
import { Course } from '../../domain/models/Course';
import { Volume } from '../../domain/models/Volume';
import { Chapter } from '../../domain/models/Chapter';
import { Topic } from '../../domain/models/Topic';
import { ICourseRepository } from '../../domain/repository/ICourseRepository';

export class LocalCourseRepository extends ICourseRepository {
  async getCourse(courseId) {
    const courseData = registry.courses[courseId];
    if (!courseData) return null;

    const volumes = courseData.volumes.map(v => {
      const chapters = v.chapters.map(c => {
        const topics = c.topics.map(t => new Topic(t));
        return new Chapter({ ...c, topics });
      });
      return new Volume({ ...v, chapters });
    });

    return new Course({ ...courseData, volumes });
  }

  async listCourses() {
    const courses = [];
    for (const key in registry.courses) {
      const course = await this.getCourse(key);
      if (course) courses.push(course);
    }
    return courses;
  }

  async getTopicBySlug(courseId, topicSlug) {
    const course = await this.getCourse(courseId);
    if (!course) return null;

    for (const vol of course.volumes) {
      for (const chap of vol.chapters) {
        for (const topic of chap.topics) {
          if (topic.slug === topicSlug) {
            return topic;
          }
        }
      }
    }
    return null;
  }
}
export default LocalCourseRepository;
