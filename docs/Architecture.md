# JavaMentor — System Architecture & Core Concepts

## 1. Clean Architecture Overview
JavaMentor is built upon Clean Architecture principles, separating business domains from visual interfaces and backend providers:

- **Domain Layer (`/src/domain`)**: Contains enterprise models, schemas, and repository interfaces. It depends on nothing else.
- **Application Layer (`/src/application`)**: Houses workflow-specific use cases. Calls domain models and coordinates repository transactions.
- **Infrastructure Layer (`/src/infrastructure`)**: Implements external drivers: database repositories (Firebase/Firestore), localized caches, and DI configuration.
- **Presentation Layer (`/src/presentation`)**: Contains the React view model, state stores (Zustand), styling layouts, and UI component catalog.

```
       +---------------------------------------------+
       |             Presentation (React)            |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |          Application (Use Cases)            |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |             Domain (Interfaces)             |
       +---------------------------------------------+
                              ^
                              | (Implements)
       +---------------------------------------------+
       |          Infrastructure (Repositories)      |
       +---------------------------------------------+
```

---

## 2. Dependency Injection
All repositories and external drivers are resolved at runtime through a lightweight Dependency Injection container (`/src/infrastructure/di/container.js`). Avoid using direct instantiation of infrastructure implementations in presentation controllers.

---

## 3. Offline-First Design
The database sync pipeline relies on a dual-engine architecture:
1. **Local Writes**: Mutation logs are written instantly to v7 IndexedDB cache stores under user-partitioned keys (`uid_id`).
2. **Sync Queue**: Mutations are pushed to the background `SyncQueue` (`pending_mutations_${uid}`).
3. **Background Sync**: If online, mutations are debounced, grouped into batch writes, and pushed to Firestore. If offline, the queue retries automatically upon connection restoration using exponential backoff retry cycles.
