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

  _storeKey(uid, achievementId) {
    return `${uid}_${achievementId}`;
  }

  async getStaticAchievements() {
    return staticAchievements;
  }

  async getAchievements(uid) {
    const userAch = await localDB.getAllByPrefix('achievements', uid);
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
        await localDB.put('achievements', this._storeKey(uid, ach.id), ach.toJSON());
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
    await localDB.put('achievements', this._storeKey(uid, achievement.id), data);
    await syncQueue.enqueue('achievements', uid, data);
  }
}
export default AchievementRepository;
