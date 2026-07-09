# Methods in Java

## Learning Objectives
- Define and call methods with parameters and return types.
- Understand the difference between method overloading and overriding.
- Master pass-by-value vs pass-by-reference.

---

## Why Methods?
Without methods, you would repeat the same code every time you need it. Methods let you write logic once and reuse it anywhere — the "Don't Repeat Yourself" (DRY) principle.

---

## Anatomy of a Method

```java
//  Access   Return  Name       Parameters
    public   int     add        (int a, int b) {
        return a + b;  // body
    }
```

---

## Void vs Return
```java
// void — performs action, returns nothing
public void greet(String name) {
    System.out.println("Hello, " + name + "!");
}

// int — performs calculation, returns a value
public int square(int n) {
    return n * n;
}
```

---

## Method Overloading
Same method name, different parameter lists. Java picks the right one at **compile time**.

```java
public int add(int a, int b) { return a + b; }
public double add(double a, double b) { return a + b; }
public int add(int a, int b, int c) { return a + b + c; }

// Java picks based on arguments:
add(2, 3);         // → int version
add(2.5, 3.5);     // → double version
add(1, 2, 3);      // → three-param version
```

---

## Pass-by-Value
Java **always** passes by value. For primitives, a copy is passed. For objects, a copy of the **reference** is passed.

```java
public void increment(int x) { x++; }

int num = 5;
increment(num);
System.out.println(num); // Still 5! Original unchanged.
```