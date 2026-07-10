# ADR-005: Decoupling Storage details via Repository Pattern

## Context
Clean Architecture forbids use cases from knowing database implementations directly. If database providers (e.g. Firebase to Supabase) change, business workflows must not break.

## Decision
We implement the Repository Pattern. Use cases query Domain interfaces (e.g. `INotesRepository`) resolved at runtime via the DI container. Implementations reside under the infrastructure boundary.

## Consequences
- **Pros**: Clear separation of storage drivers, easy mocking of database instances in testing.
- **Cons**: Requires boilerplate abstract classes and registrations inside the container.
