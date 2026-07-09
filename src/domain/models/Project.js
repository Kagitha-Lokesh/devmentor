/**
 * Domain model representing a static project definition loaded from the registry.
 */
export class Project {
  constructor({
    id,
    title,
    description,
    track,
    templateType = 'Intermediate',
    difficulty = 'Intermediate',
    estimatedHours = 0,
    technologies = [],
    skills = [],
    prerequisites = [],
    dependsOn = [],
    suggestsNext = [],
    tags = [],
    totalMilestones = 0,
    totalTasks = 0,
    paths = {}
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.track = track;
    this.templateType = templateType;
    this.difficulty = difficulty;
    this.estimatedHours = estimatedHours;
    this.technologies = technologies;
    this.skills = skills;
    this.prerequisites = prerequisites;
    this.dependsOn = dependsOn;
    this.suggestsNext = suggestsNext;
    this.tags = tags;
    this.totalMilestones = totalMilestones;
    this.totalTasks = totalTasks;
    this.paths = paths;

    // Loaded on demand (not part of index)
    this.overview = null;
    this.milestones = [];
    this.tasks = [];
    this.resources = [];
  }
}

export default Project;
