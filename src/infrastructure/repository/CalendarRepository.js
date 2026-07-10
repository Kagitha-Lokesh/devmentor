import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { CalendarTask } from '../../domain/models/CalendarTask';
import { ICalendarRepository } from '../../domain/repository/ICalendarRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class CalendarRepository extends ICalendarRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _storeKey(uid, taskId) {
    return `${uid}_${taskId}`;
  }

  async getTasks(uid) {
    const userTasks = await localDB.getAllByPrefix('calendar', uid);
    const activeTasks = userTasks.filter(t => !t.deleted);
    if (activeTasks.length > 0) {
      return activeTasks.map(t => new CalendarTask(t));
    }

    if (this.env.isMock || !navigator.onLine) return [];

    try {
      const colRef = collection(db, 'users', uid, 'calendar');
      const snap = await getDocs(colRef);
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const task = new CalendarTask({ ...data, id: d.id, userId: uid });
        await localDB.put('calendar', this._storeKey(uid, task.id), task.toJSON());
        list.push(task);
      }
      return list;
    } catch (err) {
      this.logger.warn(`Failed to sync calendar from Firestore: ${err.message}`);
      return [];
    }
  }

  async saveTask(uid, task) {
    task.userId = uid;
    const data = task.toJSON();
    await localDB.put('calendar', this._storeKey(uid, task.id), data);
    await syncQueue.enqueue('calendar', uid, data);
  }

  async deleteTask(uid, taskId) {
    const compositeKey = this._storeKey(uid, taskId);
    await localDB.delete('calendar', compositeKey);
    await syncQueue.enqueue('calendar', uid, { id: taskId, deleted: true });
  }
}
export default CalendarRepository;
