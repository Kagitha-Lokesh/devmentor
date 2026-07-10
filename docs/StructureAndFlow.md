# DevMentor AI — Workspace Structure & System Flow Diagrams

This guide documents the folder layout, user authentication flows, and data interaction sequence loops.

---

## 1. Directory Tree & Folder Structure

```
/
├── .github/workflows/      # GitHub Actions CI pipeline configs
├── content/                # Course curriculum markdown, quizzes, flashcards JSONs
├── docs/                   # System manuals, showcase case studies, resume guides
├── public/                 # Static PWA icons and generated content registry index files
├── scripts/                # content validator and registry generation scripts
├── src/                    # Core source code
│   ├── application/        # Application Use Cases
│   ├── domain/             # Entities, Models, and Repository interfaces
│   ├── infrastructure/     # Database classes, DI container, config files
│   └── presentation/       # UI Components, pages, routing, Zustand state stores
└── tailwind.config.js      # Global layout styles config
```

---

## 2. Sequence Diagrams

### A. Authentication & User Login Sequence
```mermaid
sequenceDiagram
  actor User
  participant UI as Login Page
  participant AuthStore as useAuthStore
  participant AuthRepo as FirebaseAuthRepository
  participant DB as Firebase Auth

  User->>UI: Input email + password
  UI->>AuthStore: Trigger signIn()
  AuthStore->>AuthRepo: Call authenticate()
  AuthRepo->>DB: Send Auth Request
  DB-->>AuthRepo: Return User Token
  AuthRepo-->>AuthStore: Confirm sign-in
  AuthStore->>UI: Redirect to Dashboard
```

### B. Offline Cache & Sync Queue Sequence
```mermaid
sequenceDiagram
  actor User
  participant UI as Notes Editor
  participant Repo as NotesRepository
  participant DB as localDB (IndexedDB)
  participant Queue as SyncQueue
  participant Firestore as Firestore Database

  User->>UI: Save note modifications
  UI->>Repo: Call saveNote()
  Repo->>DB: Write to LocalDB (uid_noteId)
  Repo->>Queue: Enqueue mutation (notes, uid)
  Queue->>DB: Write to queue cache
  Note over Queue: If online connectivity active
  Queue->>Firestore: Execute Firestore commit batch
  Firestore-->>Queue: Acknowledge sync write
  Queue->>DB: Remove from queue cache
```
