# SQL — Code Examples

## Find all active users over 25, sorted by name
```sql
SELECT id, first_name, email
FROM users
WHERE age > 25 AND active = true
ORDER BY first_name ASC;
```

## Get the 3 most expensive products
```sql
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 3;
```

## Update all out-of-stock items
```sql
UPDATE products
SET status = 'unavailable'
WHERE stock_count = 0;
```