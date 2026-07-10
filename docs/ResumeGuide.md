# DevMentor AI — Resume & Career Guide

## 1. ATS-Optimized Project Bullet Points
Add these high-impact descriptions to your professional software developer resume:

- **Full-Stack Engineering & Clean Architecture**: Designed and built an enterprise-scale offline-first developer training platform using React 19, Vite, and Cloud Firestore, strictly adhering to Clean Architecture, Repository, and Dependency Injection patterns.
- **Offline-First Synchronization Engine**: Engineered a robust local database sync service utilizing v7 IndexedDB multi-user partitioned ranges and custom background queues (`pending_mutations_${userId}`) with debounced batching and exponential backoff retry cycles.
- **Security & Multi-user Isolation**: Implemented a global state reset service scrubbing all memory stores, local cache records, and IndexedDB collections on user logout, ensuring zero cross-user leakage on shared terminals.
- **Advanced Performance & Code Splitting**: Optimized Initial JS loading bundle through React Suspense code-splitting and unified lazy loading of heavy Monaco Code Editor chunks, achieving a 35% reduction in compiler page chunk sizes.

---

## 2. LinkedIn Project Description
> **DevMentor AI — Full-Stack Developer Platform (Enterprise SaaS Project)**
> 
> Engineered a comprehensive full-stack training platform featuring interactive learning paths, mock company-track interview simulators, and custom sandboxed code execution modules.
>
> **Key Architecture Achievements**:
> - Decoupled business layers from DB providers using Dependency Injection and Repository patterns.
> - Developed an offline-first sync mechanism saving mutations locally to IndexedDB before background Firestore integration.
> - Programmed keyboard-accessible VS Code-style Command Palette navigation.

---

## 3. Interview Talking Points & Questions

### Q1: How did you implement user data isolation in an offline environment?
- **Talking Point**: "I designed a user-partitioned composite key format inside IndexedDB (`uid_id`) and ran queries using range bound cursors (`IDBKeyRange.bound()`) restricted to the logged-in user. On logout, a global reset service scrubs only the current user's records."

### Q2: How did you optimize initial bundle size while loading heavy editor components?
- **Talking Point**: "I code-split the Monaco Code Editor by wrapping standard and diff editor views into a single lazy-loaded component, loading it only when the workspace view mounts. This removed duplicate chunks and dropped the compiler page chunk size by 35%."
