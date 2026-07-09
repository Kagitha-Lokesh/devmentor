# SQL Joins — Revision Notes

## Most Common: LEFT JOIN
In practice, LEFT JOIN is used most often because you typically want all records from the primary table, even if there's no related data yet.

## Join on Multiple Columns
```sql
JOIN table2 ON t1.col1 = t2.col1 AND t1.col2 = t2.col2
```

## Find Rows with NO Match (Anti-join)
```sql
-- Find customers with no orders
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
```

## Self Join (e.g., employee-manager relationship)
```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
```