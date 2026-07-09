# Strings — Revision Notes

## Immutability — Why It Matters
- Thread-safe by nature (no synchronization needed)
- Safe as HashMap keys (hash code is consistent)
- Security: passwords can't be accidentally mutated

## Interview Hotspots
1. `==` vs `.equals()` — most common trap
2. Why StringBuilder in loops (O(n) vs O(n²) complexity)
3. String Pool: `"abc"` vs `new String("abc")`
4. `intern()` — force a string into the pool

## String to char[] and back
```java
char[] chars = "hello".toCharArray();
String back = new String(chars);
```