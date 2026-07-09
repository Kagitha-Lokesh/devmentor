# Task Manager API Requirements

## Backend API Requirements
1. **Endpoint CRUD**:
   - `GET /api/tasks`: List all tasks (supports query filters `status`, `priority` and sorting `sortBy=dueDate`).
   - `GET /api/tasks/{id}`: Fetch single task (404 on missing).
   - `POST /api/tasks`: Create task from JSON body (201 status, returns DTO).
   - `PUT /api/tasks/{id}`: Update task properties (404 on missing).
   - `DELETE /api/tasks/{id}`: Delete task (204 status).
2. **DTO Validation**: Enforce `@NotBlank` title, `@NotNull` priority, and `@FutureOrPresent` due date.
3. **Structured Errors**: Return JSON `{timestamp, status, error, message}` on error.
4. **CORS Policy**: Enable cross-origin calls from `http://localhost:5173`.

## Frontend UI Requirements
1. **Task Board/List**: Fetch on page load, color-code by priority (HIGH/MEDIUM/LOW).
2. **Task Creation Form**: Simple modal/form validating inputs.
3. **Task Deletion/Editing**: Inline button triggers.
4. **Overdue Alerts**: Highlight overdue tasks in red and due today in orange. Show banner count.
