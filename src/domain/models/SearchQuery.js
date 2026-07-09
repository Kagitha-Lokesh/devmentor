export class SearchQuery {
  constructor({ query = '', filters = {} } = {}) {
    this.query = query;
    this.filters = {
      difficulty: filters.difficulty || null, // 'Beginner' | 'Intermediate' | 'Advanced'
      technology: filters.technology || null, // Array or string
      track: filters.track || null,
      company: filters.company || null,
      completionStatus: filters.completionStatus || null, // 'completed' | 'in_progress' | 'not_started'
      category: filters.category || null,
      type: filters.type || null, // 'course' | 'topic' | 'problem' | 'flashcard' | 'interview_question' | 'project'
      estimatedTime: filters.estimatedTime || null,
      favorites: filters.favorites || false,
      bookmarks: filters.bookmarks || false
    };
  }
}
export default SearchQuery;
