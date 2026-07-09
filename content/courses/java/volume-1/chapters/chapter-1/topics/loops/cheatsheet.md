# Loops Cheatsheet

## For Loop
```java
for (int i = 0; i < n; i++) { }
```

## Enhanced For (forEach)
```java
for (String item : list) { }
```

## While Loop
```java
while (condition) { }
```

## Do-While Loop
```java
do { } while (condition);
```

## Control Keywords
- `break` → exit loop immediately
- `continue` → skip to next iteration
- Labeled break: `outer: for(...) { break outer; }`

## Quick Decision Guide
| Situation | Use |
|---|---|
| Known iterations | `for` |
| Unknown, may not run | `while` |
| Must run at least once | `do-while` |
| Iterate collection | enhanced `for` |