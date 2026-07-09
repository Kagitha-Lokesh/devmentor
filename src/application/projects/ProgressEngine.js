import { ProjectProgress, ProjectHealth } from '../../domain/models/ProjectProgress';

export class ProgressEngine {
  /**
   * Initializes a new ProjectProgress object for a user and project.
   */
  startProject(uid, project) {
    const milestones = project.milestones || [];
    // Initially, unlock milestones that have no dependencies
    const unlocked = milestones
      .filter(m => !m.dependsOn || m.dependsOn.length === 0)
      .map(m => m.id);

    return new ProjectProgress({
      uid,
      projectId: project.id,
      health: ProjectHealth.STARTED,
      completedTasks: [],
      unlockedMilestones: unlocked,
      timeSpentMinutes: 0,
      startedAt: new Date(),
      lastActiveAt: new Date()
    });
  }

  /**
   * Records elapsed time spent working on the project.
   */
  addTimeSpent(progress, minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) return progress;
    progress.timeSpentMinutes += minutes;
    progress.lastActiveAt = new Date();
    return progress;
  }
}

export default ProgressEngine;
