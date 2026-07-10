import { DownloadAsset } from '../../domain/models/DownloadAsset';
import { IDownloadRepository } from '../../domain/repository/IDownloadRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';
import downloadIndex from '../../shared/generated/download-index.json';

export class DownloadRepository extends IDownloadRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
  }

  _storeKey(uid, assetId) {
    return `${uid}_${assetId}`;
  }

  async getStaticAssets() {
    return downloadIndex.map(d => new DownloadAsset(d));
  }

  async getDownloadedAssets(uid) {
    try {
      const userDownloads = await localDB.getAllByPrefix('downloads', uid);
      return userDownloads.map(a => new DownloadAsset(a));
    } catch {
      return [];
    }
  }

  async saveDownloadedAsset(uid, asset) {
    const data = { ...asset.toJSON(), uid };
    await localDB.put('downloads', this._storeKey(uid, asset.id), data);
    await syncQueue.enqueue('downloads', uid, data);
  }
}
export default DownloadRepository;
