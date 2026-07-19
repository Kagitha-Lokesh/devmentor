import { container } from '../../infrastructure/di/container';
import { Result } from '../../shared/result/Result';
import { User } from '../../domain/models/User';

export class AuthUseCase {
  constructor() {
    this.authService = container.resolve('IAuthService');
    this.userRepository = container.resolve('IUserRepository');
    this.logger = container.resolve('ILogger');
    this.analytics = container.resolve('IAnalyticsService');
  }

  async signIn(email, password) {
    this.logger.info(`Attempting signIn for: ${email}`);
    try {
      let authUser;
      try {
        authUser = await this.authService.signIn(email, password);
      } catch (err) {
        // Self-heal/auto-register the demo user if missing from Firebase Auth
        if (email === 'demo@javamentor.com' && password === 'demopass123') {
          this.logger.info('Demo user login failed. Attempting to register demo user...');
          const registerResult = await this.signUp(email, password);
          if (registerResult.isSuccess) {
            return registerResult;
          }
        }
        throw err;
      }
      
      let user = await this.userRepository.getUser(authUser.uid);
      if (!user) {
        this.logger.info(`Firestore user document not found for active auth user ${authUser.uid}. Creating one...`);
        user = new User({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          settings: {},
          progress: {},
          preferences: {}
        });
        await this.userRepository.createUser(user);
      } else {
        await this.userRepository.updateUser(authUser.uid, {
          lastLogin: new Date().toISOString()
        });
        // Update local object to reflect the change
        user.lastLogin = new Date().toISOString();
      }

      await this.analytics.logEvent('login', { method: 'email', userId: authUser.uid });
      return Result.success(user);
    } catch (err) {
      this.logger.error(`Login failed for ${email}: ${err.message}`, err);
      return Result.failure(err);
    }
  }

  async signUp(email, password) {
    this.logger.info(`Attempting signUp for: ${email}`);
    try {
      const authUser = await this.authService.signUp(email, password);

      // Construct a new rich Domain model
      const user = new User({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        settings: {},
        progress: {},
        preferences: {}
      });

      // Persist in repository
      await this.userRepository.createUser(user);
      
      await this.analytics.logEvent('signup', { method: 'email', userId: authUser.uid });
      return Result.success(user);
    } catch (err) {
      this.logger.error(`Signup failed for ${email}: ${err.message}`, err);
      return Result.failure(err);
    }
  }

  async signInWithGoogle() {
    this.logger.info('Attempting Google provider sign in');
    try {
      const authUser = await this.authService.signInWithGoogle();
      
      let user = await this.userRepository.getUser(authUser.uid);
      if (!user) {
        // Initialize new user document for Google Sign-in if missing
        user = new User({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        await this.userRepository.createUser(user);
      } else {
        await this.userRepository.updateUser(authUser.uid, {
          lastLogin: new Date().toISOString()
        });
        user = await this.userRepository.getUser(authUser.uid);
      }

      await this.analytics.logEvent('login', { method: 'google', userId: authUser.uid });
      return Result.success(user);
    } catch (err) {
      this.logger.error('Google provider sign in failed', err);
      return Result.failure(err);
    }
  }

  async signInWithGithub() {
    this.logger.info('Attempting GitHub provider sign in');
    try {
      const authUser = await this.authService.signInWithGithub();
      
      let user = await this.userRepository.getUser(authUser.uid);
      if (!user) {
        // Initialize new user document for GitHub Sign-in if missing
        user = new User({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        await this.userRepository.createUser(user);
      } else {
        await this.userRepository.updateUser(authUser.uid, {
          lastLogin: new Date().toISOString()
        });
        user = await this.userRepository.getUser(authUser.uid);
      }

      await this.analytics.logEvent('login', { method: 'github', userId: authUser.uid });
      return Result.success(user);
    } catch (err) {
      this.logger.error('GitHub provider sign in failed', err);
      return Result.failure(err);
    }
  }

  async signOut() {
    this.logger.info('Logging out active user session');
    try {
      await this.authService.signOut();
      await this.analytics.logEvent('logout');
      return Result.success();
    } catch (err) {
      this.logger.error('SignOut failed', err);
      return Result.failure(err);
    }
  }

  async sendPasswordReset(email) {
    this.logger.info(`Sending password reset to: ${email}`);
    try {
      await this.authService.sendPasswordReset(email);
      return Result.success();
    } catch (err) {
      this.logger.error(`Password reset request failed for ${email}`, err);
      return Result.failure(err);
    }
  }

  async sendVerificationEmail() {
    this.logger.info('Requesting verification email send');
    try {
      await this.authService.sendVerificationEmail();
      return Result.success();
    } catch (err) {
      this.logger.error('Verification email trigger failed', err);
      return Result.failure(err);
    }
  }

  onAuthStateChanged(callback) {
    return this.authService.onAuthStateChanged(callback);
  }
}
