export class IAchievementRepository {
  async getAchievements(uid) {
    throw new Error('Not implemented.');
  }

  async saveAchievementProgress(uid, achievement) {
    throw new Error('Not implemented.');
  }

  async getStaticAchievements() {
    throw new Error('Not implemented.');
  }
}
export default IAchievementRepository;
