export class Settings {
  constructor({
    theme = 'dark',
    pistonLanguage = 'java',
    compilerFontSize = 14,
    notificationsEnabled = true,
    updatedAt = new Date().toISOString()
  } = {}) {
    this.theme = theme;
    this.pistonLanguage = pistonLanguage;
    this.compilerFontSize = compilerFontSize;
    this.notificationsEnabled = notificationsEnabled;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    if (!json) return new Settings();
    return new Settings(json);
  }

  toJSON() {
    return {
      theme: this.theme,
      pistonLanguage: this.pistonLanguage,
      compilerFontSize: this.compilerFontSize,
      notificationsEnabled: this.notificationsEnabled,
      updatedAt: this.updatedAt
    };
  }
}
