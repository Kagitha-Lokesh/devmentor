# Library Management System Requirements

## Functional Requirements
1. **Manage Book Catalogue**: Add, list, remove books. Handle duplicate ISBN keys.
2. **Search Service**: Search catalog filtering by title (case-insensitive contains search), author, genre.
3. **Manage Members**: Register new library card accounts, enforce phone/email fields presence.
4. **Borrow System**: Limit members to maximum 3 active borrows simultaneously. Fail borrow if copies unavailable.
5. **Return receipts & Fines**: Auto-set due date to borrow date + 14 days. Compute late fines at ₹5 per day.
6. **Report Engine**: List all active overdue loans, sorted by overdue days descending.
7. **Local Persistence**: Save state to JSON files on system exit. Restore state on startup.

## Testing Requirements
- Code coverage >= 80% on Service classes.
- Unit tests written using JUnit 5 assertions.
