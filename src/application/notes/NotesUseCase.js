import { container } from '../../infrastructure/di/container';
import { Note } from '../../domain/models/Note';

export class NotesUseCase {
  _getRepo() {
    return container.resolve('INotesRepository');
  }

  async listNotes(uid) {
    return this._getRepo().listNotes(uid);
  }

  async createNote(uid, { title, content, targetType, targetId, tags }) {
    const note = new Note({ userId: uid, title, content, targetType, targetId, tags: tags || [] });
    await this._getRepo().saveNote(uid, note);
    return note;
  }

  async updateNote(uid, noteId, changes) {
    const note = await this._getRepo().getNote(uid, noteId);
    if (!note) return null;
    Object.assign(note, changes);
    note.updatedAt = new Date();
    await this._getRepo().saveNote(uid, note);
    return note;
  }

  async deleteNote(uid, noteId) {
    return this._getRepo().deleteNote(uid, noteId);
  }

  async addHighlight(uid, { targetType, targetId, highlightedText, color, tags }) {
    const note = new Note({
      userId: uid,
      title: `Highlight — ${highlightedText.slice(0, 40)}`,
      content: highlightedText,
      targetType,
      targetId,
      isHighlight: true,
      highlightedText,
      color: color || 'yellow',
      tags: tags || []
    });
    await this._getRepo().saveNote(uid, note);
    return note;
  }

  async getHighlightsForTarget(uid, targetType, targetId) {
    return this._getRepo().getHighlightsForTarget(uid, targetType, targetId);
  }
}
export default NotesUseCase;
