import { container } from '../../infrastructure/di/container';
import { Bookmark } from '../../domain/models/Bookmark';

export class BookmarkUseCase {
  _getRepo() {
    return container.resolve('IBookmarkRepository');
  }

  async listBookmarks(uid) {
    return this._getRepo().listBookmarks(uid);
  }

  async addBookmark(uid, { targetType, targetId, title, folder, tags }) {
    const bookmark = new Bookmark({ userId: uid, targetType, targetId, title, folder: folder || 'General', tags: tags || [] });
    await this._getRepo().saveBookmark(uid, bookmark);
    return bookmark;
  }

  async removeBookmark(uid, bookmarkId) {
    return this._getRepo().deleteBookmark(uid, bookmarkId);
  }

  async toggleFavorite(uid, bookmarkId) {
    const bookmark = await this._getRepo().getBookmark(uid, bookmarkId);
    if (!bookmark) return null;
    bookmark.isFavorite = !bookmark.isFavorite;
    await this._getRepo().saveBookmark(uid, bookmark);
    return bookmark;
  }
}
export default BookmarkUseCase;
