import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Activity } from '../../domain/models/Activity';
import { container } from '../di/container';
import { syncQueue } from '../../shared/utils/syncQueue';

export class FirestoreActivityRepository {
  constructor() {
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _getLocalKey(uid) {
    return `cache_activities_${uid}`;
  }

  _getMockActivities(uid) {
    try {
      const data = localStorage.getItem(this._getLocalKey(uid));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveLocalActivity(uid, activity) {
    const list = this._getMockActivities(uid);
    list.push({
      ...activity,
      timestamp: activity.timestamp.toISOString()
    });
    // Cap at last 50 activities to save storage space
    if (list.length > 50) {
      list.shift();
    }
    localStorage.setItem(this._getLocalKey(uid), JSON.stringify(list));
  }

  async logActivity(uid, activity) {
    this.logger.info(`Logging user activity: "${activity.type}" for topic: ${activity.topicId}`);
    
    // Save locally
    this._saveLocalActivity(uid, activity);

    // Sync to Firestore
    await syncQueue.enqueue('activity', uid, activity);
  }

  async listActivities(uid) {
    // Attempt local cache first
    const mock = this._getMockActivities(uid);
    if (mock.length > 0) {
      return mock
        .map(a => new Activity({ ...a, timestamp: new Date(a.timestamp) }))
        .sort((a, b) => b.timestamp - a.timestamp);
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const subColRef = collection(db, 'users', uid, 'activity');
      const querySnapshot = await getDocs(subColRef);
      
      const list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push(new Activity({
          ...data,
          timestamp: new Date(data.timestamp)
        }));
      });
      return list.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      this.logger.error(`Failed to load activities: ${err.message}`, err);
      return [];
    }
  }
}
export default FirestoreActivityRepository;
