import { container } from '../../infrastructure/di/container';
import { CalendarTask } from '../../domain/models/CalendarTask';

export class CalendarUseCase {
  _getRepo() {
    return container.resolve('ICalendarRepository');
  }

  async getTasks(uid) {
    return this._getRepo().getTasks(uid);
  }

  async addTask(uid, { title, type, targetId, date, scheduledTime }) {
    const task = new CalendarTask({ userId: uid, title, type, targetId, date, scheduledTime });
    await this._getRepo().saveTask(uid, task);
    return task;
  }

  async completeTask(uid, taskId) {
    const tasks = await this._getRepo().getTasks(uid);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = 'completed';
    await this._getRepo().saveTask(uid, task);
    return task;
  }

  async deleteTask(uid, taskId) {
    return this._getRepo().deleteTask(uid, taskId);
  }

  async getTasksForDate(uid, dateStr) {
    const all = await this._getRepo().getTasks(uid);
    return all.filter(t => t.toJSON().date === dateStr);
  }

  async updateOverdueTasks(uid) {
    const today = new Date().toISOString().split('T')[0];
    const all = await this._getRepo().getTasks(uid);
    for (const task of all) {
      if (task.status === 'upcoming' && task.toJSON().date < today) {
        task.status = 'overdue';
        await this._getRepo().saveTask(uid, task);
      }
    }
  }
}
export default CalendarUseCase;
