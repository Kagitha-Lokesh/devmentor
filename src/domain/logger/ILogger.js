/**
 * ILogger Interface
 * Defines contracts for level-filtered logging.
 */
export class ILogger {
  debug(message, context = null) {
    throw new Error('Method not implemented: debug');
  }

  info(message, context = null) {
    throw new Error('Method not implemented: info');
  }

  warn(message, context = null) {
    throw new Error('Method not implemented: warn');
  }

  error(message, errorObject = null, context = null) {
    throw new Error('Method not implemented: error');
  }

  fatal(message, errorObject = null, context = null) {
    throw new Error('Method not implemented: fatal');
  }
}
