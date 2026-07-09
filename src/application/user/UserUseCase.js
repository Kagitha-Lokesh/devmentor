import { container } from '../../infrastructure/di/container';
import { Result } from '../../shared/result/Result';
import { Progress } from '../../domain/models/Progress';
import { User } from '../../domain/models/User';

export class UserUseCase {
  constructor() {
    this.userRepository = container.resolve('IUserRepository');
    this.logger = container.resolve('ILogger');
    this.analytics = container.resolve('IAnalyticsService');
  }

  async getUserProfile(uid) {
    this.logger.info(`Fetching user profile for: ${uid}`);
    try {
      const user = await this.userRepository.getUser(uid);
      if (!user) {
        return Result.empty();
      }
      return Result.success(user);
    } catch (err) {
      this.logger.error(`Failed to get user profile for ${uid}`, err);
      return Result.failure(err);
    }
  }

  async createUserProfile(userData) {
    this.logger.info(`Creating user profile for: ${userData.uid}`);
    try {
      const user = new User(userData);
      await this.userRepository.createUser(user);
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to create profile for ${userData.uid}`, err);
      return Result.failure(err);
    }
  }

  async updateSettings(uid, settingsData) {
    this.logger.info(`Updating settings for user: ${uid}`);
    try {
      await this.userRepository.updateSettings(uid, settingsData);
      await this.analytics.logEvent('theme_change', { theme: settingsData.theme });
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to update settings for ${uid}`, err);
      return Result.failure(err);
    }
  }

  async updatePreferences(uid, preferencesData) {
    this.logger.info(`Updating preferences for user: ${uid}`);
    try {
      await this.userRepository.updatePreferences(uid, preferencesData);
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to update preferences for ${uid}`, err);
      return Result.failure(err);
    }
  }

  async updateProfile(uid, profileData) {
    this.logger.info(`Updating profile for user: ${uid}`);
    try {
      await this.userRepository.updateUser(uid, profileData);
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to update profile for ${uid}`, err);
      return Result.failure(err);
    }
  }

  async updateProgress(uid, progressData) {
    this.logger.info(`Updating progress for user: ${uid}`);
    try {
      await this.userRepository.updateProgress(uid, progressData);
      return Result.success();
    } catch (err) {
      this.logger.error(`Failed to update progress for ${uid}`, err);
      return Result.failure(err);
    }
  }

  /**
   * Pure Business Logic: Complete an activity, increment XP, calculate streaks, and re-estimate readiness index.
   */
  async completeActivity(uid, currentProgress, xpEarned, activityType, activityId) {
    this.logger.info(`Completing activity for user: ${uid}. XP +${xpEarned}`);
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = currentProgress.lastActivityDate;
      
      let newStreak = currentProgress.streak;
      if (!lastActive) {
        // First activity ever
        newStreak = 1;
      } else {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive active day
          newStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If diffDays === 0 (already active today), streak remains unchanged
      }

      const newXp = currentProgress.xp + xpEarned;
      
      // Dynamic Readiness Index formula: readinessIndex maps to XP progression capped at 100%
      const newReadinessIndex = Math.min(100, Math.floor(newXp / 10));

      const updatedProgress = new Progress({
        ...currentProgress,
        xp: newXp,
        streak: newStreak,
        lastActivityDate: today,
        readinessIndex: newReadinessIndex
      });

      // Persist in repository
      await this.userRepository.updateProgress(uid, updatedProgress);
      
      // Track analytics
      await this.analytics.logEvent(activityType, {
        userId: uid,
        activityId,
        xpEarned,
        newStreak,
        readinessIndex: newReadinessIndex
      });

      return Result.success(updatedProgress);
    } catch (err) {
      this.logger.error(`Failed to record completed activity for ${uid}`, err);
      return Result.failure(err);
    }
  }
}
