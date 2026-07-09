import { db } from '../firebase/config';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs
} from 'firebase/firestore';
import { IProjectProgressRepository } from '../../domain/repository/IProjectProgressRepository';
import { ProjectProgress, ProjectHealth } from '../../domain/models/ProjectProgress';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class FirestoreProjectProgressRepository extends IProjectProgressRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _storeKey(uid, projectId) {
    return `project_progress_${uid}_${projectId}`;
  }

  _listKey(uid) {
    return `project_progress_list_${uid}`;
  }

  async getProgress(uid, projectId) {
    try {
      // 1. Check IndexedDB first
      const cached = await localDB.get('projectProgress', this._storeKey(uid, projectId));
      if (cached) return new ProjectProgress(cached);

      // 2. Fetch from Firestore if online
      if (this.env.isMock || !navigator.onLine) return null;
      const docRef = doc(db, 'users', uid, 'projectProgress', projectId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;

      const data = snap.data();
      await localDB.put('projectProgress', this._storeKey(uid, projectId), data);
      return new ProjectProgress(data);
    } catch (err) {
      this.logger.warn(`[FirestoreProjectProgressRepository] getProgress error: ${err.message}`);
      return null;
    }
  }

  async listProgress(uid) {
    try {
      // Try local cache list
      const cachedList = localStorage.getItem(this._listKey(uid));
      if (cachedList) {
        const ids = JSON.parse(cachedList);
        const results = await Promise.all(
          ids.map(id => this.getProgress(uid, id))
        );
        return results.filter(Boolean);
      }

      // Fetch all from Firestore
      if (this.env.isMock || !navigator.onLine) return [];
      const colRef = collection(db, 'users', uid, 'projectProgress');
      const snap = await getDocs(colRef);
      const list = [];
      const ids = [];
      for (const d of snap.docs) {
        const data = d.data();
        await localDB.put('projectProgress', this._storeKey(uid, d.id), data);
        list.push(new ProjectProgress(data));
        ids.push(d.id);
      }
      localStorage.setItem(this._listKey(uid), JSON.stringify(ids));
      return list;
    } catch (err) {
      this.logger.warn(`[FirestoreProjectProgressRepository] listProgress error: ${err.message}`);
      return [];
    }
  }

  async saveProgress(uid, progress) {
    try {
      const data = progress.toJSON();
      // 1. Always write locally first
      await localDB.put('projectProgress', this._storeKey(uid, progress.projectId), data);

      // 2. Update local list index
      const cachedList = localStorage.getItem(this._listKey(uid));
      const ids = cachedList ? JSON.parse(cachedList) : [];
      if (!ids.includes(progress.projectId)) {
        ids.push(progress.projectId);
        localStorage.setItem(this._listKey(uid), JSON.stringify(ids));
      }

      // 3. Queue Firestore sync
      await syncQueue.enqueue({
        type: 'projectProgress',
        action: 'save',
        uid,
        projectId: progress.projectId,
        payload: data
      });
    } catch (err) {
      this.logger.warn(`[FirestoreProjectProgressRepository] saveProgress error: ${err.message}`);
    }
  }

  async completeTask(uid, projectId, taskId) {
    let progress = await this.getProgress(uid, projectId);
    if (!progress) {
      progress = new ProjectProgress({ uid, projectId, health: ProjectHealth.IN_PROGRESS });
    }
    if (!progress.completedTasks.includes(taskId)) {
      progress.completedTasks = [...progress.completedTasks, taskId];
    }
    if (progress.health === ProjectHealth.NOT_STARTED || progress.health === ProjectHealth.STARTED) {
      progress.health = ProjectHealth.IN_PROGRESS;
    }
    progress.lastActiveAt = new Date();
    if (!progress.startedAt) progress.startedAt = new Date();
    await this.saveProgress(uid, progress);
    return progress;
  }

  async unlockMilestone(uid, projectId, milestoneId) {
    const progress = await this.getProgress(uid, projectId)
      || new ProjectProgress({ uid, projectId });
    if (!progress.unlockedMilestones.includes(milestoneId)) {
      progress.unlockedMilestones = [...progress.unlockedMilestones, milestoneId];
    }
    await this.saveProgress(uid, progress);
  }

  async resetProgress(uid, projectId) {
    const fresh = new ProjectProgress({ uid, projectId, health: ProjectHealth.NOT_STARTED });
    await localDB.put('projectProgress', this._storeKey(uid, projectId), fresh.toJSON());
    await syncQueue.enqueue({
      type: 'projectProgress',
      action: 'reset',
      uid,
      projectId,
      payload: fresh.toJSON()
    });
  }

  async updateHealth(uid, projectId, health) {
    const progress = await this.getProgress(uid, projectId)
      || new ProjectProgress({ uid, projectId });
    progress.health = health;
    progress.lastActiveAt = new Date();
    await this.saveProgress(uid, progress);
  }
}

// Sync handler called by syncQueue when online
export async function syncProjectProgressMutation(mutation) {
  const { action, uid, projectId, payload } = mutation;
  const docRef = doc(db, 'users', uid, 'projectProgress', projectId);
  if (action === 'save') {
    await setDoc(docRef, payload, { merge: true });
  } else if (action === 'reset') {
    await setDoc(docRef, payload);
  }
}

export default FirestoreProjectProgressRepository;
