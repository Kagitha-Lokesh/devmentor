# SQL Basics

## Learning Objectives
- Write SELECT, INSERT, UPDATE, and DELETE statements.
- Filter data with WHERE, ORDER BY, and LIMIT.
- Understand database tables, rows, and columns.

---

## What is SQL?
SQL (Structured Query Language) is the standard language for relational databases. With SQL you can store, retrieve, update, and delete data from tables.

---

## SELECT — Reading Data
```sql
-- Get all columns from all rows
SELECT * FROM users;

-- Get specific columns
SELECT first_name, email FROM users;

-- Filter with WHERE
SELECT * FROM users WHERE age > 18;

-- Sort results
SELECT * FROM products ORDER BY price DESC;

-- Limit number of results
SELECT * FROM products ORDER BY price DESC LIMIT 5;
```

---

## INSERT — Adding Data
```sql
INSERT INTO users (first_name, email, age)
VALUES ('Alice', 'alice@example.com', 28);
```

---

## UPDATE — Modifying Data
```sql
UPDATE users
SET email = 'new@email.com'
WHERE id = 5;
```
> [!CAUTION]
> Always include a WHERE clause with UPDATE and DELETE, or you'll modify/delete ALL rows!

---

## DELETE — Removing Data
```sql
DELETE FROM users WHERE id = 5;
```

---

## WHERE Operators
```sql
WHERE age = 25          -- Equal
WHERE age != 25         -- Not equal
WHERE age > 18          -- Greater than
WHERE age BETWEEN 18 AND 65  -- Range (inclusive)
WHERE name LIKE 'A%'    -- Starts with A (% = any chars)
WHERE name LIKE '%son'  -- Ends with son
WHERE city IN ('London', 'Paris') -- Match any value in list
WHERE email IS NULL     -- Check for null
WHERE email IS NOT NULL -- Check for non-null
```