import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { Submission } from '../../domain/models/Submission';
import { ISubmissionRepository } from '../../domain/repository/ISubmissionRepository';
import { container } from '../di/container';

export class FirestoreSubmissionRepository extends ISubmissionRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _getMockSubmissions(uid) {
    try {
      const data = localStorage.getItem(`mock_submissions_${uid}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveMockSubmission(uid, submission) {
    const list = this._getMockSubmissions(uid);
    list.push({
      ...submission,
      createdAt: submission.createdAt.toISOString()
    });
    localStorage.setItem(`mock_submissions_${uid}`, JSON.stringify(list));
  }

  async saveSubmission(uid, submission) {
    this.logger.info(`Recording code submission logs for user: ${uid}, problem: ${submission.problemId}`);
    
    // Create static ID
    const submissionId = submission.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    submission.id = submissionId;

    if (this.env.isMock) {
      this._saveMockSubmission(uid, submission);
      return submissionId;
    }

    try {
      const docRef = doc(db, 'users', uid, 'submissions', submissionId);
      
      // Store metadata only (no full source code inside Firestore to minimize usage billing)
      await setDoc(docRef, {
        id: submissionId,
        problemId: submission.problemId,
        language: submission.language,
        verdict: submission.verdict,
        runtime: submission.runtime,
        memory: submission.memory,
        createdAt: submission.createdAt.toISOString()
      });
      return submissionId;
    } catch (err) {
      this.logger.error(`Failed to store submission in Firestore: ${err.message}`, err);
      throw err;
    }
  }

  async getSubmissionsByProblem(uid, problemId) {
    if (this.env.isMock) {
      const all = this._getMockSubmissions(uid);
      return all
        .filter(s => s.problemId === problemId)
        .map(s => new Submission({ ...s, createdAt: new Date(s.createdAt) }))
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const subColRef = collection(db, 'users', uid, 'submissions');
      const q = query(subColRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.problemId === problemId) {
          list.push(new Submission({
            ...data,
            createdAt: new Date(data.createdAt)
          }));
        }
      });
      return list;
    } catch (err) {
      this.logger.error(`Failed to load submissions from Firestore: ${err.message}`, err);
      return [];
    }
  }

  async getSubmissionsHistory(uid) {
    if (this.env.isMock) {
      const all = this._getMockSubmissions(uid);
      return all
        .map(s => new Submission({ ...s, createdAt: new Date(s.createdAt) }))
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const subColRef = collection(db, 'users', uid, 'submissions');
      const q = query(subColRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push(new Submission({
          ...data,
          createdAt: new Date(data.createdAt)
        }));
      });
      return list;
    } catch (err) {
      this.logger.error(`Failed to list user submissions from Firestore: ${err.message}`, err);
      return [];
    }
  }
}
export default FirestoreSubmissionRepository;
