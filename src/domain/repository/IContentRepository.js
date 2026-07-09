/**
 * IContentRepository Interface
 * Contract for fetching static content resources (lesson, revision, examples, quizzes, etc.)
 */
export class IContentRepository {
  async loadLesson(topic) {
    throw new Error('Method not implemented: loadLesson');
  }
}
export default IContentRepository;
