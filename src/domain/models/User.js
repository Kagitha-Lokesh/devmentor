import { Settings } from './Settings';
import { Preferences } from './Preferences';

export class User {
  constructor({
    uid,
    email,
    displayName = null,
    photoURL = null,
    createdAt = new Date().toISOString(),
    lastLogin = new Date().toISOString(),
    settings = {},
    progress = {},
    preferences = {}
  }) {
    if (!uid) throw new Error('User entity requires a unique ID (uid).');
    if (!email) throw new Error('User entity requires an email address.');

    this.uid = uid;
    this.email = email;
    this.displayName = displayName || email.split('@')[0];
    this.photoURL = photoURL;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
    
    this.settings = settings instanceof Settings ? settings : new Settings(settings);
    // progress is a plain map { [topicId]: ProgressData } — never instantiate as a single Progress model
    this.progress = progress && typeof progress === 'object' ? progress : {};
    this.preferences = preferences instanceof Preferences ? preferences : new Preferences(preferences);
  }

  static fromJSON(json) {
    if (!json) return null;
    return new User({
      uid: json.uid,
      email: json.email,
      displayName: json.displayName,
      photoURL: json.photoURL,
      createdAt: json.createdAt,
      lastLogin: json.lastLogin,
      settings: Settings.fromJSON(json.settings),
      progress: json.progress || {},
      preferences: Preferences.fromJSON(json.preferences)
    });
  }

  toJSON() {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      settings: this.settings.toJSON(),
      progress: this.progress,
      preferences: this.preferences.toJSON()
    };
  }
}
