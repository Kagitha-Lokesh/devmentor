import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { InterviewSession } from '../../domain/models/InterviewSession';
import { InterviewStatistics } from '../../domain/models/InterviewStatistics';
import { IInterviewSessionRepository } from '../../domain/repository/IInterviewSessionRepository';
import { IInterviewStatisticsRepository } from '../../domain/repository/IInterviewStatisticsRepository';
import { container } from '../di/container';
import { syncQueue } from '../../shared/utils/syncQueue';

/**
 * Combined Firestore repository handling interview sessions, statistics, and bookmarks.
 * Implements both IInterviewSessionRepository and IInterviewStatisticsRepository.
 * Writes locally first (localStorage/IndexedDB), then enqueues to syncQueue for Firestore.
 */
export class FirestoreInterviewRepository extends IInterviewSessionRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  // ─── Cache Key Helpers ────────────────────────────────────────────────────
  _sessionsKey(uid) { return `cache_int_sessions_${uid}`; }
  _statsKey(uid) { return `cache_int_stats_${uid}`; }
  _bookmarksKey(uid) { return `cache_int_bookmarks_${uid}`; }

  // ─── Interview Sessions ───────────────────────────────────────────────────
  async getSession(uid, sessionId) {
    try {
      const cached = localStorage.getItem(this._sessionsKey(uid));
      if (cached) {
        const list = JSON.parse(cached);
        const found = list.find(s => s.id === sessionId);
        if (found) return new InterviewSession(found);
      }

      if (this.env.isMock || !navigator.onLine) return null;

      const docRef = doc(db, 'users', uid, 'interviewSessions', sessionId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return new InterviewSession(snap.data());
      }
      return null;
    } catch (err) {
      this.logger.error(`[FirestoreInterviewRepository] getSession error: ${err.message}`);
      return null;
    }
  }

  async saveSession(uid, session) {
    this.logger.info(`[FirestoreInterviewRepository] Saving interview session: ${session.id}`);

    // Write to local list cache
    let list = [];
    try {
      const cached = localStorage.getItem(this._sessionsKey(uid));
      list = cached ? JSON.parse(cached) : [];
    } catch {}

    const idx = list.findIndex(s => s.id === session.id);
    const serialized = {
      ...session,
      startedAt: session.startedAt instanceof Date ? session.startedAt.toISOString() : session.startedAt,
      completedAt: session.completedAt instanceof Date ? session.completedAt.toISOString() : session.completedAt
    };

    if (idx >= 0) {
      list[idx] = serialized;
    } else {
      list.unshift(serialized);
    }
    if (list.length > 50) list.pop();
    localStorage.setItem(this._sessionsKey(uid), JSON.stringify(list));

    // Sync to Firestore when online
    await syncQueue.enqueue('interview', uid, { subtype: 'session', ...serialized });
  }

  async listSessions(uid) {
    try {
      const cached = localStorage.getItem(this._sessionsKey(uid));
      if (cached) {
        return JSON.parse(cached).map(s => new InterviewSession(s));
      }

      if (this.env.isMock || !navigator.onLine) return [];

      const colRef = collection(db, 'users', uid, 'interviewSessions');
      const q = query(colRef, orderBy('startedAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push(new InterviewSession(docSnap.data()));
      });
      localStorage.setItem(this._sessionsKey(uid), JSON.stringify(list));
      return list;
    } catch (err) {
      this.logger.error(`[FirestoreInterviewRepository] listSessions error: ${err.message}`);
      return [];
    }
  }

  // ─── Interview Statistics ─────────────────────────────────────────────────
  async getStatistics(uid) {
    try {
      const cached = localStorage.getItem(this._statsKey(uid));
      if (cached) {
        return new InterviewStatistics(JSON.parse(cached));
      }

      if (this.env.isMock || !navigator.onLine) {
        return new InterviewStatistics({ userId: uid });
      }

      const docRef = doc(db, 'users', uid, 'interviewStatistics', 'summary');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const stats = new InterviewStatistics(snap.data());
        localStorage.setItem(this._statsKey(uid), JSON.stringify(stats));
        return stats;
      }
      return new InterviewStatistics({ userId: uid });
    } catch (err) {
      this.logger.error(`[FirestoreInterviewRepository] getStatistics error: ${err.message}`);
      return new InterviewStatistics({ userId: uid });
    }
  }

  async saveStatistics(uid, stats) {
    this.logger.info('[FirestoreInterviewRepository] Saving interview statistics.');
    localStorage.setItem(this._statsKey(uid), JSON.stringify(stats));
    await syncQueue.enqueue('interview', uid, { subtype: 'stats', ...stats });
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  async getBookmarks(uid) {
    try {
      const cached = localStorage.getItem(this._bookmarksKey(uid));
      if (cached) return JSON.parse(cached);

      if (this.env.isMock || !navigator.onLine) return [];

      const colRef = collection(db, 'users', uid, 'interviewBookmarks');
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach(docSnap => list.push(docSnap.data()));
      localStorage.setItem(this._bookmarksKey(uid), JSON.stringify(list));
      return list;
    } catch (err) {
      this.logger.error(`[FirestoreInterviewRepository] getBookmarks error: ${err.message}`);
      return [];
    }
  }

  async toggleBookmark(uid, questionId) {
    let bookmarks = [];
    try {
      const cached = localStorage.getItem(this._bookmarksKey(uid));
      bookmarks = cached ? JSON.parse(cached) : [];
    } catch {}

    const isBookmarked = bookmarks.some(b => b.questionId === questionId);
    if (isBookmarked) {
      bookmarks = bookmarks.filter(b => b.questionId !== questionId);
      await syncQueue.enqueue('interview', uid, { subtype: 'bookmark', questionId, deleted: true });
    } else {
      const entry = { questionId, createdAt: new Date().toISOString() };
      bookmarks.push(entry);
      await syncQueue.enqueue('interview', uid, { subtype: 'bookmark', questionId, ...entry });
    }
    localStorage.setItem(this._bookmarksKey(uid), JSON.stringify(bookmarks));
    return !isBookmarked;
  }
}

export default FirestoreInterviewRepository;
