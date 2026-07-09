# Methods — Code Examples

## Example 1: Calculator using overloaded methods
```java
public class Calculator {
    public int multiply(int a, int b) { return a * b; }
    public double multiply(double a, double b) { return a * b; }
    public int multiply(int a, int b, int c) { return a * b * c; }
}
```

## Example 2: Recursive method — Factorial
```java
public int factorial(int n) {
    if (n <= 1) return 1;          // base case
    return n * factorial(n - 1);   // recursive call
}
// factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
```