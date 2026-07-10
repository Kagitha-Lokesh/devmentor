import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { IUserRepository } from '../../domain/repository/IUserRepository';
import { User } from '../../domain/models/User';
import { Settings } from '../../domain/models/Settings';
import { Progress } from '../../domain/models/Progress';
import { Preferences } from '../../domain/models/Preferences';
import { FirestoreError } from '../../shared/error/errors';
import { environment } from '../env/environment';

export class FirestoreUserRepository extends IUserRepository {
  constructor() {
    super();
    this.profileKeyPrefix = 'javamentor_profile_';
    this.settingsKeyPrefix = 'javamentor_settings_';
    this.progressKeyPrefix = 'javamentor_progress_';
    this.preferencesKeyPrefix = 'javamentor_preferences_';
  }

  // --- MOCK LOCALSTORAGE IMPLEMENTATION ---
  _getMockData(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  _setMockData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async _getMockUser(uid) {
    const profile = this._getMockData(`${this.profileKeyPrefix}${uid}`);
    if (!profile) return null;

    const settings = this._getMockData(`${this.settingsKeyPrefix}${uid}`) || {};
    const progress = this._getMockData(`${this.progressKeyPrefix}${uid}`) || {};
    const preferences = this._getMockData(`${this.preferencesKeyPrefix}${uid}`) || {};

    return new User({
      ...profile,
      settings,
      progress,
      preferences
    });
  }

  async _createMockUser(user) {
    const data = user.toJSON();
    this._setMockData(`${this.profileKeyPrefix}${user.uid}`, {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt,
      lastLogin: data.lastLogin
    });
    this._setMockData(`${this.settingsKeyPrefix}${user.uid}`, data.settings);
    this._setMockData(`${this.progressKeyPrefix}${user.uid}`, data.progress);
    this._setMockData(`${this.preferencesKeyPrefix}${user.uid}`, data.preferences);
  }

  // --- PUBLIC REPOSITORY METHODS ---

  async getUser(uid) {
    if (environment.isMock) {
      return this._getMockUser(uid);
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return null;

      const profile = userSnap.data();

      // Read related documents
      const settingsSnap = await getDoc(doc(db, 'users', uid, 'settings', 'default'));
      const progressSnap = await getDoc(doc(db, 'users', uid, 'progress', '_general'));
      const preferencesSnap = await getDoc(doc(db, 'users', uid, 'preferences', 'default'));

      const settings = settingsSnap.exists() ? settingsSnap.data() : {};
      const progress = progressSnap.exists() ? progressSnap.data() : {};
      const preferences = preferencesSnap.exists() ? preferencesSnap.data() : {};

      return new User({
        ...profile,
        settings,
        progress,
        preferences
      });
    } catch (err) {
      throw new FirestoreError(`Failed to fetch user data for ${uid}: ${err.message}`, 'READ_USER_FAILED', err);
    }
  }

  async createUser(user) {
    if (environment.isMock) {
      return this._createMockUser(user);
    }

    const uid = user.uid;
    const data = user.toJSON();

    // Create base profile document
    try {
      console.info(`[createUser] Writing users/${uid}`);
      await setDoc(doc(db, 'users', uid), {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin
      });
    } catch (err) {
      throw new FirestoreError(`Failed to write users/${uid}: ${err.message}`, 'CREATE_USER_FAILED', err);
    }

    // Create settings document
    try {
      console.info(`[createUser] Writing users/${uid}/settings/default`);
      await setDoc(doc(db, 'users', uid, 'settings', 'default'), data.settings || {});
    } catch (err) {
      throw new FirestoreError(`Failed to write settings/${uid}: ${err.message}`, 'CREATE_USER_FAILED', err);
    }

    // Create progress document
    try {
      console.info(`[createUser] Writing users/${uid}/progress/_general`);
      await setDoc(doc(db, 'users', uid, 'progress', '_general'), data.progress || {});
    } catch (err) {
      throw new FirestoreError(`Failed to write progress/${uid}: ${err.message}`, 'CREATE_USER_FAILED', err);
    }

    // Create preferences document
    try {
      console.info(`[createUser] Writing users/${uid}/preferences/default`);
      await setDoc(doc(db, 'users', uid, 'preferences', 'default'), data.preferences || {});
    } catch (err) {
      throw new FirestoreError(`Failed to write preferences/${uid}: ${err.message}`, 'CREATE_USER_FAILED', err);
    }
  }

  async updateUser(uid, updates) {
    if (environment.isMock) {
      const profile = this._getMockData(`${this.profileKeyPrefix}${uid}`);
      if (profile) {
        this._setMockData(`${this.profileKeyPrefix}${uid}`, { ...profile, ...updates });
      }
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (err) {
      throw new FirestoreError(`Failed to update user profile: ${err.message}`, 'UPDATE_USER_FAILED', err);
    }
  }

  async updateSettings(uid, settings) {
    const rawSettings = settings instanceof Settings ? settings.toJSON() : settings;
    
    if (environment.isMock) {
      const current = this._getMockData(`${this.settingsKeyPrefix}${uid}`) || {};
      this._setMockData(`${this.settingsKeyPrefix}${uid}`, { ...current, ...rawSettings, updatedAt: new Date().toISOString() });
      return;
    }

    try {
      const settingsRef = doc(db, 'users', uid, 'settings', 'default');
      await setDoc(settingsRef, { ...rawSettings, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      throw new FirestoreError(`Failed to sync user settings: ${err.message}`, 'UPDATE_SETTINGS_FAILED', err);
    }
  }

  async updateProgress(uid, progress) {
    const rawProgress = progress instanceof Progress ? progress.toJSON() : progress;
    
    if (environment.isMock) {
      const current = this._getMockData(`${this.progressKeyPrefix}${uid}`) || {};
      this._setMockData(`${this.progressKeyPrefix}${uid}`, { ...current, ...rawProgress });
      return;
    }

    try {
      const progressRef = doc(db, 'users', uid, 'progress', '_general');
      await setDoc(progressRef, rawProgress, { merge: true });
    } catch (err) {
      throw new FirestoreError(`Failed to update student progress: ${err.message}`, 'UPDATE_PROGRESS_FAILED', err);
    }
  }

  async updatePreferences(uid, preferences) {
    const rawPreferences = preferences instanceof Preferences ? preferences.toJSON() : preferences;
    
    if (environment.isMock) {
      const current = this._getMockData(`${this.preferencesKeyPrefix}${uid}`) || {};
      this._setMockData(`${this.preferencesKeyPrefix}${uid}`, { ...current, ...rawPreferences, updatedAt: new Date().toISOString() });
      return;
    }

    try {
      const preferencesRef = doc(db, 'users', uid, 'preferences', 'default');
      await setDoc(preferencesRef, { ...rawPreferences, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      throw new FirestoreError(`Failed to update developer preferences: ${err.message}`, 'UPDATE_PREFERENCES_FAILED', err);
    }
  }
}
