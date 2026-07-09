import { IContentRepository } from '../../domain/repository/IContentRepository';
import { Lesson } from '../../domain/models/Lesson';
import { container } from '../di/container';

export class LocalContentRepository extends IContentRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
  }

  async _fetchText(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} when fetching text resource.`);
      }
      return await res.text();
    } catch (err) {
      this.logger.warn(`Failed to fetch text resource at ${url}: ${err.message}`);
      return ''; // Graceful empty fallback
    }
  }

  async _fetchJson(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} when fetching JSON resource.`);
      }
      return await res.json();
    } catch (err) {
      this.logger.warn(`Failed to fetch JSON resource at ${url}: ${err.message}`);
      return []; // Graceful empty fallback
    }
  }

  async loadLesson(topic) {
    const base = '/content';
    const paths = topic.paths;

    const [
      markdownContent,
      examplesContent,
      revisionContent,
      cheatsheetContent,
      flashcards,
      quiz,
      interview
    ] = await Promise.all([
      this._fetchText(`${base}/${paths.lesson}`),
      this._fetchText(`${base}/${paths.examples}`),
      this._fetchText(`${base}/${paths.revision}`),
      this._fetchText(`${base}/${paths.cheatsheet}`),
      this._fetchJson(`${base}/${paths.flashcards}`),
      this._fetchJson(`${base}/${paths.quiz}`),
      this._fetchJson(`${base}/${paths.interview}`)
    ]);

    return new Lesson({
      topicId: topic.id,
      markdownContent,
      examplesContent,
      revisionContent,
      cheatsheetContent,
      flashcards,
      quiz,
      interview
    });
  }
}
export default LocalContentRepository;
