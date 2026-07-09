import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Achievement } from '../../domain/models/Achievement';
import { IAchievementRepository } from '../../domain/repository/IAchievementRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';
import staticAchievements from '../../shared/generated/achievement-index.json';

export class AchievementRepository extends IAchievementRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  async getStaticAchievements() {
    return staticAchievements;
  }

  async getAchievements(uid) {
    const all = await this._getAllLocalAchievements();
    const userAch = all.filter(a => a.userId === uid);
    if (userAch.length > 0) {
      return userAch.map(a => new Achievement(a));
    }

    if (this.env.isMock || !navigator.onLine) return [];

    try {
      const colRef = collection(db, 'users', uid, 'achievements');
      const snap = await getDocs(colRef);
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const ach = new Achievement({ ...data, id: d.id, userId: uid });
        await localDB.put('achievements', ach.id, ach.toJSON());
        list.push(ach);
      }
      return list;
    } catch (err) {
      this.logger.warn(`Failed to sync achievements from Firestore: ${err.message}`);
      return [];
    }
  }

  async saveAchievementProgress(uid, achievement) {
    achievement.userId = uid;
    const data = achievement.toJSON();
    await localDB.put('achievements', achievement.id, data);
    await syncQueue.enqueue('achievements', uid, data);
  }

  async _getAllLocalAchievements() {
    try {
      const dbInstance = await localDB.open();
      return new Promise((resolve) => {
        const tx = dbInstance.transaction('achievements', 'readonly');
        const store = tx.objectStore('achievements');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}
export default AchievementRepository;
