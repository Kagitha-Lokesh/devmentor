import { IProjectRepository } from '../../domain/repository/IProjectRepository';
import { Project } from '../../domain/models/Project';
import { localDB } from '../../shared/utils/indexedDB';
import { container } from '../di/container';

const GENERATED_BASE = '/src/shared/generated';
const PUBLIC_CONTENT_BASE = '/content';

export class StaticProjectRepository extends IProjectRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this._indexCache = null;
    this._roadmapCache = null;
    this._learningMapCache = null;
    this._depGraphCache = null;
    this._statsCache = null;
  }

  async _loadIndex() {
    if (this._indexCache) return this._indexCache;
    try {
      // Try IndexedDB cache first
      const cached = await localDB.get('projectCache', 'project-index');
      if (cached) {
        this._indexCache = cached;
        return cached;
      }
      const res = await fetch(`${GENERATED_BASE}/project-index.json`);
      const data = await res.json();
      this._indexCache = data;
      await localDB.put('projectCache', 'project-index', data);
      return data;
    } catch (err) {
      this.logger.warn(`[StaticProjectRepository] Failed to load project-index: ${err.message}`);
      return [];
    }
  }

  async _loadRoadmap() {
    if (this._roadmapCache) return this._roadmapCache;
    try {
      const cached = await localDB.get('projectCache', 'project-roadmap');
      if (cached) { this._roadmapCache = cached; return cached; }
      const res = await fetch(`${GENERATED_BASE}/project-roadmap.json`);
      const data = await res.json();
      this._roadmapCache = data;
      await localDB.put('projectCache', 'project-roadmap', data);
      return data;
    } catch {
      return {};
    }
  }

  async _loadLearningMap() {
    if (this._learningMapCache) return this._learningMapCache;
    try {
      const cached = await localDB.get('projectCache', 'project-learning-map');
      if (cached) { this._learningMapCache = cached; return cached; }
      const res = await fetch(`${GENERATED_BASE}/project-learning-map.json`);
      const data = await res.json();
      this._learningMapCache = data;
      await localDB.put('projectCache', 'project-learning-map', data);
      return data;
    } catch {
      return {};
    }
  }

  async listProjects() {
    const index = await this._loadIndex();
    return index.map(entry => new Project(entry));
  }

  async getProject(projectId) {
    const index = await this._loadIndex();
    const entry = index.find(p => p.id === projectId);
    if (!entry) return null;

    const project = new Project(entry);

    // Load full roadmap (milestones + tasks)
    const roadmap = await this._loadRoadmap();
    if (roadmap[projectId]) {
      project.milestones = roadmap[projectId].milestones || [];
      project.tasks = project.milestones.flatMap(m => m.tasks || []);
    }

    // Load resources
    try {
      const resUrl = `${PUBLIC_CONTENT_BASE}/${entry.paths?.overview?.replace('overview.md', '')}resources.json`;
      const resRes = await fetch(resUrl);
      if (resRes.ok) project.resources = await resRes.json();
    } catch {}

    return project;
  }

  async getProjectMarkdown(markdownPath) {
    try {
      // Check local cache
      const cached = await localDB.get('projectCache', markdownPath);
      if (cached) return cached;

      const res = await fetch(`${PUBLIC_CONTENT_BASE}/${markdownPath}`);
      if (!res.ok) return null;
      const text = await res.text();
      await localDB.put('projectCache', markdownPath, text);
      return text;
    } catch (err) {
      this.logger.warn(`[StaticProjectRepository] Failed to load markdown ${markdownPath}: ${err.message}`);
      return null;
    }
  }

  async getTaskLearningMap(projectId, taskId) {
    const map = await this._loadLearningMap();
    return map[`${projectId}:${taskId}`] || { lessons: [], problems: [], cards: [], questions: [] };
  }

  async getDependencyGraph() {
    if (this._depGraphCache) return this._depGraphCache;
    try {
      const cached = await localDB.get('projectCache', 'project-dependency-graph');
      if (cached) { this._depGraphCache = cached; return cached; }
      const res = await fetch(`${GENERATED_BASE}/project-dependency-graph.json`);
      const data = await res.json();
      this._depGraphCache = data;
      await localDB.put('projectCache', 'project-dependency-graph', data);
      return data;
    } catch {
      return {};
    }
  }

  async getStatistics() {
    if (this._statsCache) return this._statsCache;
    try {
      const res = await fetch(`${GENERATED_BASE}/project-statistics.json`);
      const data = await res.json();
      this._statsCache = data;
      return data;
    } catch {
      return { totalProjects: 0, totalTracks: 0, totalResources: 0 };
    }
  }
}

export default StaticProjectRepository;
