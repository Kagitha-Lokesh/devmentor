/**
 * Interface contract for reading static project definitions from the compiled registry.
 */
export class IProjectRepository {
  /**
   * Returns the full list of projects from project-index.json.
   * @returns {Promise<import('../models/Project').Project[]>}
   */
  async listProjects() {
    throw new Error('Not implemented.');
  }

  /**
   * Returns a single project by ID, with full milestones, tasks, and resources loaded.
   * @param {string} projectId
   * @returns {Promise<import('../models/Project').Project|null>}
   */
  async getProject(projectId) {
    throw new Error('Not implemented.');
  }

  /**
   * Returns the markdown content for a project document (overview, requirements, architecture, roadmap).
   * @param {string} markdownPath - Relative path from the content root.
   * @returns {Promise<string>}
   */
  async getProjectMarkdown(markdownPath) {
    throw new Error('Not implemented.');
  }

  /**
   * Returns the task learning map entry for a given project task.
   * @param {string} projectId
   * @param {string} taskId
   * @returns {Promise<{lessons: string[], problems: string[], cards: string[], questions: string[]}>}
   */
  async getTaskLearningMap(projectId, taskId) {
    throw new Error('Not implemented.');
  }

  /**
   * Returns the dependency graph for all projects.
   * @returns {Promise<Object>}
   */
  async getDependencyGraph() {
    throw new Error('Not implemented.');
  }

  /**
   * Returns aggregate statistics for the projects platform.
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    throw new Error('Not implemented.');
  }
}

export default IProjectRepository;
