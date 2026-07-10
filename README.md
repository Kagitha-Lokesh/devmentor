# JavaMentor — Enterprise Full-Stack Coding Mentor Platform

JavaMentor is a feature-rich developer training application designed for full-stack engineer training. Built on **Clean Architecture**, **Dependency Injection**, and **Offline-First Synchronization** models.

---

## 1. System Features
- **Learning Intelligence**: Modular course structures, chapters progression, and Socratic markdown lesson guides.
- **Practice compiler Sandbox**: Multi-language code compiler powered by Piston API running on a sandboxed executor, featuring mobile tab alignments.
- **Mock Interviews**: Company-specific track interviews with interactive answer profiling.
- **Productivity Dashboard**: Notes & Highlights, Unified Bookmarks, and Calendar Planners.
- **Robust Offline mode**: Upgraded v7 IndexedDB multi-user partitioned range caches and backoff sync queues.

---

## 2. Technical Stack
- **Framework**: React 19 (Vite, Rollup chunks optimization)
- **Styling**: Vanilla Tailwind CSS v3
- **Database / Auth**: Google Firebase Spark Plan (Hosting, Authentication, Firestore)
- **Local DB**: IndexedDB
- **Fuzzy Search Engine**: Fuse.js client-side search indexing
- **Code Editor**: Monaco Code Editor

---

## 3. Setup & Development
```bash
# Clone the repository and install packages
npm install

# Start local server with static registry generator
npm run dev
```

---

## 4. Documentation Links
- [System Architecture Guide](./docs/Architecture.md)
- [Developer Setup Instructions](./docs/DeveloperGuide.md)
- [API Contracts & IndexedDB Schema](./docs/APIDocumentation.md)
- [Vitest & Playwright Testing Matrix](./docs/TestingGuide.md)
- [Firebase Hosting Deployment](./docs/DeploymentGuide.md)
