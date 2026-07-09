# SQL Joins — Examples

## Find all customers and their orders (including customers with no orders)
```sql
SELECT c.name, o.order_date, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
ORDER BY c.name;
```

## Find only customers who HAVE placed orders
```sql
SELECT DISTINCT c.name
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
```

## Three-table join: orders with customer name and product name
```sql
SELECT c.name, p.name AS product, o.quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id;
```