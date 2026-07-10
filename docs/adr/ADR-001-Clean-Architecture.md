# ADR-001: Decoupling Domain Logic via Clean Architecture

## Context
JavaMentor requires maximum modularity, clean testability, and stability across platforms. Mixing presentation states with storage engine APIs creates high friction during updates.

## Decision
We implement Clean Architecture, separating the codebase into three isolated layers:
1. **Domain**: Pure models and repository contracts. No third-party API dependencies.
2. **Application**: Coordinates use cases. Handles business scenarios.
3. **Infrastructure / Presentation**: React UI components, Firestore endpoints, and IndexedDB drivers.

## Consequences
- **Pros**: Domain business rules are isolated, allowing easy mocking for unit tests.
- **Cons**: Requires mapping data models across boundaries, increasing file count.
