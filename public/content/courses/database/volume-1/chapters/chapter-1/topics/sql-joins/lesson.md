# SQL Joins

## Learning Objectives
- Combine data from multiple tables using JOIN.
- Distinguish between INNER, LEFT, RIGHT, and FULL OUTER joins.
- Write multi-table queries for real-world scenarios.

---

## Why Joins?
Data in relational databases is split across multiple tables to avoid duplication. Joins let you combine related data from different tables into a single result.

---

## INNER JOIN — Only Matching Rows
Returns rows that have matching values in BOTH tables.

```sql
SELECT orders.id, users.name, orders.total
FROM orders
INNER JOIN users ON orders.user_id = users.id;
-- Only returns orders that have a matching user
```

---

## LEFT JOIN — All Left Rows + Matching Right
Returns ALL rows from the left table, and matched rows from the right. Non-matching right columns get NULL.

```sql
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
-- Returns ALL users, including those with no orders (total will be NULL)
```

---

## RIGHT JOIN — All Right Rows + Matching Left
Opposite of LEFT JOIN. Returns all rows from the right table.

---

## FULL OUTER JOIN — All Rows from Both
Returns all rows from both tables, with NULLs where there is no match.

---

## Venn Diagram Mental Model
```
INNER JOIN:  A ∩ B (intersection only)
LEFT JOIN:   All of A + matched B
RIGHT JOIN:  All of B + matched A
FULL OUTER:  A ∪ B (everything)
```