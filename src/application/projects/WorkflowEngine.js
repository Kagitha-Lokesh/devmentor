import { TaskEngine } from './TaskEngine';
import { MilestoneEngine } from './MilestoneEngine';
import { ProgressEngine } from './ProgressEngine';
import { CompletionEngine } from './CompletionEngine';
import { ProjectHealth } from '../../domain/models/ProjectProgress';

export class WorkflowEngine {
  constructor() {
    this.taskEngine = new TaskEngine();
    this.milestoneEngine = new MilestoneEngine();
    this.progressEngine = new ProgressEngine();
    this.completionEngine = new CompletionEngine();
  }

  /**
   * Starts a new project progression.
   */
  start(uid, project) {
    return this.progressEngine.startProject(uid, project);
  }

  /**
   * Processes a task completion update and re-evaluates milestones/completions/health.
   */
  completeTask(progress, taskId, project) {
    const allTasks = project.milestones.flatMap(m => m.tasks || []);
    
    // 1. Complete the task
    progress = this.taskEngine.completeTask(progress, taskId, allTasks);
    
    // 2. Adjust health to InProgress if it was just started
    if (progress.health === ProjectHealth.STARTED || progress.health === ProjectHealth.NOT_STARTED) {
      progress.health = ProjectHealth.IN_PROGRESS;
    }

    // 3. Evaluate milestone unlocking
    progress = this.milestoneEngine.evaluateUnlockedMilestones(progress, project.milestones);

    // 4. Evaluate project completion and update metadata
    progress = this.completionEngine.checkAndMarkCompletion(progress, project);

    return progress;
  }

  /**
   * Processes a task uncompletion.
   */
  uncompleteTask(progress, taskId, project) {
    // 1. Remove from completed list
    progress = this.taskEngine.uncompleteTask(progress, taskId);

    // 2. Re-evaluate milestone unlocking
    progress = this.milestoneEngine.evaluateUnlockedMilestones(progress, project.milestones);

    // 3. Re-evaluate project completion
    progress = this.completionEngine.checkAndMarkCompletion(progress, project);

    return progress;
  }

  /**
   * Updates user notes on a task.
   */
  saveTaskNotes(progress, taskId, text) {
    return this.taskEngine.saveTaskNotes(progress, taskId, text);
  }

  /**
   * Increments elapsed study/work time.
   */
  logWorkTime(progress, minutes, project) {
    progress = this.progressEngine.addTimeSpent(progress, minutes);
    // Re-verify completion metadata to capture updated duration
    progress = this.completionEngine.checkAndMarkCompletion(progress, project);
    return progress;
  }
}

export default WorkflowEngine;
