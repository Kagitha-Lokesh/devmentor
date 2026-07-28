export class ILanguageProvider {
  getLanguageId() {
    throw new Error('Method not implemented: getLanguageId');
  }

  getPistonLanguageName() {
    throw new Error('Method not implemented: getPistonLanguageName');
  }

  getPistonVersion() {
    throw new Error('Method not implemented: getPistonVersion');
  }

  /**
   * Returns the Judge0 CE language ID for this language.
   * See: https://ce.judge0.com/languages/
   * Returns null if the language is not supported by Judge0.
   */
  getJudge0LanguageId() {
    return null;
  }

  getStarterFileName() {
    throw new Error('Method not implemented: getStarterFileName');
  }

  getLineCommentPrefix() {
    throw new Error('Method not implemented: getLineCommentPrefix');
  }
}
export default ILanguageProvider;
