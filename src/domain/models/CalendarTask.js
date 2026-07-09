export class CalendarTask {
  constructor({
    id,
    userId,
    title,
    type, // 'lesson' | 'revision' | 'problem' | 'interview' | 'project' | 'career'
    targetId,
    date,
    status = 'upcoming', // 'upcoming' | 'completed' | 'overdue'
    scheduledTime = '09:00'
  }) {
    this.id = id || `cal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.title = title;
    this.type = type;
    this.targetId = targetId;
    this.date = date instanceof Date ? date : new Date(date);
    this.status = status;
    this.scheduledTime = scheduledTime;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      type: this.type,
      targetId: this.targetId,
      date: this.date.toISOString().split('T')[0],
      status: this.status,
      scheduledTime: this.scheduledTime
    };
  }
}
export default CalendarTask;
