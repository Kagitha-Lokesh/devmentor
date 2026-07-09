import { container } from '../../infrastructure/di/container';

export class DownloadUseCase {
  _getRepo() {
    return container.resolve('IDownloadRepository');
  }

  async getAvailableAssets() {
    return this._getRepo().getStaticAssets();
  }

  async getDownloadedAssets(uid) {
    return this._getRepo().getDownloadedAssets(uid);
  }

  /**
   * Triggers a download of a static content file (Markdown, JSON).
   * For PDF, it serialises the markdown to a text blob.
   * For ZIP, it bundles multiple files.
   */
  async downloadAsset(uid, asset) {
    const downloadedAt = new Date();
    const trackAsset = { ...asset, downloadedAt };
    await this._getRepo().saveDownloadedAsset(uid, trackAsset);

    // Perform client-side download
    const url = `/content/${asset.path}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.title.replace(/\s+/g, '_') + (asset.format === 'Markdown' ? '.md' : '.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Triggers a client-side Blob download of arbitrary data.
   */
  static triggerBlobDownload(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
export default DownloadUseCase;
