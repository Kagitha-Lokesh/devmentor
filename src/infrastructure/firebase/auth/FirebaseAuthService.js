import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config';
import { IAuthService } from '../../../domain/auth/IAuthService';
import { AuthenticationError } from '../../../shared/error/errors';

export class MockFirebaseAuthService extends IAuthService {
  constructor() {
    super();
    this.listeners = [];
    this.sessionKey = 'devmentor_mock_session';
    this.usersKey = 'devmentor_mock_users';
    
    // Restore current session
    const saved = localStorage.getItem(this.sessionKey);
    this.currentUser = saved ? JSON.parse(saved) : null;
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Emit initial status
    setTimeout(() => callback(this.currentUser), 50);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _notify() {
    if (this.currentUser) {
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(this.sessionKey);
    }
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  _getUsers() {
    return JSON.parse(localStorage.getItem(this.usersKey)) || {};
  }

  async signIn(email, password) {
    const users = this._getUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users[normalizedEmail];

    if (!user || user.password !== password) {
      throw new AuthenticationError('Invalid email or password.', 'auth/invalid-credential');
    }

    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Learner',
      emailVerified: user.emailVerified ?? false,
      photoURL: null
    };

    this._notify();
    return this.currentUser;
  }

  async signUp(email, password) {
    const users = this._getUsers();
    const normalizedEmail = email.toLowerCase();

    if (users[normalizedEmail]) {
      throw new AuthenticationError('The email address is already in use by another account.', 'auth/email-already-in-use');
    }

    const newUid = 'mock-uid-' + Math.random().toString(36).substring(2, 11);
    users[normalizedEmail] = {
      uid: newUid,
      email: normalizedEmail,
      password: password,
      displayName: normalizedEmail.split('@')[0],
      emailVerified: false // Needs email verification
    };
    
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    this.currentUser = {
      uid: newUid,
      email: normalizedEmail,
      displayName: users[normalizedEmail].displayName,
      emailVerified: false,
      photoURL: null
    };

    this._notify();
    return this.currentUser;
  }

  async signOut() {
    this.currentUser = null;
    this._notify();
  }

  async sendPasswordReset(email) {
    const users = this._getUsers();
    if (!users[email.toLowerCase()]) {
      throw new AuthenticationError('No user found with this email.', 'auth/user-not-found');
    }
  }

  async sendVerificationEmail() {
    // Simulated send
    console.log('[Mock Auth] Simulated sending verification email.');
  }

  // Helper mock trigger to simulate email verified transition
  async verifyMockEmail() {
    if (!this.currentUser) return;
    const users = this._getUsers();
    const email = this.currentUser.email.toLowerCase();
    if (users[email]) {
      users[email].emailVerified = true;
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
    this.currentUser.emailVerified = true;
    this._notify();
  }

  async signInWithGoogle() {
    this.currentUser = {
      uid: 'google-mock-uid-123',
      email: 'google.student@devmentor.ai',
      displayName: 'Google Learner',
      emailVerified: true,
      photoURL: null
    };
    this._notify();
    return this.currentUser;
  }

  async signInWithGithub() {
    this.currentUser = {
      uid: 'github-mock-uid-456',
      email: 'github.student@devmentor.ai',
      displayName: 'GitHub Developer',
      emailVerified: true,
      photoURL: null
    };
    this._notify();
    return this.currentUser;
  }
}

export class LiveFirebaseAuthService extends IAuthService {
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  async signIn(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }

  async signUp(email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      throw new AuthenticationError(err.message, 'auth/signout-failed', err);
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }

  async sendVerificationEmail() {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }

  async signInWithGithub() {
    try {
      const provider = new GithubAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    } catch (err) {
      throw new AuthenticationError(err.message, err.code, err);
    }
  }
}
