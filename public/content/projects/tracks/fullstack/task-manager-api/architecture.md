# Task Manager REST API Architecture

## Backend Layer Architecture
- **Controller Layer**: REST Controller routes requests, handles DTO mapping, and delegates execution to Service layers.
- **Service Layer**: Orchestrates transactional boundaries, executes query specifications, and manages CRUD mappings.
- **Repository Layer**: JPA Repositories mapping transactions to the database engine.
- **DTO Layer**: Separates database schemas from public presentation contracts.

```
Client Browser (React + Axios)
  └── REST Controllers (Spring Web MVC)
        └── TaskService (Spring Service)
              └── TaskRepository (Spring Data JPA)
                    └── H2 Database / MySQL
```

## CORS Flow
1. Client sends preflight OPTIONS request to verify permission.
2. Spring Boot filters inspect headers and returns `Access-Control-Allow-Origin: http://localhost:5173`.
3. Client executes the actual GET/POST request.
