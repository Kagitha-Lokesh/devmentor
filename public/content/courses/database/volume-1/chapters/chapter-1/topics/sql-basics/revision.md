# SQL Basics — Revision Notes

## Execution Order (Mental Model)
SQL executes in this logical order:
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

## NULL Handling
- NULL means "unknown" — not zero, not empty string
- `NULL = NULL` is FALSE! Use `IS NULL` / `IS NOT NULL`
- Any arithmetic with NULL gives NULL: `5 + NULL = NULL`

## LIKE Wildcards
- `%` matches any sequence of characters (including none)
- `_` matches exactly one character
- `LIKE 'a_c'` matches 'abc', 'arc', but not 'ac'