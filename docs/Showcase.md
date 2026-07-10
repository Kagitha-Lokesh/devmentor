# DevMentor AI — Portfolio Case Study & Product Showcase

## 1. Executive Summary
DevMentor AI is an enterprise-scale full-stack developer training platform. It replaces generic tutorials with Socratic learning pathways, active sandboxed code compilers, mock technical interviews, and systematic retention tooling.

---

## 2. Core Architectural Challenges & Solutions

### A. The Challenge: Network Volatility & Sync Conflicts
In unstable network conditions, users experienced layout lockups and transaction drops when updates failed to reach Firestore database servers.

#### The Solution: Isolated Sync Queues with Exponential Retry Loops
Implemented an offline-first storage driver:
1. Write mutations immediately to local v7 IndexedDB stores partitioned by active user keys (`uid_id`).
2. Enqueue writes to background queue maps (`pending_mutations_${uid}`).
3. Re-send mutations asynchronously upon network reconnect using a debounced batching loop with exponential backoff (1s, 2s, 4s, 8s limit).

### B. The Challenge: Stale Multi-user Local Cache Leaks
On multi-user developer workstations, logs, notes, and conversation drafts persisted after logout, presenting critical privacy threats.

#### The Solution: Centralized State Scrubbing Service
Engineered `GlobalStateResetService` triggering:
1. Systematic wiping of IndexedDB user-partitioned range indices.
2. Complete scrubbing of LocalStorage settings.
3. Resetting all Zustand reactive memory stores.

---

## 3. Product Demonstrations Scenarios

### Recruiter Showcase Walkthrough
1. **Interactive Dashboard**: Observe learning mastery indicators, progress tracking, and streak records.
2. **Fuzzy Search & Command Palette**: Press `Ctrl+K` to search anything, navigate via keyboard arrows, and run commands.
3. **Practice compiler**: Code and run Java solutions inside the sandboxed editor. Select languages and adjust font sizes dynamically.
4. **Offline Resilience**: Toggle network status off, write notes, save bookmarks, and observe background queues sync automatically on toggle back to online.
