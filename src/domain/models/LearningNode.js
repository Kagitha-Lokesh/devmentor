export class LearningNode {
  constructor({
    id,
    slug,
    title,
    description = '',
    difficulty,
    volume,
    chapter,
    prerequisites = [],
    nextTopics = [],
    tags = [],
    estimatedReadingTime = 15,
    estimatedPracticeTime = 20,
    estimatedRevisionTime = 8,
    interviewImportance = 3
  }) {
    if (!id) throw new Error('LearningNode requires an id.');
    if (!slug) throw new Error('LearningNode requires a slug.');
    if (!title) throw new Error('LearningNode requires a title.');
    if (!difficulty) throw new Error('LearningNode requires a difficulty.');

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.difficulty = difficulty; // { level, label, color }
    this.volume = volume;
    this.chapter = chapter;
    this.prerequisites = prerequisites;
    this.nextTopics = nextTopics;
    this.tags = tags;
    this.estimatedReadingTime = estimatedReadingTime;
    this.estimatedPracticeTime = estimatedPracticeTime;
    this.estimatedRevisionTime = estimatedRevisionTime;
    this.interviewImportance = interviewImportance;
  }
}
export default LearningNode;
