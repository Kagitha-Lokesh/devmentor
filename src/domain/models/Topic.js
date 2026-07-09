export class Topic {
  constructor({
    id,
    slug,
    title,
    description = '',
    estimatedMinutes = 10,
    difficulty = 'Beginner',
    prerequisites = [],
    nextTopics = [],
    tags = [],
    paths = {}
  }) {
    if (!id) throw new Error('Topic requires an id.');
    if (!slug) throw new Error('Topic requires a slug.');
    if (!title) throw new Error('Topic requires a title.');

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.estimatedMinutes = estimatedMinutes;
    this.difficulty = difficulty;
    this.prerequisites = prerequisites;
    this.nextTopics = nextTopics;
    this.tags = tags;
    this.paths = paths; // Contains keys: lesson, examples, revision, cheatsheet, quiz, flashcards, interview
  }
}
