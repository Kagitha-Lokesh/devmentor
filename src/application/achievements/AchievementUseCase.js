import { container } from '../../infrastructure/di/container';
import { Achievement } from '../../domain/models/Achievement';

export class AchievementUseCase {
  _getRepo() {
    return container.resolve('IAchievementRepository');
  }

  async getAchievementsDashboard(uid) {
    const [staticList, userProgress] = await Promise.all([
      this._getRepo().getStaticAchievements(),
      this._getRepo().getAchievements(uid)
    ]);
    const progressMap = {};
    userProgress.forEach(a => { progressMap[a.id] = a; });

    return staticList.map(def => {
      const saved = progressMap[def.id];
      return new Achievement({
        id: def.id,
        userId: uid,
        title: def.title,
        description: def.description,
        target: def.target,
        progress: saved ? saved.progress : 0,
        completionDate: saved ? saved.completionDate : null,
        relatedSkills: def.skills || [],
        linkedProjects: saved ? (saved.linkedProjects || []) : []
      });
    });
  }

  async incrementProgress(uid, achievementId, amount = 1) {
    const staticList = await this._getRepo().getStaticAchievements();
    const def = staticList.find(a => a.id === achievementId);
    if (!def) return null;

    const existing = (await this._getRepo().getAchievements(uid)).find(a => a.id === achievementId);
    const newProgress = Math.min((existing?.progress || 0) + amount, def.target);

    const achievement = new Achievement({
      id: achievementId,
      userId: uid,
      title: def.title,
      description: def.description,
      target: def.target,
      progress: newProgress,
      completionDate: newProgress >= def.target ? new Date() : (existing?.completionDate || null),
      relatedSkills: def.skills || [],
      linkedProjects: existing?.linkedProjects || []
    });

    await this._getRepo().saveAchievementProgress(uid, achievement);
    return achievement;
  }
}
export default AchievementUseCase;
