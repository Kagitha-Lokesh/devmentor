import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Mastery } from '../../domain/models/Mastery';
import { IMasteryRepository } from '../../domain/repository/IMasteryRepository';
import { container } from '../di/container';
import { syncQueue } from '../../shared/utils/syncQueue';

export class FirestoreMasteryRepository extends IMasteryRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _getLocalCacheKey(uid, topicId) {
    return `cache_mastery_${uid}_${topicId}`;
  }

  _getLocalListKey(uid) {
    return `cache_mastery_list_${uid}`;
  }

  _saveLocalCache(uid, mastery) {
    const key = this._getLocalCacheKey(uid, mastery.topicId);
    localStorage.setItem(key, JSON.stringify(mastery));

    // Append to local checklist keys
    const listKey = this._getLocalListKey(uid);
    let list = [];
    try {
      const listData = localStorage.getItem(listKey);
      list = listData ? JSON.parse(listData) : [];
    } catch {}
    if (!list.includes(mastery.topicId)) {
      list.push(mastery.topicId);
      localStorage.setItem(listKey, JSON.stringify(list));
    }
  }

  async saveMastery(uid, mastery) {
    this.logger.info(`Saving topic mastery to cache & queue for topic: ${mastery.topicId}`);
    
    // Save to local cache instantly
    this._saveLocalCache(uid, mastery);

    // Queue for Firestore batch updates
    await syncQueue.enqueue('mastery', uid, mastery);
  }

  async getMastery(uid, topicId) {
    // Attempt local cache fetch first (Zero-cost reads!)
    const localKey = this._getLocalCacheKey(uid, topicId);
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        return new Mastery(JSON.parse(cached));
      } catch {}
    }

    if (this.env.isMock || !navigator.onLine) {
      return null;
    }

    try {
      const docRef = doc(db, 'users', uid, 'mastery', topicId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const mastery = new Mastery({
          ...data,
          lastUpdated: new Date(data.lastUpdated)
        });
        this._saveLocalCache(uid, mastery);
        return mastery;
      }
      return null;
    } catch (err) {
      this.logger.error(`Error fetching mastery from Firestore: ${err.message}`, err);
      return null;
    }
  }

  async listMastery(uid) {
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
            localList.push(new Mastery(JSON.parse(cached)));
          } catch {}
        }
      });
      return localList;
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const subColRef = collection(db, 'users', uid, 'mastery');
      const querySnapshot = await getDocs(subColRef);
      
      const list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const mastery = new Mastery({
          ...data,
          lastUpdated: new Date(data.lastUpdated)
        });
        this._saveLocalCache(uid, mastery);
        list.push(mastery);
      });
      return list;
    } catch (err) {
      this.logger.error(`Failed to load mastery list from Firestore: ${err.message}`, err);
      return [];
    }
  }
}
export default FirestoreMasteryRepository;
