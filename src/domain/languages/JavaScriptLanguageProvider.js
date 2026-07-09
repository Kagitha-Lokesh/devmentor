import { ILanguageProvider } from './ILanguageProvider';

export class JavaScriptLanguageProvider extends ILanguageProvider {
  getLanguageId() {
    return 'javascript';
  }

  getPistonLanguageName() {
    return 'javascript';
  }

  getPistonVersion() {
    return '18.15.0'; // Standard execution version in Piston Sandbox
  }

  getStarterFileName() {
    return 'solution.js';
  }

  getLineCommentPrefix() {
    return '//';
  }
}
export default JavaScriptLanguageProvider;
