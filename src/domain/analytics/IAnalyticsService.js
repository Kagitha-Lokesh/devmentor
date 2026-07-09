/**
 * IAnalyticsService Interface
 * Defines contracts for analytics and tracking operations.
 */
export class IAnalyticsService {
  async logEvent(eventName, params = {}) {
    throw new Error('Method not implemented: logEvent');
  }

  async setUserId(userId) {
    throw new Error('Method not implemented: setUserId');
  }

  async setUserProperties(properties = {}) {
    throw new Error('Method not implemented: setUserProperties');
  }
}
