/**
 * Enumeration of all valid Project Health states.
 * These form a progression lifecycle for any in-progress project.
 */
export const ProjectHealth = Object.freeze({
  NOT_STARTED: 'NotStarted',
  STARTED: 'Started',
  IN_PROGRESS: 'InProgress',
  BLOCKED: 'Blocked',
  READY_FOR_REVIEW: 'ReadyForReview',
  COMPLETED: 'Completed',
  MASTERED: 'Mastered'
});

/**
 * Domain model representing a user's progress on a specific project.
 */
export class ProjectProgress {
  constructor({
    uid,
    projectId,
    health = ProjectHealth.NOT_STARTED,
    completedTasks = [],
    unlockedMilestones = [],
    timeSpentMinutes = 0,
    startedAt = null,
    lastActiveAt = null,
    notes = {},
    portfolioMetadata = null
  }) {
    this.uid = uid;
    this.projectId = projectId;
    this.health = health;
    this.completedTasks = completedTasks;           // string[] — task IDs
    this.unlockedMilestones = unlockedMilestones;   // string[] — milestone IDs
    this.timeSpentMinutes = timeSpentMinutes;
    this.startedAt = startedAt ? new Date(startedAt) : null;
    this.lastActiveAt = lastActiveAt ? new Date(lastActiveAt) : new Date();
    this.notes = notes;                             // { [taskId]: string }
    this.portfolioMetadata = portfolioMetadata;     // PortfolioProject snapshot
  }

  /**
   * Computes overall completion percentage based on completed vs total tasks.
   * @param {number} totalTasks
   */
  completionPercent(totalTasks) {
    if (!totalTasks) return 0;
    return Math.round((this.completedTasks.length / totalTasks) * 100);
  }

  /**
   * Returns true if a specific task has been completed.
   * @param {string} taskId
   */
  isTaskCompleted(taskId) {
    return this.completedTasks.includes(taskId);
  }

  /**
   * Returns true if a specific milestone has been unlocked.
   * @param {string} milestoneId
   */
  isMilestoneUnlocked(milestoneId) {
    return this.unlockedMilestones.includes(milestoneId);
  }

  /**
   * Serialize to a plain object for storage.
   */
  toJSON() {
    return {
      uid: this.uid,
      projectId: this.projectId,
      health: this.health,
      completedTasks: this.completedTasks,
      unlockedMilestones: this.unlockedMilestones,
      timeSpentMinutes: this.timeSpentMinutes,
      startedAt: this.startedAt?.toISOString() || null,
      lastActiveAt: this.lastActiveAt?.toISOString() || new Date().toISOString(),
      notes: this.notes,
      portfolioMetadata: this.portfolioMetadata
    };
  }
}

export default ProjectProgress;
