# OOP — Revision Notes

## Core Ideas
- **Encapsulation** = private data + public methods
- **Constructor** = special method called with `new`, same name as class, no return type
- **this** = reference to current object
- **static** = belongs to class, not instance

## Constructor Rules
- No return type (not even void)
- Same name as class
- If you write no constructor, Java provides a default no-arg one
- If you write ANY constructor, the default one disappears

## Chained Constructors
```java
public class Point {
    int x, y;
    public Point() { this(0, 0); } // calls two-arg constructor
    public Point(int x, int y) { this.x = x; this.y = y; }
}
```