import { db } from '../firebase/config';
import { collection, doc, getDocs } from 'firebase/firestore';
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

  _storeKey(uid, bookmarkId) {
    return `${uid}_${bookmarkId}`;
  }

  async getBookmark(uid, bookmarkId) {
    const cached = await localDB.get('bookmarks', this._storeKey(uid, bookmarkId));
    if (cached && cached.userId === uid) {
      return new Bookmark(cached);
    }
    return null;
  }

  async listBookmarks(uid) {
    const userBookmarks = await localDB.getAllByPrefix('bookmarks', uid);
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
        await localDB.put('bookmarks', this._storeKey(uid, bookmark.id), bookmark.toJSON());
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
    await localDB.put('bookmarks', this._storeKey(uid, bookmark.id), data);
    await syncQueue.enqueue('bookmarks', uid, data);
  }

  async deleteBookmark(uid, bookmarkId) {
    const compositeKey = this._storeKey(uid, bookmarkId);
    const cached = await localDB.get('bookmarks', compositeKey);
    if (cached) {
      await localDB.delete('bookmarks', compositeKey);
      await syncQueue.enqueue('bookmarks', uid, { id: bookmarkId, deleted: true });
    }
  }
}
export default BookmarkRepository;
