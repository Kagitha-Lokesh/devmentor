import { IAssistantPreferencesRepository } from '../../domain/repository/IAssistantPreferencesRepository';
import { AssistantPreferences } from '../../domain/models/AssistantPreferences';
import { syncQueue } from '../../shared/utils/syncQueue';

export class LocalPreferencesRepository extends IAssistantPreferencesRepository {
  _key(uid) { return `assistant_pref_${uid}`; }

  async getPreferences(uid) {
    try {
      const cached = localStorage.getItem(this._key(uid));
      if (cached) {
        return new AssistantPreferences(JSON.parse(cached));
      }
      
      // Fallback: load default settings from generated index
      const def = await fetch('/generated/assistant-config.json')
        .then(r => r.json())
        .catch(() => ({ activeProvider: 'rule-based' }));

      const pref = new AssistantPreferences({
        userId: uid,
        activeProvider: def.activeProvider || 'rule-based',
        endpointUrl: def.providers?.ollama?.endpointUrl || 'http://localhost:11434',
        modelName: def.providers?.ollama?.modelName || 'llama3',
        contextLimit: def.providers?.ollama?.contextLimit || 4096
      });

      localStorage.setItem(this._key(uid), JSON.stringify(pref));
      return pref;
    } catch {
      return new AssistantPreferences({ userId: uid });
    }
  }

  async savePreferences(uid, preferences) {
    localStorage.setItem(this._key(uid), JSON.stringify(preferences));
    
    // Sync preferences layout to Firestore
    await syncQueue.enqueue('assistant', uid, {
      subtype: 'preferences',
      ...preferences
    });
  }
}

export default LocalPreferencesRepository;
