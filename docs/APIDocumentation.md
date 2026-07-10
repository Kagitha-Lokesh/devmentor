# JavaMentor — API & Storage Schema Documentation

## 1. Domain Repository Contracts

### A. Notes API (`INotesRepository`)
- `getNote(uid, noteId)`: Resolves note by key.
- `listNotes(uid)`: Returns notes range list matching owner.
- `saveNote(uid, note)`: Puts note into local db and enqueues sync request.
- `deleteNote(uid, noteId)`: Deletes cached note.
- `getHighlightsForTarget(uid, targetType, targetId)`: Filters highlight items.

### B. Bookmarks API (`IBookmarkRepository`)
- `getBookmark(uid, bookmarkId)`
- `listBookmarks(uid)`
- `saveBookmark(uid, bookmark)`
- `deleteBookmark(uid, bookmarkId)`

---

## 2. Local IndexedDB Schema
IndexedDB data is stored under the `JavaMentorAI_LocalDB` database (v7):

| Object Store | Key Format | Description |
| ------------ | ---------- | ----------- |
| `notes` | `uid_noteId` | Rich user notes and highlighted snippets |
| `bookmarks` | `uid_bookmarkId` | Bookmarked lessons and interview questions |
| `calendar` | `uid_taskId` | Planning calendar items and checklists |
| `timeline` | `uid_eventId` | Log of active events and progress history |
| `executionCache` | `pending_mutations_uid` | User-scoped queue array of background sync operations |

---

## 3. Sync Queue Item Structure
Background sync mutations follow this format:
```json
{
  "id": "mut_1720584000_a3df2",
  "type": "notes",
  "uid": "user_id_string",
  "data": {
    "id": "note_123",
    "title": "Clean Architecture Notes",
    "content": "Use domain model abstractions..."
  },
  "createdAt": 1720584000000,
  "retryCount": 0,
  "lastAttempt": null,
  "status": "pending"
}
```
If network is offline, mutations status is set to `'pending'`. Upon online recovery, the queue initiates batch transactions.
