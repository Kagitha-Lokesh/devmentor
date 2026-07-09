# Library Management System

## What You Will Build

A command-line based **Library Catalogue Management System** in **Java 17**.

This application persists data locally on disk, tracks borrow logs, calculates fines for late returns, and handles duplicate checking gracefully.

---

## Why This Project Matters

This project demonstrates core backend capability:
- Design class models following **SOLID principles**.
- Make extensive use of **Java Collections** (HashMap, ArrayList, Set).
- Parse and save data to physical files on disc.
- Write robust Unit Tests to assure code quality.

---

## Technical Specifications

| Class | Responsibility |
|---|---|
| `Book` | Book details: ISBN, title, author, copies |
| `Member` | Member logs: ID, name, email, borrow history |
| `BorrowRecord` | Log details: record ID, member, book, dates, return status |
| `BookCatalogueService` | CRUD catalogue operations, multi-criteria stream search |
| `LibraryService` | Borrow logic, return receipts, overdue fine calculation |
| `DataPersistenceService` | Disk storage read/write as JSON (Jackson mapper) |
| `CLIApplication` | Interactive menu loop |
