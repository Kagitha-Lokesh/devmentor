import { container } from '../../infrastructure/di/container';
import { Result } from '../../shared/result/Result';

export class AnalyticsUseCase {
  constructor() {
    this.analytics = container.resolve('IAnalyticsService');
    this.logger = container.resolve('ILogger');
  }

  async trackEvent(eventName, params = {}) {
    try {
      await this.analytics.logEvent(eventName, params);
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to log analytics event "${eventName}"`, err);
      return Result.failure(err);
    }
  }

  async trackPageView(pagePath) {
    this.logger.debug(`Page view: ${pagePath}`);
    try {
      await this.analytics.logEvent('page_view', { page_path: pagePath });
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to log page view for: ${pagePath}`, err);
      return Result.failure(err);
    }
  }

  async trackSessionStart(userId) {
    this.logger.info(`Session start for user: ${userId}`);
    try {
      await this.analytics.setUserId(userId);
      await this.analytics.logEvent('session_start', { userId });
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to start analytics session for: ${userId}`, err);
      return Result.failure(err);
    }
  }

  async trackSessionEnd() {
    this.logger.info('Session end triggered');
    try {
      await this.analytics.logEvent('session_end');
      return Result.success();
    } catch (err) {
      this.logger.error('Failed to end analytics session', err);
      return Result.failure(err);
    }
  }
}
