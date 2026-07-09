import { ILanguageProvider } from './ILanguageProvider';

export class SQLLanguageProvider extends ILanguageProvider {
  getLanguageId() {
    return 'sql';
  }

  getPistonLanguageName() {
    return 'sqlite3'; // Piston runs SQL via SQLite engine
  }

  getPistonVersion() {
    return '3.36.0';
  }

  getStarterFileName() {
    return 'query.sql';
  }

  getLineCommentPrefix() {
    return '--';
  }
}
export default SQLLanguageProvider;
