import { container } from '../../infrastructure/di/container';
import { ExportJob } from '../../domain/models/ExportJob';
import { DownloadUseCase } from '../downloads/DownloadUseCase';

export class ExportUseCase {
  _getRepo() {
    return container.resolve('IExportRepository');
  }

  async getExportHistory(uid) {
    return this._getRepo().getExportJobs(uid);
  }

  async exportProgress(uid, { format, progressData, label }) {
    const job = new ExportJob({ userId: uid, format, status: 'completed' });
    let content = '';
    let filename = `javamentor-${label || 'export'}-${Date.now()}`;

    if (format === 'JSON') {
      content = JSON.stringify(progressData, null, 2);
      filename += '.json';
      DownloadUseCase.triggerBlobDownload(content, filename, 'application/json');
    } else if (format === 'CSV') {
      if (Array.isArray(progressData)) {
        const headers = Object.keys(progressData[0] || {}).join(',');
        const rows = progressData.map(row => Object.values(row).join(','));
        content = [headers, ...rows].join('\n');
      } else {
        content = Object.entries(progressData).map(([k, v]) => `${k},${v}`).join('\n');
      }
      filename += '.csv';
      DownloadUseCase.triggerBlobDownload(content, filename, 'text/csv');
    } else if (format === 'Markdown') {
      if (Array.isArray(progressData)) {
        const headers = Object.keys(progressData[0] || {});
        const sep = headers.map(() => '---');
        const rows = progressData.map(row => Object.values(row).join(' | '));
        content = [`| ${headers.join(' | ')} |`, `| ${sep.join(' | ')} |`, ...rows.map(r => `| ${r} |`)].join('\n');
      } else {
        content = Object.entries(progressData).map(([k, v]) => `**${k}**: ${v}`).join('\n');
      }
      filename += '.md';
      DownloadUseCase.triggerBlobDownload(content, filename, 'text/markdown');
    }

    await this._getRepo().saveExportJob(uid, job);
    return job;
  }
}
export default ExportUseCase;
