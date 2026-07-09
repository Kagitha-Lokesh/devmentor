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

  getStarterFileName() {
    throw new Error('Method not implemented: getStarterFileName');
  }

  getLineCommentPrefix() {
    throw new Error('Method not implemented: getLineCommentPrefix');
  }
}
export default ILanguageProvider;
