/**
 * Value object representing a static cheatsheet resource.
 */
export class CheatSheet {
  /**
   * @param {object} params
   * @param {string} params.topicId - Reference topic ID
   * @param {string} params.slug - URL slug
   * @param {string} params.title - Cheat sheet title
   * @param {string} params.markdownPath - Path to load the markdown file from
   */
  constructor({ topicId, slug, title, markdownPath }) {
    if (!topicId) throw new Error('CheatSheet requires topicId.');
    if (!markdownPath) throw new Error('CheatSheet requires markdownPath.');

    this.topicId = topicId;
    this.slug = slug;
    this.title = title;
    this.markdownPath = markdownPath;
  }
}

export default CheatSheet;
