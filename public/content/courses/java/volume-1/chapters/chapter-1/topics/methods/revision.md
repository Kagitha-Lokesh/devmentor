# Methods — Revision Notes

## Core Concepts
- Methods group reusable logic — promotes DRY principle
- Signature = method name + parameter types (NOT return type)
- **Overloading**: same name, different params → compile-time polymorphism
- **Overriding**: subclass provides its own implementation → runtime polymorphism

## Pass-by-Value Trap
Java copies the value. For objects, it copies the reference (pointer), not the object. Reassigning the reference inside a method won't affect the original, but mutating the object will.

## varargs
```java
public int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
sum(1, 2, 3, 4, 5); // Works!
```