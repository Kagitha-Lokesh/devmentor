import { localDB } from './indexedDB';
import { db } from '../../infrastructure/firebase/config';
import { doc, writeBatch } from 'firebase/firestore';
import { container } from '../../infrastructure/di/container';

class SyncQueue {
  constructor() {
    this.keyName = 'pending_mutations';
    this.isSyncing = false;

    // Listen to network transitions
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processSync());
    }
  }

  async getQueue() {
    const list = await localDB.get('executionCache', this.keyName);
    return Array.isArray(list) ? list : [];
  }

  async saveQueue(list) {
    await localDB.put('executionCache', this.keyName, list);
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

    const queue = await this.getQueue();
    queue.push({
      id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: finalType,
      uid: finalUid,
      data: finalData,
      timestamp: Date.now()
    });
    await this.saveQueue(queue);

    if (navigator.onLine) {
      this.processSync();
    }
  }

  async processSync() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      const env = container.resolve('environment');
      const logger = container.resolve('ILogger');
      logger.info(`[SyncQueue] Processing reconnect batch sync: ${queue.length} items.`);

      if (env.isMock) {
        // In mock mode, simply clear queue as localStorage is synchronously updated
        await this.saveQueue([]);
        this.isSyncing = false;
        return;
      }

      const batch = writeBatch(db);
      
      queue.forEach((item) => {
        const { type, uid, data } = item;
        
        if (type === 'progress') {
          const docRef = doc(db, 'users', uid, 'progress', data.topicId);
          batch.set(docRef, {
            ...data,
            lastActivity: data.lastActivity instanceof Date ? data.lastActivity.toISOString() : data.lastActivity
          }, { merge: true });
        } else if (type === 'mastery') {
          const docRef = doc(db, 'users', uid, 'mastery', data.topicId);
          batch.set(docRef, {
            ...data,
            lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated.toISOString() : data.lastUpdated
          }, { merge: true });
        } else if (type === 'activity') {
          const docRef = doc(db, 'users', uid, 'activity', data.id);
          batch.set(docRef, {
            ...data,
            timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp
          });
        } else if (type === 'revision') {
          const { subtype, ...restData } = data;
          if (subtype === 'card') {
            const docRef = doc(db, 'users', uid, 'revision', restData.flashcardId);
            batch.set(docRef, restData, { merge: true });
          } else if (subtype === 'session') {
            const docRef = doc(db, 'users', uid, 'revisionHistory', restData.id);
            batch.set(docRef, restData);
          } else if (subtype === 'stats') {
            const docRef = doc(db, 'users', uid, 'revisionAnalytics', 'summary');
            batch.set(docRef, restData, { merge: true });
          }
        } else if (type === 'interview') {
          const { subtype, ...restData } = data;
          if (subtype === 'session') {
            const docRef = doc(db, 'users', uid, 'interviewSessions', restData.id);
            batch.set(docRef, restData);
          } else if (subtype === 'stats') {
            const docRef = doc(db, 'users', uid, 'interviewStatistics', 'summary');
            batch.set(docRef, restData, { merge: true });
          } else if (subtype === 'bookmark') {
            const docRef = doc(db, 'users', uid, 'interviewBookmarks', restData.questionId);
            if (restData.deleted) {
              batch.delete(docRef);
            } else {
              batch.set(docRef, restData);
            }
          }
        } else if (type === 'assistant') {
          const { subtype, ...restData } = data;
          if (subtype === 'preferences') {
            const docRef = doc(db, 'users', uid, 'assistantPreferences', 'settings');
            batch.set(docRef, restData, { merge: true });
          } else if (subtype === 'conversationMetadata') {
            const docRef = doc(db, 'users', uid, 'assistantConversations', restData.id);
            batch.set(docRef, restData, { merge: true });
          } else if (subtype === 'deleteConversation') {
            const docRef = doc(db, 'users', uid, 'assistantConversations', restData.id);
            batch.delete(docRef);
          }
        } else if (type === 'projectProgress') {
          const { action, payload, projectId } = data || {};
          const docRef = doc(db, 'users', uid, 'projectProgress', projectId || data?.projectId);
          if (action === 'reset') {
            batch.set(docRef, payload);
          } else {
            batch.set(docRef, payload, { merge: true });
          }
        } else if (type === 'notes') {
          const docRef = doc(db, 'users', uid, 'notes', data.id);
          if (data.deleted) {
            batch.delete(docRef);
          } else {
            batch.set(docRef, data, { merge: true });
          }
        } else if (type === 'bookmarks') {
          const docRef = doc(db, 'users', uid, 'bookmarks', data.id);
          if (data.deleted) {
            batch.delete(docRef);
          } else {
            batch.set(docRef, data, { merge: true });
          }
        } else if (type === 'timeline') {
          const docRef = doc(db, 'users', uid, 'timeline', data.id);
          batch.set(docRef, data);
        } else if (type === 'achievements') {
          const docRef = doc(db, 'users', uid, 'achievements', data.id);
          batch.set(docRef, data, { merge: true });
        } else if (type === 'calendar') {
          const docRef = doc(db, 'users', uid, 'calendar', data.id);
          if (data.deleted) {
            batch.delete(docRef);
          } else {
            batch.set(docRef, data, { merge: true });
          }
        } else if (type === 'downloads') {
          const docRef = doc(db, 'users', uid, 'downloads', data.id);
          batch.set(docRef, data, { merge: true });
        } else if (type === 'exports') {
          const docRef = doc(db, 'users', uid, 'exports', data.id);
          batch.set(docRef, data, { merge: true });
        }
      });

      await batch.commit();
      logger.info('[SyncQueue] Firestore batch synchronization completed successfully.');

      // Clear synced mutations from IndexedDB queue
      await this.saveQueue([]);
    } catch (err) {
      console.warn('[SyncQueue] Batch synchronization failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncQueue = new SyncQueue();
export default syncQueue;
