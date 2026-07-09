export class MilestoneEngine {
  /**
   * Evaluates and unlocks any milestones whose dependencies are met.
   * A milestone is unlocked if:
   * 1. It has no dependencies, OR
   * 2. All milestone IDs it depends on are marked completed.
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {Array} milestones
   * @returns {import('../../domain/models/ProjectProgress').ProjectProgress}
   */
  evaluateUnlockedMilestones(progress, milestones) {
    const completedMilestones = milestones.filter(m => 
      this.isMilestoneCompleted(progress, m)
    ).map(m => m.id);

    const unlocked = [];

    milestones.forEach(m => {
      // If no dependencies, or all dependencies are completed
      const deps = m.dependsOn || [];
      const depsSatisfied = deps.every(depId => completedMilestones.includes(depId));
      
      if (depsSatisfied) {
        unlocked.push(m.id);
      }
    });

    progress.unlockedMilestones = unlocked;
    return progress;
  }

  /**
   * Checks if all required (non-optional) tasks in a milestone are completed.
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {Object} milestone
   * @returns {boolean}
   */
  isMilestoneCompleted(progress, milestone) {
    const tasks = milestone.tasks || [];
    const requiredTasks = tasks.filter(t => !t.isOptional);
    if (requiredTasks.length === 0) return true;

    return requiredTasks.every(t => progress.completedTasks.includes(t.id));
  }
}

export default MilestoneEngine;
