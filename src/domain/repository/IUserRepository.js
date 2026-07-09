/**
 * IUserRepository Interface
 * Defines contracts for user profile, settings, preferences, and progress CRUD operations.
 */
export class IUserRepository {
  async getUser(uid) {
    throw new Error('Method not implemented: getUser');
  }

  async createUser(user) {
    throw new Error('Method not implemented: createUser');
  }

  async updateUser(uid, updates) {
    throw new Error('Method not implemented: updateUser');
  }

  async updateSettings(uid, settings) {
    throw new Error('Method not implemented: updateSettings');
  }

  async updateProgress(uid, progress) {
    throw new Error('Method not implemented: updateProgress');
  }

  async updatePreferences(uid, preferences) {
    throw new Error('Method not implemented: updatePreferences');
  }
}
