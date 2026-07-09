export class Recommendation {
  constructor({
    type, // 'WeakTopicRefresher' | 'PrerequisiteBlock' | 'ContinueLesson' | 'UnlockNext' | 'PracticeSuggestion'
    topicId,
    problemId = null,
    title,
    description,
    priority = 10
  }) {
    if (!type) throw new Error('Recommendation requires a type.');
    if (!topicId) throw new Error('Recommendation requires a topicId.');
    if (!title) throw new Error('Recommendation requires a title.');

    this.type = type;
    this.topicId = topicId;
    this.problemId = problemId;
    this.title = title;
    this.description = description;
    this.priority = priority; // Lower is higher priority
  }
}
export default Recommendation;
