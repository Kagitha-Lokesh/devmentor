import { ExportJob } from '../../domain/models/ExportJob';
import { IExportRepository } from '../../domain/repository/IExportRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class ExportRepository extends IExportRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
  }

  async getExportJobs(uid) {
    try {
      const dbInstance = await localDB.open();
      const all = await new Promise((resolve) => {
        const tx = dbInstance.transaction('exports', 'readonly');
        const store = tx.objectStore('exports');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      return all
        .filter(j => j.userId === uid)
        .map(j => new ExportJob(j))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async saveExportJob(uid, job) {
    job.userId = uid;
    const data = job.toJSON();
    await localDB.put('exports', job.id, data);
    await syncQueue.enqueue('exports', uid, data);
  }
}
export default ExportRepository;
