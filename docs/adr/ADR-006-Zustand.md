# ADR-006: React State Management Selection: Zustand

## Context
Enterprise React state management options include Redux (heavy boilerplate), React Context (re-render traps), and Zustand.

## Decision
We select **Zustand** for lightweight, performance-focused client store orchestration (auth, theme, notes, timeline stores).

## Consequences
- **Pros**: Zero boilerplate, micro-store decoupling, high rendering efficiency via selective subscription selectors.
- **Cons**: Lack of rigid structural constraints can lead to cluttered store state modifications.
