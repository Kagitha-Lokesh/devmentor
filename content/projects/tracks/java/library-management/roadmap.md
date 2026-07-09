# Library Management System Roadmap

## Milestone 1: Core Models
- Implement `Book`, `Member` and `BorrowRecord` domain classes
- Setup package structures: `com.devmentor.library.model`, `com.devmentor.library.service`, `com.devmentor.library.exception`

## Milestone 2: Catalogue Management
- Implement BookCatalogueService with CRUD HashMap storage
- Write Search filters using Java Streams and optionals

## Milestone 3: Borrow / Return Logic
- Implement borrowBook copy check validation
- Build returnBook overdue date diff calculations and receipts logger
- Create Overdue loan details reporter

## Milestone 4: Persistence & CLI Loop
- Integrate Jackson mapper to serialize state to local files
- Implement console input scanner loop

## Milestone 5: Testing
- Write JUnit 5 test coverages
- Verify against SOLID guidelines
