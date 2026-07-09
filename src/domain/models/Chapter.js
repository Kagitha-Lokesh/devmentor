export class Chapter {
  constructor({ id, title, topics = [] }) {
    if (!id) throw new Error('Chapter requires an id.');
    if (!title) throw new Error('Chapter requires a title.');

    this.id = id;
    this.title = title;
    this.topics = topics;
  }
}
