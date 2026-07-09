# Library Management System Architecture

## SOLID Implementation Map
- **S**ingle Responsibility Principle: `BookCatalogueService` handles cataloging books; `LibraryService` coordinates borrows; `DataPersistenceService` handles disk writes.
- **O**pen/Closed Principle: Introduce interfaces for persistence (`IPersistenceService`) to support swapping Jackson with XML or relational databases without changing business services.
- **L**iskov Substitution: Entities preserve type safety. Custom exceptions subclass `RuntimeException` safely.
- **I**nterface Segregation: Segregate administration search actions from borrowing triggers.
- **D**ependency Inversion: High-level business operations depend on repository interfaces instead of direct file-writing implementations.

## Class Dependencies
```
CLIApplication
   └── LibraryService
          ├── BookCatalogueService (uses HashMap)
          ├── MemberService (uses HashMap)
          └── DataPersistenceService (uses ObjectMapper)
```
