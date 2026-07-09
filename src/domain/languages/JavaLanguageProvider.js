import { ILanguageProvider } from './ILanguageProvider';

export class JavaLanguageProvider extends ILanguageProvider {
  getLanguageId() {
    return 'java';
  }

  getPistonLanguageName() {
    return 'java';
  }

  getPistonVersion() {
    return '15.0.2'; // Standard execution version in Piston Sandbox
  }

  getStarterFileName() {
    return 'Solution.java'; // Critical: must match class name in starter code
  }

  getLineCommentPrefix() {
    return '//';
  }
}
export default JavaLanguageProvider;
