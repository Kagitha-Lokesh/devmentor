import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Progress } from '../../domain/models/Progress';
import { IProgressRepository } from '../../domain/repository/IProgressRepository';
import { container } from '../di/container';
import { syncQueue } from '../../shared/utils/syncQueue';

export class FirestoreProgressRepository extends IProgressRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _getLocalCacheKey(uid, topicId) {
    return `cache_progress_${uid}_${topicId}`;
  }

  _getLocalListKey(uid) {
    return `cache_progress_list_${uid}`;
  }

  _saveLocalCache(uid, progress) {
    const key = this._getLocalCacheKey(uid, progress.topicId);
    localStorage.setItem(key, JSON.stringify(progress));

    // Append to local checklist keys
    const listKey = this._getLocalListKey(uid);
    let list = [];
    try {
      const listData = localStorage.getItem(listKey);
      list = listData ? JSON.parse(listData) : [];
    } catch {}
    if (!list.includes(progress.topicId)) {
      list.push(progress.topicId);
      localStorage.setItem(listKey, JSON.stringify(list));
    }
  }

  async saveProgress(uid, progress) {
    this.logger.info(`Saving topic progress to offline cache & sync queue for topic: ${progress.topicId}`);
    
    // Save to local cache instantly
    this._saveLocalCache(uid, progress);

    // Queue for Firestore batch updates
    await syncQueue.enqueue('progress', uid, progress);
  }

  async getProgress(uid, topicId) {
    // Attempt local cache fetch first (Zero-cost reads!)
    const localKey = this._getLocalCacheKey(uid, topicId);
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        return new Progress(JSON.parse(cached));
      } catch {}
    }

    if (this.env.isMock || !navigator.onLine) {
      return null;
    }

    try {
      const docRef = doc(db, 'users', uid, 'progress', topicId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const progress = new Progress({
          ...data,
          lastActivity: new Date(data.lastActivity)
        });
        this._saveLocalCache(uid, progress);
        return progress;
      }
      return null;
    } catch (err) {
      this.logger.error(`Error fetching progress from Firestore: ${err.message}`, err);
      return null;
    }
  }

  async listProgress(uid) {
    // Match local keys list
    const listKey = this._getLocalListKey(uid);
    let listIds = [];
    try {
      const listData = localStorage.getItem(listKey);
      listIds = listData ? JSON.parse(listData) : [];
    } catch {}

    if (listIds.length > 0) {
      const localList = [];
      listIds.forEach((id) => {
        const cached = localStorage.getItem(this._getLocalCacheKey(uid, id));
        if (cached) {
          try {
            localList.push(new Progress(JSON.parse(cached)));
          } catch {}
        }
      });
      return localList;
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const subColRef = collection(db, 'users', uid, 'progress');
      const querySnapshot = await getDocs(subColRef);
      
      const list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const progress = new Progress({
          ...data,
          lastActivity: new Date(data.lastActivity)
        });
        this._saveLocalCache(uid, progress);
        list.push(progress);
      });
      return list;
    } catch (err) {
      this.logger.error(`Failed to load progress list from Firestore: ${err.message}`, err);
      return [];
    }
  }
}
export default FirestoreProgressRepository;
