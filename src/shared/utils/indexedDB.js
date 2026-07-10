class LocalDatabase {
  constructor() {
    this.dbName = 'JavaMentorAI_LocalDB';
    this.dbVersion = 7;
    this.db = null;
  }

  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('IndexedDB database failed to open.'));
      };
      
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const transaction = request.transaction;
        const oldVersion = e.oldVersion;

        const v1Stores = [
          'sessions',         // Editor session states (code, cursors, scopes)
          'runs',             // Last console run outputs
          'history',          // Source code for submissions (submissionId -> code string)
          'settings',         // General IDE options
          'recentProblems',   // Recently visited problems
          'executionCache'    // Local cached runs
        ];

        v1Stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        });

        if (oldVersion < 2) {
          const v2Stores = [
            'revisionQueue',    // Cached computed queue
            'revisionHistory',  // Recent session summaries (offline)
            'flashcardCache',   // Per-topic static flashcard JSON
            'mindMapCache',     // Per-topic static mindmap JSON
            'offlineReviews'    // Card reviews submitted while offline
          ];
          v2Stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        }

        if (oldVersion < 3) {
          const v3Stores = [
            'interviewCache',   // Cached interview question/company data
            'sessionDrafts',    // In-progress session states (persisted across refresh)
            'offlineSessions',  // Completed sessions when offline (before sync)
            'bookmarkCache',    // Question bookmarks local copy
            'recentQuestions'   // Recently answered/viewed question IDs
          ];
          v3Stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        }

        if (oldVersion < 4) {
          const v4Stores = [
            'assistantHistory',    // Full message histories (IndexedDB)
            'assistantCache',      // LLM/Ollama response cache keys
            'promptCache',         // Compiled templates cache
            'conversationDrafts',  // Active typing drafts
            'knowledgeCache',      // Knowledge retrieval map
            'lessonCache',         // Cached static lessons
            'problemCache',        // Cached problems metadata
            'revisionCache',       // Cached revision stats
            'interviewCacheStore', // Cached interview structures
            'searchCache'          // Fast search lookup
          ];
          v4Stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        }

        if (oldVersion < 5) {
          const v5Stores = [
            'projectCache',
            'projectProgress',
            'offlineProjects',
            'recentProjects',
            'projectDrafts'
          ];
          v5Stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        }

        if (oldVersion < 6) {
          const v6Stores = [
            'notes',
            'bookmarks',
            'timeline',
            'calendar',
            'downloads',
            'exports',
            'recentSearches',
            'commandHistory',
            'achievements'
          ];
          v6Stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        }

        // Fix 4: Transactional key migration inside v7 upgrade
        if (oldVersion > 0 && oldVersion < 7) {
          console.info(`[IndexedDB Migration] Upgrading database from v${oldVersion} to v7: migrating keys transactionally.`);
          const userStores = [
            'notes',
            'bookmarks',
            'timeline',
            'calendar',
            'downloads',
            'exports',
            'achievements',
            'revisionHistory',
            'assistantHistory',
            'conversationDrafts'
          ];

          userStores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) return;
            const store = transaction.objectStore(storeName);
            
            const cursorReq = store.openCursor();
            cursorReq.onsuccess = (evt) => {
              const cursor = evt.target.result;
              if (cursor) {
                const oldKey = cursor.key;
                const value = cursor.value;

                // Skip if key is already composite (has '_' prefix)
                if (typeof oldKey === 'string' && oldKey.includes('_')) {
                  cursor.continue();
                  return;
                }

                // Resolve owner UID
                const recordUid = value.userId || value.uid || value.ownerId;
                if (recordUid) {
                  const newKey = `${recordUid}_${oldKey}`;
                  try {
                    store.delete(oldKey);
                    store.put(value, newKey);
                  } catch (err) {
                    console.warn(`[IndexedDB Migration] Failed to migrate key ${oldKey} in store ${storeName}:`, err);
                  }
                }
                cursor.continue();
              }
            };
          });
        }
      };
    });
  }

  async get(storeName, key) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  async put(storeName, key, value) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`IndexedDB write failed on store ${storeName}:`, err);
    }
  }

  async delete(storeName, key) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`IndexedDB delete failed on store ${storeName}:`, err);
    }
  }

  async getAllByPrefix(storeName, prefix) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const range = IDBKeyRange.bound(`${prefix}_`, `${prefix}_\uffff`);
        const request = store.getAll(range);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`IndexedDB getAllByPrefix failed on store ${storeName}:`, err);
      return [];
    }
  }
}

export const localDB = new LocalDatabase();
export default localDB;
