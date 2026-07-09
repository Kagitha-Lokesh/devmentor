# SQL Joins Cheatsheet

## Syntax Template
```sql
SELECT a.col, b.col
FROM tableA a
[INNER|LEFT|RIGHT|FULL OUTER] JOIN tableB b
ON a.foreign_key = b.primary_key
WHERE condition;
```

## Join Types
| Type | Returns |
|---|---|
| INNER JOIN | Rows with matches in BOTH tables |
| LEFT JOIN | All left rows + matched right (NULL if no match) |
| RIGHT JOIN | All right rows + matched left (NULL if no match) |
| FULL OUTER JOIN | All rows from both, NULLs where no match |
| SELF JOIN | Table joined with itself |
| CROSS JOIN | Every row of A with every row of B (cartesian) |

## Aliasing Tables (Use for readability)
```sql
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
```