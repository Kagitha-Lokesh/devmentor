export class IBookmarkRepository {
  async getBookmark(uid, bookmarkId) {
    throw new Error('Not implemented.');
  }

  async listBookmarks(uid) {
    throw new Error('Not implemented.');
  }

  async saveBookmark(uid, bookmark) {
    throw new Error('Not implemented.');
  }

  async deleteBookmark(uid, bookmarkId) {
    throw new Error('Not implemented.');
  }
}
export default IBookmarkRepository;
