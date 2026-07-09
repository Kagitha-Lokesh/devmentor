export class IDownloadRepository {
  async getStaticAssets() {
    throw new Error('Not implemented.');
  }

  async getDownloadedAssets(uid) {
    throw new Error('Not implemented.');
  }

  async saveDownloadedAsset(uid, asset) {
    throw new Error('Not implemented.');
  }
}
export default IDownloadRepository;
