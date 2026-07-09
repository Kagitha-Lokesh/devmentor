/**
 * Interface contract for managing assistant preferences.
 */
export class IAssistantPreferencesRepository {
  async getPreferences(uid) {
    throw new Error('Not implemented.');
  }

  async savePreferences(uid, preferences) {
    throw new Error('Not implemented.');
  }
}

export default IAssistantPreferencesRepository;
