# ADR-002: Offline-First Synchronization Architecture

## Context
Developers learn on the go (trains, planes, or areas with poor internet connectivity). Unsaved notes, missing timeline history, or lost practice compiler details degrade user satisfaction.

## Decision
We enforce an Offline-First architectural pattern. Every write operation is cached locally first. Background synchronizers process queue updates to Firestore once connectivity transitions to online.

## Consequences
- **Pros**: Instant UI transitions (zero latency wait on database saves), full offline resilience.
- **Cons**: Requires complex conflict resolution models and transactional queueing logic.
