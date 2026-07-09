export class LearningPath {
  constructor({
    completed = [],
    current = [],
    upcoming = [],
    blocked = []
  }) {
    this.completed = completed; // Completed topic IDs
    this.current = current;     // Started/In Progress topic IDs
    this.upcoming = upcoming;   // Unlocked and ready
    this.blocked = blocked;     // Locked behind prerequisites
  }
}
export default LearningPath;
