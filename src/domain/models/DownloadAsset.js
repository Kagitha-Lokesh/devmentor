export class DownloadAsset {
  constructor({
    id,
    title,
    type, // 'CheatSheet' | 'Flashcards' | 'RevisionNotes' | 'Resume' | 'Portfolio' | 'ProgressReport'
    format, // 'PDF' | 'Markdown' | 'JSON' | 'ZIP'
    path,
    sizeBytes = 0,
    downloadedAt = null
  }) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.format = format;
    this.path = path;
    this.sizeBytes = sizeBytes;
    this.downloadedAt = downloadedAt ? (downloadedAt instanceof Date ? downloadedAt : new Date(downloadedAt)) : null;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      format: this.format,
      path: this.path,
      sizeBytes: this.sizeBytes,
      downloadedAt: this.downloadedAt ? this.downloadedAt.toISOString() : null
    };
  }
}
export default DownloadAsset;
