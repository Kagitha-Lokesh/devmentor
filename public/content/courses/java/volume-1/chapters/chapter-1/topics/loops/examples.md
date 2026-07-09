# Loops — Code Examples

## Example 1: Sum of digits
```java
int number = 12345;
int sum = 0;
while (number > 0) {
    sum += number % 10;  // get last digit
    number /= 10;        // remove last digit
}
System.out.println("Sum of digits: " + sum); // 15
```

## Example 2: Multiplication table
```java
int n = 5;
for (int i = 1; i <= 10; i++) {
    System.out.println(n + " x " + i + " = " + (n * i));
}
```

## Example 3: Nested loops — print a triangle
```java
for (int row = 1; row <= 5; row++) {
    for (int col = 1; col <= row; col++) {
        System.out.print("* ");
    }
    System.out.println();
}
```