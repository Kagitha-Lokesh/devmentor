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

  async getStaticAssets() {
    return downloadIndex.map(d => new DownloadAsset(d));
  }

  async getDownloadedAssets(uid) {
    try {
      const dbInstance = await localDB.open();
      const all = await new Promise((resolve) => {
        const tx = dbInstance.transaction('downloads', 'readonly');
        const store = tx.objectStore('downloads');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      return all.filter(a => a.uid === uid).map(a => new DownloadAsset(a));
    } catch {
      return [];
    }
  }

  async saveDownloadedAsset(uid, asset) {
    const data = { ...asset.toJSON(), uid };
    await localDB.put('downloads', asset.id, data);
    await syncQueue.enqueue('downloads', uid, data);
  }
}
export default DownloadRepository;
