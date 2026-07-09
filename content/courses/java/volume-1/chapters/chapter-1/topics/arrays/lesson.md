# Arrays in Java

## Learning Objectives
- Declare, initialize, and access one-dimensional arrays.
- Use multi-dimensional arrays for grid-based data.
- Understand how arrays are stored in memory.

---

## What Is an Array?
An array is a **fixed-size, ordered container** that stores multiple values of the **same type** under a single variable name. Elements are accessed by their **index**, starting at 0.

```java
String[] fruits = {"Apple", "Banana", "Cherry"};
//                  [0]       [1]        [2]
System.out.println(fruits[1]); // Banana
```

---

## Declaring & Initializing

```java
// Method 1: Declare then initialize
int[] scores = new int[5]; // all zeros by default

// Method 2: Declare with values
int[] marks = {95, 87, 76, 88, 92};

// Method 3: New with values
String[] days = new String[]{"Mon", "Tue", "Wed"};
```

---

## Array Length
```java
int[] arr = {10, 20, 30, 40};
System.out.println(arr.length); // 4  ← property, NOT method (no parentheses)
```

---

## Common Iteration Patterns
```java
int[] nums = {3, 1, 4, 1, 5};

// Classic for loop (when you need the index)
for (int i = 0; i < nums.length; i++) {
    System.out.println("Index " + i + ": " + nums[i]);
}

// Enhanced for loop (when you only need values)
for (int n : nums) {
    System.out.println(n);
}
```

---

## 2D Arrays
```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[1][2]); // 6 (row 1, column 2)
```

> [!NOTE]
> Arrays in Java have a **fixed size**. If you need a resizable collection, use `ArrayList`.