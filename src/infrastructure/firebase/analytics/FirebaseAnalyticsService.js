import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { app } from '../config';
import { IAnalyticsService } from '../../../domain/analytics/IAnalyticsService';
import { environment } from '../../env/environment';

export class FirebaseAnalyticsService extends IAnalyticsService {
  constructor() {
    super();
    this.analytics = null;
    this.mockStorageKey = 'devmentor_mock_analytics';

    if (environment.analyticsEnabled) {
      try {
        this.analytics = getAnalytics(app);
      } catch (err) {
        console.warn('[Analytics] Failed to initialize live Firebase Analytics:', err.message);
      }
    }
  }

  async logEvent(eventName, params = {}) {
    const payload = {
      ...params,
      timestamp: new Date().toISOString()
    };

    if (this.analytics) {
      try {
        firebaseLogEvent(this.analytics, eventName, payload);
      } catch (err) {
        console.error(`[Analytics] Error logging event "${eventName}":`, err.message);
      }
    } else {
      // Mock tracking storage
      try {
        const events = JSON.parse(localStorage.getItem(this.mockStorageKey)) || [];
        events.push({ eventName, payload });
        // Cap mock events array length to prevent memory leakage
        if (events.length > 200) events.shift();
        localStorage.setItem(this.mockStorageKey, JSON.stringify(events));
        console.log(`[Mock Analytics] Event logged: "${eventName}"`, payload);
      } catch (err) {
        // Silent fail for storage check
      }
    }
  }

  async setUserId(userId) {
    if (this.analytics) {
      // Set user id in production Firebase
    } else {
      console.log(`[Mock Analytics] User ID set to: ${userId}`);
    }
  }

  async setUserProperties(properties = {}) {
    if (this.analytics) {
      // Set user properties in production Firebase
    } else {
      console.log('[Mock Analytics] User properties updated:', properties);
    }
  }
}
