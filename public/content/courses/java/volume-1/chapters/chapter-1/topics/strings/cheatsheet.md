# Strings Cheatsheet

## Key Methods
| Method | Description |
|---|---|
| `length()` | Number of characters |
| `charAt(i)` | Character at index i |
| `indexOf(s)` | First position of s, -1 if not found |
| `substring(s,e)` | Extract from s (inclusive) to e (exclusive) |
| `toUpperCase()` | All uppercase |
| `toLowerCase()` | All lowercase |
| `trim()` | Remove leading/trailing spaces |
| `replace(old,new)` | Replace occurrences |
| `split(regex)` | Split into String[] |
| `equals(s)` | Content equality |
| `equalsIgnoreCase(s)` | Case-insensitive equality |
| `startsWith(s)` | Prefix check |
| `isEmpty()` | true if length == 0 |
| `isBlank()` | true if empty or only whitespace |

## Comparison Rule
- `==` compares references
- `.equals()` compares content ← **Always use this**

## StringBuilder vs StringBuffer
- `StringBuilder` — faster, not thread-safe
- `StringBuffer` — thread-safe, slightly slower