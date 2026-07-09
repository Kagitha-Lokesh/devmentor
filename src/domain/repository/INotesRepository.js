export class INotesRepository {
  async getNote(uid, noteId) {
    throw new Error('Not implemented.');
  }

  async listNotes(uid) {
    throw new Error('Not implemented.');
  }

  async saveNote(uid, note) {
    throw new Error('Not implemented.');
  }

  async deleteNote(uid, noteId) {
    throw new Error('Not implemented.');
  }

  async getHighlightsForTarget(uid, targetType, targetId) {
    throw new Error('Not implemented.');
  }
}
export default INotesRepository;
