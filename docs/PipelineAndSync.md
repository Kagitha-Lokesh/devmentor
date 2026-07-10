# JavaMentor — Content Pipeline & Sync Engine

This guide details static index registries, the prebuild pipeline, and the synchronization engine.

---

## 1. Content Pipeline & Registry Generation

Static learning resources are stored under the `/content/` directory:
- `/content/courses/` — Syllabus markdown and lessons.
- `/content/problems/` — Coding challenges markdown, test assertions, and templates.
- `/content/interviews/` — Questions and answers manifest files.

### Prebuild Compilation (`scripts/generate-content-registry.js`):
1. **Validation**: Traverses prerequisites IDs, verifies unique identifiers, and checks for broken file paths.
2. **Registry Output**: Compiles and outputs registry JSON files into `/public/generated/search/` for runtime lazy loading.
3. **Partitioned Search Directory**:
   - `global-search-index.json`
   - `command-index.json`
   - `lesson-index.json`
   - `problems-index.json`

---

## 2. Synchronization Engine

The sync engine handles transitions between online and offline states smoothly:

```
               [ Write Mutation (e.g. Save Note) ]
                                |
                                v
               [ Cache in IndexedDB (uid_noteId) ]
                                |
                                v
               [ Push to SyncQueue (user cache) ]
                                |
             +------------------+------------------+
             |                                     |
      (If Offline)                            (If Online)
             |                                     |
             v                                     v
     [ Keep in Queue ]                      [ Commit Batch ]
             |                                     |
     [ Wait for Reconnect ]                        v
             |                              [ Firestore Save ]
             +-------------------------------------+
```

### Sync Operations:
- **Exponential Backoff**: If network requests fail due to rate limits or database hiccups, the queue retries after `2^count * 1000` milliseconds (1s, 2s, 4s, 8s, up to 30s maximum limit).
- **Conflict Handling**: Failed mutations due to unauthorized authentication blocks are automatically discarded, maintaining queue flow safety.
- **Debounced Processing**: Sequential edits on the same record are grouped and debounced by 1000ms, minimizing Firestore writes counts.
