import { ProjectHealth } from '../../domain/models/ProjectProgress';

export class CompletionEngine {
  /**
   * Evaluates if a project is fully completed (all required tasks in all milestones completed).
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {import('../../domain/models/Project').Project} project
   * @returns {boolean}
   */
  isProjectCompleted(progress, project) {
    const milestones = project.milestones || [];
    if (milestones.length === 0) return false;

    // Check if every single milestone is completed
    return milestones.every(m => {
      const requiredTasks = (m.tasks || []).filter(t => !t.isOptional);
      if (requiredTasks.length === 0) return true;
      return requiredTasks.every(t => progress.completedTasks.includes(t.id));
    });
  }

  /**
   * Generates standard portfolio export metadata for completed projects.
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {import('../../domain/models/Project').Project} project
   * @returns {Object}
   */
  generatePortfolioMetadata(progress, project) {
    return {
      title: project.title,
      description: project.description,
      technologies: project.technologies || [],
      skills: project.skills || [],
      duration: progress.timeSpentMinutes,
      difficulty: project.difficulty,
      status: progress.health
    };
  }

  /**
   * Sets the completion status and packages portfolio metadata if applicable.
   * @param {import('../../domain/models/ProjectProgress').ProjectProgress} progress
   * @param {import('../../domain/models/Project').Project} project
   * @returns {import('../../domain/models/ProjectProgress').ProjectProgress}
   */
  checkAndMarkCompletion(progress, project) {
    const completed = this.isProjectCompleted(progress, project);
    if (completed) {
      if (progress.health !== ProjectHealth.COMPLETED && progress.health !== ProjectHealth.MASTERED) {
        progress.health = ProjectHealth.COMPLETED;
      }
      progress.portfolioMetadata = this.generatePortfolioMetadata(progress, project);
    } else {
      if (progress.health === ProjectHealth.COMPLETED || progress.health === ProjectHealth.MASTERED) {
        progress.health = ProjectHealth.IN_PROGRESS;
        progress.portfolioMetadata = null;
      }
    }
    return progress;
  }
}

export default CompletionEngine;
