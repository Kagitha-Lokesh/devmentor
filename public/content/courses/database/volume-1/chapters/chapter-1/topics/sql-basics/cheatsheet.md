# SQL Basics Cheatsheet

## CRUD at a Glance
```sql
-- Read
SELECT col1, col2 FROM table WHERE condition ORDER BY col LIMIT n;

-- Create
INSERT INTO table (col1, col2) VALUES (val1, val2);

-- Update
UPDATE table SET col = val WHERE condition;

-- Delete
DELETE FROM table WHERE condition;
```

## Filtering
| Operator | Example |
|---|---|
| =, !=, <, >, <=, >= | `age > 18` |
| BETWEEN | `age BETWEEN 18 AND 30` |
| LIKE | `name LIKE 'J%'` |
| IN | `city IN ('London', 'NYC')` |
| IS NULL | `email IS NULL` |
| AND / OR / NOT | `age > 18 AND active = true` |

## Sorting & Limiting
```sql
ORDER BY price ASC   -- ascending (default)
ORDER BY price DESC  -- descending
LIMIT 10             -- first 10 rows
OFFSET 20            -- skip 20 rows (pagination)
```