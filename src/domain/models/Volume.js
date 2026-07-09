export class Volume {
  constructor({ num, folder, title, chapters = [] }) {
    if (num === undefined || num === null) throw new Error('Volume requires a number.');
    if (!folder) throw new Error('Volume requires a folder name.');
    if (!title) throw new Error('Volume requires a title.');

    this.num = num;
    this.folder = folder;
    this.title = title;
    this.chapters = chapters;
  }
}
