/**
 * ICourseRepository Interface
 * Contract for querying the curriculum, volumes, chapters, and topics.
 */
export class ICourseRepository {
  async getCourse(courseId) {
    throw new Error('Method not implemented: getCourse');
  }

  async listCourses() {
    throw new Error('Method not implemented: listCourses');
  }

  async getTopicBySlug(courseId, topicSlug) {
    throw new Error('Method not implemented: getTopicBySlug');
  }
}
export default ICourseRepository;
