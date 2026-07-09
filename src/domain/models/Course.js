export class Course {
  constructor({ id, title, description = '', volumes = [] }) {
    if (!id) throw new Error('Course requires an id.');
    if (!title) throw new Error('Course requires a title.');

    this.id = id;
    this.title = title;
    this.description = description;
    this.volumes = volumes;
  }
}
