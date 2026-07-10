# DevMentor AI — Testing Guide

## 1. Unit & Integration Testing (Vitest)
Unit tests check core stores, use cases, sync queues, and database key formats:
```bash
# Run unit tests suite
npm run test

# Run unit tests with code coverage metrics
npm run test:coverage
```
Test files are placed alongside utilities under `__tests__/` subdirectories.

---

## 2. End-to-End Testing (Playwright)
E2E tests verify user authentication flows, command palette execution, compiler tabs responsive states, and search queries:
```bash
# Run Playwright E2E tests
npm run test:e2e
```
E2E assertions are located in `e2e/` folder.

---

## 3. Coverage Targets Table

| Layer | Coverage Goal | Tool |
| ----- | ------------- | ---- |
| **Domain** | 95% | Vitest |
| **Application** | 95% | Vitest |
| **Infrastructure** | 85% | Vitest |
| **Stores** | 90% | Vitest |
| **Utilities** | 100% | Vitest |
