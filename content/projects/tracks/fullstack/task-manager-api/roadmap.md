# Task Manager REST API Roadmap

## Milestone 1: Spring Boot Setup
- Scaffold project with JPA, H2, and Web
- Define database entity mapping for Tasks
- Create derived queries JpaRepository

## Milestone 2: API Endpoints (CRUD)
- Write REST Controllers for GET, POST, PUT, DELETE
- Map Entity $\rightarrow$ DTO objects
- Enable global CORS configurations

## Milestone 3: Validations & Handler
- Annotate DTO fields with Bean validation constraints
- Create `@ControllerAdvice` GlobalExceptionHandler mapping responses

## Milestone 4: Frontend Development
- Create React task grid dashboard
- Integrate Axios client fetching
- Form submit validation mapping

## Milestone 5: Polishing & Testing
- Write integration tests for controllers
- Implement overdue highlight indicators on frontend
- Add query parameters filters
