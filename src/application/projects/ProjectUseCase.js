import { container } from '../../infrastructure/di/container';
import { WorkflowEngine } from './WorkflowEngine';
import { ProjectHealth } from '../../domain/models/ProjectProgress';

export class ProjectUseCase {
  constructor() {
    this.workflowEngine = new WorkflowEngine();
  }

  /**
   * Lazily resolves repositories to avoid DI circular reference lockups.
   */
  _getProjectRepo() {
    return container.resolve('IProjectRepository');
  }

  _getProgressRepo() {
    return container.resolve('IProjectProgressRepository');
  }

  /**
   * Fetches the complete project list from the static index.
   */
  async listProjects() {
    return this._getProjectRepo().listProjects();
  }

  /**
   * Retrieves a single project with complete milestones & tasks.
   */
  async getProjectDetails(projectId) {
    return this._getProjectRepo().getProject(projectId);
  }

  /**
   * Retrieves a user's progress for a project.
   */
  async getUserProgress(uid, projectId) {
    return this._getProgressRepo().getProgress(uid, projectId);
  }

  /**
   * Lists all project progress items for a user.
   */
  async listUserProgress(uid) {
    return this._getProgressRepo().listProgress(uid);
  }

  /**
   * Starts a project, creating the initial ProjectProgress state.
   */
  async startProject(uid, projectId) {
    const project = await this.getProjectDetails(projectId);
    if (!project) throw new Error(`Project "${projectId}" not found`);

    let progress = await this.getUserProgress(uid, projectId);
    if (!progress) {
      progress = this.workflowEngine.start(uid, project);
      await this._getProgressRepo().saveProgress(uid, progress);
    }
    return progress;
  }

  /**
   * Completes a task within a project.
   */
  async completeTask(uid, projectId, taskId) {
    const project = await this.getProjectDetails(projectId);
    if (!project) throw new Error(`Project "${projectId}" not found`);

    let progress = await this.getUserProgress(uid, projectId);
    if (!progress) {
      progress = this.workflowEngine.start(uid, project);
    }

    progress = this.workflowEngine.completeTask(progress, taskId, project);
    await this._getProgressRepo().saveProgress(uid, progress);
    return progress;
  }

  /**
   * Uncompletes a task.
   */
  async uncompleteTask(uid, projectId, taskId) {
    const project = await this.getProjectDetails(projectId);
    if (!project) throw new Error(`Project "${projectId}" not found`);

    let progress = await this.getUserProgress(uid, projectId);
    if (!progress) return null;

    progress = this.workflowEngine.uncompleteTask(progress, taskId, project);
    await this._getProgressRepo().saveProgress(uid, progress);
    return progress;
  }

  /**
   * Adds study/work minutes to a project tracker.
   */
  async logTimeSpent(uid, projectId, minutes) {
    const project = await this.getProjectDetails(projectId);
    if (!project) throw new Error(`Project "${projectId}" not found`);

    let progress = await this.getUserProgress(uid, projectId);
    if (!progress) {
      progress = this.workflowEngine.start(uid, project);
    }

    progress = this.workflowEngine.logWorkTime(progress, minutes, project);
    await this._getProgressRepo().saveProgress(uid, progress);
    return progress;
  }

  /**
   * Updates task notes/solutions.
   */
  async saveTaskNotes(uid, projectId, taskId, text) {
    let progress = await this.getUserProgress(uid, projectId);
    if (!progress) {
      const project = await this.getProjectDetails(projectId);
      if (!project) throw new Error(`Project "${projectId}" not found`);
      progress = this.workflowEngine.start(uid, project);
    }

    progress = this.workflowEngine.saveTaskNotes(progress, taskId, text);
    await this._getProgressRepo().saveProgress(uid, progress);
    return progress;
  }

  /**
   * Updates general project health.
   */
  async updateProjectHealth(uid, projectId, health) {
    if (!Object.values(ProjectHealth).includes(health)) {
      throw new Error(`Invalid project health state: ${health}`);
    }
    await this._getProgressRepo().updateHealth(uid, projectId, health);
    return this.getUserProgress(uid, projectId);
  }

  /**
   * Resets all progress details for a project.
   */
  async resetProjectProgress(uid, projectId) {
    await this._getProgressRepo().resetProgress(uid, projectId);
  }

  /**
   * Returns project dependency graph details.
   */
  async getDependencyGraph() {
    return this._getProjectRepo().getDependencyGraph();
  }

  /**
   * Returns task learning integration map.
   */
  async getTaskLearningMap(projectId, taskId) {
    return this._getProjectRepo().getTaskLearningMap(projectId, taskId);
  }
}

export default ProjectUseCase;
