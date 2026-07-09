export class IExportRepository {
  async getExportJobs(uid) {
    throw new Error('Not implemented.');
  }

  async saveExportJob(uid, job) {
    throw new Error('Not implemented.');
  }
}
export default IExportRepository;
