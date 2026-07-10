# Contributing to DevMentor AI

Thank you for contributing! To ensure the codebase remains clean, robust, and highly structured, please follow these rules:

## 1. Branching Strategy
- Direct push to `main` is forbidden.
- Develop all features on `develop` or topic-specific feature branches (`feature/your-feature-name`).
- All integrations must pass CI check constraints.

## 2. Commit Message Standards
Commit messages should match standard conventional prefixes:
- `feat`: introducing a new capability
- `fix`: correcting a codebase bug
- `docs`: documentation adjustments
- `style`: layout styling/theme corrections
- `refactor`: structural updates with zero functional changes
- `test`: adding test coverage files

## 3. Pull Request Standards
- Ensure all tests pass: `npm run test`.
- Confirm Oxlint static checker raises zero errors: `npm run lint`.
- Make sure bundle builds successfully: `npm run build`.
