import { localDB } from './indexedDB';
import { db } from '../../infrastructure/firebase/config';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { container } from '../../infrastructure/di/container';

class SyncQueue {
  constructor() {
    this.syncingUids = new Set();
    this.activeUid = null;
    this.debounceTimers = new Map();

    // Listen to network transitions
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.activeUid) {
          this.processSync(this.activeUid);
        }
      });
    }
  }

  clearDebounceTimers() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  setUid(uid) {
    this.clearDebounceTimers();
    this.activeUid = uid;
    if (uid && navigator.onLine) {
      // Trigger async processing
      this.processSync(uid);
    }
  }

  _getQueueKey(uid) {
    return `pending_mutations_${uid}`;
  }

  async getQueue(uid) {
    if (!uid) return [];
    const list = await localDB.get('executionCache', this._getQueueKey(uid));
    return Array.isArray(list) ? list : [];
  }

  async saveQueue(uid, list) {
    if (!uid) return;
    await localDB.put('executionCache', this._getQueueKey(uid), list);
  }

  async enqueue(type, uid, data) {
    let finalType = type;
    let finalUid = uid;
    let finalData = data;
    
    // Support single-object calls (e.g. from project progress repository)
    if (typeof type === 'object' && uid === undefined && data === undefined) {
      finalType = type.type;
      finalUid = type.uid;
      finalData = type;
    }

    if (!finalUid) return;

    const queue = await this.getQueue(finalUid);
    
    const enrichedItem = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: finalType,
      uid: finalUid,
      data: finalData,
      createdAt: Date.now(),
      retryCount: 0,
      lastAttempt: null,
      status: 'pending'
    };

    queue.push(enrichedItem);
    await this.saveQueue(finalUid, queue);

    if (navigator.onLine) {
      if (this.debounceTimers.has(finalUid)) {
        clearTimeout(this.debounceTimers.get(finalUid));
      }
      const timer = setTimeout(() => {
        this.processSync(finalUid);
        this.debounceTimers.delete(finalUid);
      }, 1000);
      this.debounceTimers.set(finalUid, timer);
    }
  }

  async commitMutation(item) {
    const env = container.resolve('environment');
    if (env.isMock) return true;

    try {
      await this._applyMutationToDoc(db, item);
      return true;
    } catch (err) {
      const code = err.code || '';
      const isAuthError = code === 'permission-denied' || code === 'unauthenticated' || err.message?.toLowerCase().includes('permission');
      if (isAuthError) {
        console.warn(`[SyncQueue] Authorization failed for mutation ${item.id}. Discarding from queue.`, err);
        return 'discard';
      }
      throw err; // throw transient error to trigger retry & backoff
    }
  }

  _applyMutationToDoc(batchOrDb, item) {
    const { type, uid, data } = item;
    const isBatch = typeof batchOrDb.commit === 'function';
    
    const set = (docRef, payload, options = {}) => {
      if (isBatch) {
        batchOrDb.set(docRef, payload, options);
      } else {
        return setDoc(docRef, payload, options);
      }
    };

    const del = (docRef) => {
      if (isBatch) {
        batchOrDb.delete(docRef);
      } else {
        return deleteDoc(docRef);
      }
    };
    
    if (type === 'progress') {
      const docRef = doc(db, 'users', uid, 'progress', data.topicId);
      return set(docRef, {
        ...data,
        lastActivity: data.lastActivity instanceof Date ? data.lastActivity.toISOString() : data.lastActivity
      }, { merge: true });
    } else if (type === 'mastery') {
      const docRef = doc(db, 'users', uid, 'mastery', data.topicId);
      return set(docRef, {
        ...data,
        lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated.toISOString() : data.lastUpdated
      }, { merge: true });
    } else if (type === 'activity') {
      const docRef = doc(db, 'users', uid, 'activity', data.id);
      return set(docRef, {
        ...data,
        timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp
      });
    } else if (type === 'revision') {
      const { subtype, ...restData } = data;
      if (subtype === 'card') {
        const docRef = doc(db, 'users', uid, 'revision', restData.flashcardId);
        return set(docRef, restData, { merge: true });
      } else if (subtype === 'session') {
        const docRef = doc(db, 'users', uid, 'revisionHistory', restData.id);
        return set(docRef, restData);
      } else if (subtype === 'stats') {
        const docRef = doc(db, 'users', uid, 'revisionAnalytics', 'summary');
        return set(docRef, restData, { merge: true });
      }
    } else if (type === 'interview') {
      const { subtype, ...restData } = data;
      if (subtype === 'session') {
        const docRef = doc(db, 'users', uid, 'interviewSessions', restData.id);
        return set(docRef, restData);
      } else if (subtype === 'stats') {
        const docRef = doc(db, 'users', uid, 'interviewStatistics', 'summary');
        return set(docRef, restData, { merge: true });
      } else if (subtype === 'bookmark') {
        const docRef = doc(db, 'users', uid, 'interviewBookmarks', restData.questionId);
        if (restData.deleted) {
          return del(docRef);
        } else {
          return set(docRef, restData);
        }
      }
    } else if (type === 'assistant') {
      const { subtype, ...restData } = data;
      if (subtype === 'preferences') {
        const docRef = doc(db, 'users', uid, 'assistantPreferences', 'settings');
        return set(docRef, restData, { merge: true });
      } else if (subtype === 'conversationMetadata') {
        const docRef = doc(db, 'users', uid, 'assistantConversations', restData.id);
        return set(docRef, restData, { merge: true });
      } else if (subtype === 'deleteConversation') {
        const docRef = doc(db, 'users', uid, 'assistantConversations', restData.id);
        return del(docRef);
      }
    } else if (type === 'projectProgress') {
      const { action, payload, projectId } = data || {};
      const docRef = doc(db, 'users', uid, 'projectProgress', projectId || data?.projectId);
      if (action === 'reset') {
        return set(docRef, payload);
      } else {
        return set(docRef, payload, { merge: true });
      }
    } else if (type === 'notes') {
      const docRef = doc(db, 'users', uid, 'notes', data.id);
      if (data.deleted) {
        return del(docRef);
      } else {
        return set(docRef, data, { merge: true });
      }
    } else if (type === 'bookmarks') {
      const docRef = doc(db, 'users', uid, 'bookmarks', data.id);
      if (data.deleted) {
        return del(docRef);
      } else {
        return set(docRef, data, { merge: true });
      }
    } else if (type === 'timeline') {
      const docRef = doc(db, 'users', uid, 'timeline', data.id);
      return set(docRef, data);
    } else if (type === 'achievements') {
      const docRef = doc(db, 'users', uid, 'achievements', data.id);
      return set(docRef, data, { merge: true });
    } else if (type === 'calendar') {
      const docRef = doc(db, 'users', uid, 'calendar', data.id);
      if (data.deleted) {
        return del(docRef);
      } else {
        return set(docRef, data, { merge: true });
      }
    } else if (type === 'downloads') {
      const docRef = doc(db, 'users', uid, 'downloads', data.id);
      return set(docRef, data, { merge: true });
    } else if (type === 'exports') {
      const docRef = doc(db, 'users', uid, 'exports', data.id);
      return set(docRef, data, { merge: true });
    }
  }

  async processSync(uid) {
    if (!uid) return;
    if (this.syncingUids.has(uid) || !navigator.onLine) return;
    this.syncingUids.add(uid);

    const logger = container.resolve('ILogger');
    const env = container.resolve('environment');

    try {
      const queue = await this.getQueue(uid);
      const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'retry');
      
      if (pendingItems.length === 0) {
        return;
      }

      logger.info(`[SyncQueue] Syncing ${pendingItems.length} items for user ${uid}.`);

      if (env.isMock) {
        const remainingQueue = queue.filter(item => !pendingItems.some(pi => pi.id === item.id));
        await this.saveQueue(uid, remainingQueue);
        return;
      }

      // Try batch commit first
      const batch = writeBatch(db);
      pendingItems.forEach((item) => {
        this._applyMutationToDoc(batch, item);
      });

      try {
        await batch.commit();
        logger.info(`[SyncQueue] Successfully batch synced ${pendingItems.length} mutations.`);
        const remainingQueue = queue.filter(item => !pendingItems.some(pi => pi.id === item.id));
        await this.saveQueue(uid, remainingQueue);
      } catch (batchError) {
        logger.warn(`[SyncQueue] Batch commit failed. Falling back to individual processing.`, batchError);
        
        let hasChanges = false;
        const activeQueue = await this.getQueue(uid); // fresh load
        
        for (const item of activeQueue) {
          if (item.status === 'pending' || item.status === 'retry') {
            const backoff = Math.pow(2, item.retryCount || 0) * 1000;
            if (item.lastAttempt && (Date.now() - item.lastAttempt < backoff)) {
              continue; // skip item due to active exponential backoff
            }

            item.lastAttempt = Date.now();
            
            try {
              const res = await this.commitMutation(item);
              if (res === true) {
                item.status = 'synced';
                hasChanges = true;
              } else if (res === 'discard') {
                item.status = 'failed_unauthorized';
                hasChanges = true;
              }
            } catch (singleError) {
              item.retryCount = (item.retryCount || 0) + 1;
              if (item.retryCount >= 4) {
                logger.error(`[SyncQueue] Mutation ${item.id} exceeded max retries. Marking failed.`, singleError);
                item.status = 'failed_max_retries';
              } else {
                item.status = 'retry';
              }
              hasChanges = true;
            }
          }
        }
        
        if (hasChanges) {
          const cleanedQueue = activeQueue.filter(item => 
            item.status !== 'synced' && 
            item.status !== 'failed_unauthorized' && 
            item.status !== 'failed_max_retries'
          );
          await this.saveQueue(uid, cleanedQueue);
        }
      }
    } catch (err) {
      logger.error('[SyncQueue] Fatal error during sync:', err);
    } finally {
      this.syncingUids.delete(uid);
    }
  }
}

export const syncQueue = new SyncQueue();
export default syncQueue;
