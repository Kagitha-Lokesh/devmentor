import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Note } from '../../domain/models/Note';
import { INotesRepository } from '../../domain/repository/INotesRepository';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class NotesRepository extends INotesRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  async getNote(uid, noteId) {
    const cached = await localDB.get('notes', noteId);
    if (cached && cached.userId === uid) {
      return new Note(cached);
    }
    return null;
  }

  async listNotes(uid) {
    const all = await this._getAllLocalNotes();
    const userNotes = all.filter(n => n.userId === uid);
    if (userNotes.length > 0) {
      return userNotes.map(n => new Note(n));
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const colRef = collection(db, 'users', uid, 'notes');
      const snap = await getDocs(colRef);
      const list = [];
      for (const d of snap.docs) {
        const data = d.data();
        const note = new Note({ ...data, id: d.id, userId: uid });
        await localDB.put('notes', note.id, note.toJSON());
        list.push(note);
      }
      return list;
    } catch (err) {
      this.logger.warn(`Failed to sync notes list from firestore: ${err.message}`);
      return [];
    }
  }

  async saveNote(uid, note) {
    note.userId = uid;
    note.updatedAt = new Date();
    const data = note.toJSON();
    await localDB.put('notes', note.id, data);
    await syncQueue.enqueue('notes', uid, data);
  }

  async deleteNote(uid, noteId) {
    const cached = await localDB.get('notes', noteId);
    if (cached) {
      await localDB.delete('notes', noteId);
      await syncQueue.enqueue('notes', uid, { id: noteId, deleted: true });
    }
  }

  async getHighlightsForTarget(uid, targetType, targetId) {
    const all = await this._getAllLocalNotes();
    return all
      .filter(n => n.userId === uid && n.isHighlight === true && n.targetType === targetType && n.targetId === targetId)
      .map(n => new Note(n));
  }

  async _getAllLocalNotes() {
    try {
      const dbInstance = await localDB.open();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction('notes', 'readonly');
        const store = transaction.objectStore('notes');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}
export default NotesRepository;
