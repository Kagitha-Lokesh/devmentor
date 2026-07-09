/**
 * Interface contract for managing user project progress (start, update, complete).
 */
export class IProjectProgressRepository {
  /**
   * Retrieves progress for a specific project.
   * @param {string} uid
   * @param {string} projectId
   * @returns {Promise<import('../models/ProjectProgress').ProjectProgress|null>}
   */
  async getProgress(uid, projectId) {
    throw new Error('Not implemented.');
  }

  /**
   * Lists all project progress entries for a user.
   * @param {string} uid
   * @returns {Promise<import('../models/ProjectProgress').ProjectProgress[]>}
   */
  async listProgress(uid) {
    throw new Error('Not implemented.');
  }

  /**
   * Saves (creates or updates) progress for a project.
   * @param {string} uid
   * @param {import('../models/ProjectProgress').ProjectProgress} progress
   * @returns {Promise<void>}
   */
  async saveProgress(uid, progress) {
    throw new Error('Not implemented.');
  }

  /**
   * Marks a specific task as completed.
   * @param {string} uid
   * @param {string} projectId
   * @param {string} taskId
   * @returns {Promise<import('../models/ProjectProgress').ProjectProgress>}
   */
  async completeTask(uid, projectId, taskId) {
    throw new Error('Not implemented.');
  }

  /**
   * Unlocks a milestone in user's progress.
   * @param {string} uid
   * @param {string} projectId
   * @param {string} milestoneId
   * @returns {Promise<void>}
   */
  async unlockMilestone(uid, projectId, milestoneId) {
    throw new Error('Not implemented.');
  }

  /**
   * Resets all progress for a project (allows restarting).
   * @param {string} uid
   * @param {string} projectId
   * @returns {Promise<void>}
   */
  async resetProgress(uid, projectId) {
    throw new Error('Not implemented.');
  }

  /**
   * Updates the project health status.
   * @param {string} uid
   * @param {string} projectId
   * @param {string} health - A ProjectHealth enum value
   * @returns {Promise<void>}
   */
  async updateHealth(uid, projectId, health) {
    throw new Error('Not implemented.');
  }
}

export default IProjectProgressRepository;
