export class ExportJob {
  constructor({
    id,
    userId,
    status = 'pending', // 'pending' | 'completed' | 'failed'
    format, // 'JSON' | 'Markdown' | 'PDF' | 'CSV'
    downloadUrl = null,
    timestamp = new Date()
  }) {
    this.id = id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.status = status;
    this.format = format;
    this.downloadUrl = downloadUrl;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      format: this.format,
      downloadUrl: this.downloadUrl,
      timestamp: this.timestamp.toISOString()
    };
  }
}
export default ExportJob;
