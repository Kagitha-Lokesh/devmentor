export class Problem {
  constructor({
    id,
    slug,
    title,
    difficulty,
    topic,
    subtopic,
    estimatedMinutes = 20,
    companies = [],
    patterns = [],
    timeComplexity = '',
    spaceComplexity = '',
    prerequisites = [],
    related = [],
    next = [],
    interviewImportance = 3,
    paths = {}
  }) {
    if (!id) throw new Error('Problem requires an id.');
    if (!slug) throw new Error('Problem requires a slug.');
    if (!title) throw new Error('Problem requires a title.');
    if (!difficulty) throw new Error('Problem requires difficulty meta.');

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.difficulty = difficulty; // { level, label, color }
    this.topic = topic;
    this.subtopic = subtopic;
    this.estimatedMinutes = estimatedMinutes;
    this.companies = companies;
    this.patterns = patterns;
    this.timeComplexity = timeComplexity;
    this.spaceComplexity = spaceComplexity;
    this.prerequisites = prerequisites;
    this.related = related;
    this.next = next;
    this.interviewImportance = interviewImportance;
    this.paths = paths; // { problem, tests, hints, starter: [{ filename, language, path }] }
  }
}
export default Problem;
