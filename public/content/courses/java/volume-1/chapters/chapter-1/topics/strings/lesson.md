# Strings in Java

## Learning Objectives
- Understand String immutability and the String Pool.
- Use common String methods for manipulation and comparison.
- Know when to use StringBuilder for performance.

---

## Strings Are Immutable
Once a String object is created, its value **cannot change**. Every operation that "modifies" a string actually creates a new one.

```java
String name = "Java";
name.toUpperCase(); // Creates a NEW String "JAVA"
System.out.println(name); // Still "Java" — original unchanged!

// Correct way:
name = name.toUpperCase();
System.out.println(name); // "JAVA"
```

---

## String Pool
Java maintains a pool of String literals in memory. When you create a string literal, Java checks the pool first. This saves memory.

```java
String a = "hello";  // stored in String Pool
String b = "hello";  // reuses same object from pool
String c = new String("hello"); // forces new Heap object

System.out.println(a == b);      // true  (same reference)
System.out.println(a == c);      // false (different reference)
System.out.println(a.equals(c)); // true  (same content) ← ALWAYS use equals()
```

> [!IMPORTANT]
> **Always use .equals() to compare String content**, never ==.

---

## Essential String Methods

```java
String s = "  Hello, World!  ";

s.length()              // 18
s.trim()                // "Hello, World!"
s.toLowerCase()         // "  hello, world!  "
s.toUpperCase()         // "  HELLO, WORLD!  "
s.trim().charAt(0)      // 'H'
s.trim().indexOf("o")   // 4
s.trim().substring(7)   // "World!"
s.trim().substring(7,12)// "World"
s.trim().contains("World")  // true
s.trim().replace("World","Java") // "Hello, Java!"
s.trim().split(", ")    // ["Hello", "World!"]
```

---

## StringBuilder — For Performance
When building strings in a loop, use `StringBuilder` to avoid creating hundreds of unnecessary String objects.

```java
// Bad (creates 1000 intermediate Strings):
String result = "";
for (int i = 0; i < 1000; i++) result += i;

// Good (single mutable buffer):
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) sb.append(i);
String result = sb.toString();
```