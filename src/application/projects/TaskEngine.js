export class TaskEngine {
  /**
   * Completes a task and checks if dependencies are satisfied.
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {string} taskId
   * @param {Array} allTasks
   */
  completeTask(progress, taskId, allTasks) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return progress;

    // Check task dependencies
    const dependsOn = task.dependsOn || [];
    const missingDeps = dependsOn.filter(depId => !progress.completedTasks.includes(depId));
    if (missingDeps.length > 0) {
      throw new Error(`Cannot complete task "${taskId}". Prerequisites missing: ${missingDeps.join(', ')}`);
    }

    if (!progress.completedTasks.includes(taskId)) {
      progress.completedTasks = [...progress.completedTasks, taskId];
    }
    progress.lastActiveAt = new Date();
    return progress;
  }

  /**
   * Uncompletes a task.
   */
  uncompleteTask(progress, taskId) {
    progress.completedTasks = progress.completedTasks.filter(id => id !== taskId);
    progress.lastActiveAt = new Date();
    return progress;
  }

  /**
   * Adds user notes/code logs for a specific task.
   */
  saveTaskNotes(progress, taskId, notesText) {
    progress.notes = {
      ...progress.notes,
      [taskId]: notesText
    };
    progress.lastActiveAt = new Date();
    return progress;
  }
}

export default TaskEngine;
