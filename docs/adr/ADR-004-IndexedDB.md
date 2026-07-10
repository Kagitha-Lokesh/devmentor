# ADR-004: Local Storage Engine Selection: IndexedDB

## Context
Offline-first design requires storing structured documents (courses progress, custom tasks lists, notes drafts) directly on the client browser. LocalStorage has a strict 5MB quota and lacks indexing.

## Decision
We select **IndexedDB** (wrapped in a clean transaction utility) as the client storage engine. We use a v7 schema incorporating user-partitioned prefixes (`uid_id`) to enforce multi-user isolation.

## Consequences
- **Pros**: Virtually unlimited storage capacity (dependent on disk space), asynchronous non-blocking queries, range indexing.
- **Cons**: Asynchronous callbacks increase implementation complexity relative to LocalStorage.
