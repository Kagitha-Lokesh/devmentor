import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { RevisionCard } from '../../domain/models/RevisionCard';
import { RevisionSession } from '../../domain/models/RevisionSession';
import { RevisionStatistics } from '../../domain/models/RevisionStatistics';
import { IRevisionRepository } from '../../domain/repository/IRevisionRepository';
import { container } from '../di/container';
import { syncQueue } from '../../shared/utils/syncQueue';

export class FirestoreRevisionRepository extends IRevisionRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _getCardCacheKey(uid, flashcardId) {
    return `cache_rev_card_${uid}_${flashcardId}`;
  }

  _getStatsCacheKey(uid) {
    return `cache_rev_stats_${uid}`;
  }

  _getSessionsCacheKey(uid) {
    return `cache_rev_sessions_list_${uid}`;
  }

  _saveCardLocalCache(uid, card) {
    localStorage.setItem(this._getCardCacheKey(uid, card.flashcardId), JSON.stringify(card));
  }

  async saveRevisionCard(uid, card) {
    this.logger.info(`[FirestoreRevisionRepository] Saving card review state to local cache & sync queue for card: ${card.flashcardId}`);
    
    // Save locally
    this._saveCardLocalCache(uid, card);

    // Sync queue enqueue
    await syncQueue.enqueue('revision', uid, {
      subtype: 'card',
      ...card,
      nextReviewDate: card.nextReviewDate instanceof Date ? card.nextReviewDate.toISOString() : card.nextReviewDate,
      lastReviewedAt: card.lastReviewedAt instanceof Date ? card.lastReviewedAt.toISOString() : card.lastReviewedAt
    });
  }

  async getRevisionCard(uid, flashcardId) {
    const cached = localStorage.getItem(this._getCardCacheKey(uid, flashcardId));
    if (cached) {
      try {
        return new RevisionCard(JSON.parse(cached));
      } catch {}
    }

    if (this.env.isMock || !navigator.onLine) {
      return null;
    }

    try {
      const docRef = doc(db, 'users', uid, 'revision', flashcardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const card = new RevisionCard({
          ...data,
          nextReviewDate: new Date(data.nextReviewDate),
          lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : null
        });
        this._saveCardLocalCache(uid, card);
        return card;
      }
      return null;
    } catch (err) {
      this.logger.error(`[FirestoreRevisionRepository] Error getting card ${flashcardId}: ${err.message}`, err);
      return null;
    }
  }

  async listRevisionCards(uid, topicId = null) {
    // Check locally by iterating storage keys
    const cards = [];
    const keyPrefix = `cache_rev_card_${uid}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        try {
          const cardData = JSON.parse(localStorage.getItem(key));
          const card = new RevisionCard({
            ...cardData,
            nextReviewDate: new Date(cardData.nextReviewDate),
            lastReviewedAt: cardData.lastReviewedAt ? new Date(cardData.lastReviewedAt) : null
          });
          if (!topicId || card.topicId === topicId) {
            cards.push(card);
          }
        } catch {}
      }
    }

    if (cards.length > 0) {
      return cards;
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const colRef = collection(db, 'users', uid, 'revision');
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const card = new RevisionCard({
          ...data,
          nextReviewDate: new Date(data.nextReviewDate),
          lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : null
        });
        this._saveCardLocalCache(uid, card);
        if (!topicId || card.topicId === topicId) {
          list.push(card);
        }
      });
      return list;
    } catch (err) {
      this.logger.error(`[FirestoreRevisionRepository] Error listing cards: ${err.message}`, err);
      return [];
    }
  }

  async saveRevisionSession(uid, session) {
    this.logger.info(`[FirestoreRevisionRepository] Saving session logs offline & queueing sync for: ${session.id}`);

    // Append to local sessions list
    let list = [];
    try {
      const cachedList = localStorage.getItem(this._getSessionsCacheKey(uid));
      list = cachedList ? JSON.parse(cachedList) : [];
    } catch {}
    list.unshift(session); // Add newest first
    if (list.length > 50) list.pop(); // Cap local history
    localStorage.setItem(this._getSessionsCacheKey(uid), JSON.stringify(list));

    // Sync queue
    await syncQueue.enqueue('revision', uid, {
      subtype: 'session',
      ...session,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt.toISOString()
    });
  }

  async listRevisionSessions(uid, limitCount = 50) {
    const cached = localStorage.getItem(this._getSessionsCacheKey(uid));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.slice(0, limitCount).map((s) => new RevisionSession(s));
      } catch {}
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const colRef = collection(db, 'users', uid, 'revisionHistory');
      const q = query(colRef, orderBy('completedAt', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const session = new RevisionSession({
          ...data,
          startedAt: new Date(data.startedAt),
          completedAt: new Date(data.completedAt)
        });
        list.push(session);
      });
      localStorage.setItem(this._getSessionsCacheKey(uid), JSON.stringify(list));
      return list;
    } catch (err) {
      this.logger.error(`[FirestoreRevisionRepository] Error listing sessions: ${err.message}`, err);
      return [];
    }
  }

  async getRevisionStatistics(uid) {
    const cached = localStorage.getItem(this._getStatsCacheKey(uid));
    if (cached) {
      try {
        return new RevisionStatistics(JSON.parse(cached));
      } catch {}
    }

    if (this.env.isMock || !navigator.onLine) {
      return new RevisionStatistics({ uid });
    }

    try {
      const docRef = doc(db, 'users', uid, 'revisionAnalytics', 'summary');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const stats = new RevisionStatistics({
          ...data,
          lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : null
        });
        localStorage.setItem(this._getStatsCacheKey(uid), JSON.stringify(stats));
        return stats;
      }
      return new RevisionStatistics({ uid });
    } catch (err) {
      this.logger.error(`[FirestoreRevisionRepository] Error getting statistics: ${err.message}`, err);
      return new RevisionStatistics({ uid });
    }
  }

  async saveRevisionStatistics(uid, stats) {
    this.logger.info(`[FirestoreRevisionRepository] Saving aggregate revision stats to cache & queue.`);
    
    // Save locally
    localStorage.setItem(this._getStatsCacheKey(uid), JSON.stringify(stats));

    // Sync queue
    await syncQueue.enqueue('revision', uid, {
      subtype: 'stats',
      ...stats,
      lastReviewedAt: stats.lastReviewedAt ? stats.lastReviewedAt.toISOString() : null
    });
  }
}

export default FirestoreRevisionRepository;
