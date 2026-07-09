# Loops in Java

## Learning Objectives
- Understand when to use `for`, `while`, and `do-while` loops.
- Differentiate between entry-controlled and exit-controlled loops.
- Use `break` and `continue` to control loop execution.

---

## Why Should I Learn This?
Imagine processing 1,000 bank transactions to find invalid ones. Without loops, you would need to copy-paste the same check 1,000 times. Loops eliminate this repetition, letting you process any amount of data with just a few lines of code.

---

## The For Loop
Use when the number of iterations is **known in advance**.

```java
// Print numbers 1 to 5
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
// Output: Count: 1  Count: 2  Count: 3  Count: 4  Count: 5
```

**Anatomy of a for loop:**
```
for (initialization ; condition ; update) { body }
      int i = 0      i < 10       i++
```

---

## The While Loop
Use when the number of iterations is **unknown** — you loop until a condition changes.

```java
int pin = 0;
while (pin != 1234) {
    System.out.println("Wrong PIN, try again.");
    pin = getInputFromUser(); // imagine this reads input
}
System.out.println("Access granted!");
```

> [!NOTE]
> If the condition is false from the start, the while loop body **never executes**.

---

## The Do-While Loop
Guarantees the body runs **at least once**, then checks the condition.

```java
int choice;
do {
    System.out.println("Menu: 1) Play  2) Quit");
    choice = scanner.nextInt();
} while (choice != 2);
```

---

## Break and Continue

| Keyword | Effect |
|---|---|
| `break` | Immediately exits the loop |
| `continue` | Skips current iteration, moves to next |

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) continue; // skip 5
    if (i == 8) break;    // stop at 8
    System.out.print(i + " ");
}
// Output: 1 2 3 4 6 7
```

---

## Common Mistakes
1. **Infinite loop**: Forgetting to update the loop variable `i++`
2. **Off-by-one error**: Using `<` vs `<=` — think carefully about whether you need to include the last value
3. **Modifying the loop variable inside the body**: Leads to unpredictable iteration counts