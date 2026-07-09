import { ILogger } from '../../domain/logger/ILogger';
import { environment } from '../env/environment';

const LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

export class CentralizedLogger extends ILogger {
  constructor() {
    super();
    this.minLevel = environment.isProd ? LogLevels.WARN : LogLevels.DEBUG;
    if (environment.isTest) {
      this.minLevel = LogLevels.FATAL + 1; // Suppress all logs during testing
    }
  }

  _shouldLog(level) {
    return environment.loggingEnabled && level >= this.minLevel;
  }

  _format(levelName, message, context) {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${levelName}] ${message}${contextString}`;
  }

  debug(message, context = null) {
    if (this._shouldLog(LogLevels.DEBUG)) {
      console.debug(this._format('DEBUG', message, context));
    }
  }

  info(message, context = null) {
    if (this._shouldLog(LogLevels.INFO)) {
      console.info(this._format('INFO', message, context));
    }
  }

  warn(message, context = null) {
    if (this._shouldLog(LogLevels.WARN)) {
      console.warn(this._format('WARN', message, context));
    }
  }

  error(message, errorObject = null, context = null) {
    if (this._shouldLog(LogLevels.ERROR)) {
      const errDetails = errorObject ? ` | Error: ${errorObject.message}\nStack: ${errorObject.stack}` : '';
      console.error(this._format('ERROR', message, context) + errDetails);
    }
  }

  fatal(message, errorObject = null, context = null) {
    if (this._shouldLog(LogLevels.FATAL)) {
      const errDetails = errorObject ? ` | Fatal Error: ${errorObject.message}\nStack: ${errorObject.stack}` : '';
      console.error(
        `%c${this._format('FATAL', message, context) + errDetails}`,
        'color: red; font-weight: bold; font-size: 1.2em;'
      );
    }
  }
}
