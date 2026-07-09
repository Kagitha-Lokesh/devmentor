import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Bookmark } from '../../domain/models/Bookmark';
import { IBookmarkRepository } from '../../domain/repository/IBookmarkRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class BookmarkRepository extends IBookmarkRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  async getBookmark(uid, bookmarkId) {
    const cached = await localDB.get('bookmarks', bookmarkId);
    if (cached && cached.userId === uid) {
      return new Bookmark(cached);
    }
    return null;
  }

  async listBookmarks(uid) {
    const all = await this._getAllLocalBookmarks();
    const userBookmarks = all.filter(b => b.userId === uid);
    if (userBookmarks.length > 0) {
      return userBookmarks.map(b => new Bookmark(b));
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const colRef = collection(db, 'users', uid, 'bookmarks');
      const snap = await getDocs(colRef);
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const bookmark = new Bookmark({ ...data, id: d.id, userId: uid });
        await localDB.put('bookmarks', bookmark.id, bookmark.toJSON());
        list.push(bookmark);
      }
      return list;
    } catch (err) {
      this.logger.warn(`Failed to sync bookmarks list from firestore: ${err.message}`);
      return [];
    }
  }

  async saveBookmark(uid, bookmark) {
    bookmark.userId = uid;
    const data = bookmark.toJSON();
    await localDB.put('bookmarks', bookmark.id, data);
    await syncQueue.enqueue('bookmarks', uid, data);
  }

  async deleteBookmark(uid, bookmarkId) {
    const cached = await localDB.get('bookmarks', bookmarkId);
    if (cached) {
      await localDB.delete('bookmarks', bookmarkId);
      await syncQueue.enqueue('bookmarks', uid, { id: bookmarkId, deleted: true });
    }
  }

  async _getAllLocalBookmarks() {
    try {
      const dbInstance = await localDB.open();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction('bookmarks', 'readonly');
        const store = transaction.objectStore('bookmarks');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}
export default BookmarkRepository;
