/**
 * IAuthService Interface
 * Defines contracts for all authentication flows.
 */
export class IAuthService {
  async signIn(email, password) {
    throw new Error('Method not implemented: signIn');
  }

  async signUp(email, password) {
    throw new Error('Method not implemented: signUp');
  }

  async signOut() {
    throw new Error('Method not implemented: signOut');
  }

  async sendPasswordReset(email) {
    throw new Error('Method not implemented: sendPasswordReset');
  }

  onAuthStateChanged(callback) {
    throw new Error('Method not implemented: onAuthStateChanged');
  }

  async sendVerificationEmail() {
    throw new Error('Method not implemented: sendVerificationEmail');
  }

  async signInWithGoogle() {
    throw new Error('Method not implemented: signInWithGoogle');
  }

  async signInWithGithub() {
    throw new Error('Method not implemented: signInWithGithub');
  }
}
