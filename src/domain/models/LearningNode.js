/**
 * LearningNode — Domain model for a single curriculum topic.
 *
 * Represents a node in the knowledge graph with explicit curriculum
 * positioning fields (courseId, moduleId, volumeOrder, chapterOrder, topicOrder).
 *
 * These structural fields are set at build time from metadata.json and
 * are the authoritative source for routing, ordering, and progress tracking.
 * Tags are preserved for search, AI recommendations, and filtering only.
 */
export class LearningNode {
  constructor({
    id,
    slug,
    title,
    description = '',
    difficulty,
    // Curriculum structure — explicit, never inferred from tags
    courseId      = null,
    moduleId      = null,
    volumeOrder   = 1,
    chapterOrder  = 1,
    topicOrder    = 1,
    // Legacy fields (kept for backward compatibility)
    volume,
    chapter,
    // Graph data
    prerequisites = [],
    nextTopics    = [],
    tags          = [],
    paths         = {},
    // Time estimates
    estimatedReadingTime  = 15,
    estimatedPracticeTime = 20,
    estimatedRevisionTime = 8,
    interviewImportance   = 3
  }) {
    if (!id)         throw new Error('LearningNode requires an id.');
    if (!slug)       throw new Error('LearningNode requires a slug.');
    if (!title)      throw new Error('LearningNode requires a title.');
    if (!difficulty) throw new Error('LearningNode requires a difficulty.');

    this.id          = id;
    this.slug        = slug;
    this.title       = title;
    this.description = description;
    this.difficulty  = difficulty;

    // Curriculum structure
    this.courseId      = courseId;
    this.moduleId      = moduleId;
    this.volumeOrder   = typeof volumeOrder  === 'number' ? volumeOrder  : 1;
    this.chapterOrder  = typeof chapterOrder === 'number' ? chapterOrder : 1;
    this.topicOrder    = typeof topicOrder   === 'number' ? topicOrder   : 1;

    // Legacy volume/chapter (string form) — kept for backward compat
    this.volume  = volume;
    this.chapter = chapter;

    // Graph links
    this.prerequisites  = prerequisites;
    this.nextTopics     = nextTopics;
    this.tags           = tags;
    this.paths          = paths;

    // Time estimates (minutes)
    this.estimatedReadingTime  = estimatedReadingTime;
    this.estimatedPracticeTime = estimatedPracticeTime;
    this.estimatedRevisionTime = estimatedRevisionTime;
    this.interviewImportance   = interviewImportance;
  }
}

export default LearningNode;
