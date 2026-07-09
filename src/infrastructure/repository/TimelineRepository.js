import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { TimelineEvent } from '../../domain/models/TimelineEvent';
import { ITimelineRepository } from '../../domain/repository/ITimelineRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class TimelineRepository extends ITimelineRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  async getEvents(uid) {
    const all = await this._getAllLocalEvents();
    const userEvents = all.filter(e => e.userId === uid);
    if (userEvents.length > 0) {
      return userEvents
        .map(e => new TimelineEvent(e))
        .sort((a, b) => b.timestamp - a.timestamp);
    }

    if (this.env.isMock || !navigator.onLine) return [];

    try {
      const colRef = collection(db, 'users', uid, 'timeline');
      const snap = await getDocs(colRef);
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const evt = new TimelineEvent({ ...data, id: d.id, userId: uid });
        await localDB.put('timeline', evt.id, evt.toJSON());
        list.push(evt);
      }
      return list.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      this.logger.warn(`Failed to sync timeline from Firestore: ${err.message}`);
      return [];
    }
  }

  async recordEvent(uid, event) {
    event.userId = uid;
    const data = event.toJSON();
    await localDB.put('timeline', event.id, data);
    await syncQueue.enqueue('timeline', uid, data);
  }

  async _getAllLocalEvents() {
    try {
      const dbInstance = await localDB.open();
      return new Promise((resolve) => {
        const tx = dbInstance.transaction('timeline', 'readonly');
        const store = tx.objectStore('timeline');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}
export default TimelineRepository;
