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

  _storeKey(uid, jobId) {
    return `${uid}_${jobId}`;
  }

  async getExportJobs(uid) {
    try {
      const userExports = await localDB.getAllByPrefix('exports', uid);
      return userExports
        .map(j => new ExportJob(j))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async saveExportJob(uid, job) {
    job.userId = uid;
    const data = job.toJSON();
    await localDB.put('exports', this._storeKey(uid, job.id), data);
    await syncQueue.enqueue('exports', uid, data);
  }
}
export default ExportRepository;
