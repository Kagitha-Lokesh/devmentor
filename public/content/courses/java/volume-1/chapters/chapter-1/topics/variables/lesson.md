# Variables in Java

## Learning Objectives
* Learn how to declare, initialize, and modify variables.
* Understand the difference between Local, Instance, and Static variables.
* Master the concept of variable scopes and memory allocation (Stack vs Heap).

---

## Why Should I Learn This?
Imagine you are building a contacts app. You need to keep track of the user's name, phone number, and count of contacts. How does the computer remember this data while your code is running?
Without variables, you would have to write values directly into computer memory addresses (like `0x7FFF5F`). Variables act as named storage containers, replacing raw memory coordinates with friendly labels like `contactName` or `phoneCount`.

---

## Beginner Explanation
A **variable** is simply a labeled box inside the computer's memory.
1. You **declare** a variable by choosing its size and shape (the Data Type) and giving it a name.
2. You **initialize** a variable by placing a value inside it.
3. You **read** or **modify** the variable throughout your program.

```java
int contactCount;       // DECLARATION: Creating a box named contactCount that only holds integers
contactCount = 10;      // INITIALIZATION: Putting the number 10 inside the box
contactCount = 11;      // MODIFICATION: Replacing 10 with 11
```

---

## Real-Life Analogy
Think of variables like storage lockers in a gym:
* The **locker number** or label is the variable's name (e.g., `Locker#42`).
* The **locker size** determines what fits inside (e.g., small drawer for keys vs large cabinet for bags—this represents the Data Type).
* The **bag** inside is the value. You can open the locker, check what is inside, replace it with a different bag, or empty it.

---

## Internal Working & Memory Allocation
In Java, variables are allocated in two primary memory regions inside the Java Virtual Machine (JVM):
1. **The Stack**: Holds local variables (variables declared inside methods). Every time a method is invoked, a new stack frame is created, containing its local variables. When the method completes, the frame is popped, and memory is instantly freed.
2. **The Heap**: Holds instance variables (fields belonging to Objects). These variables live as long as their parent object resides in memory.

### JVM Memory Representation (ASCII)
```
  +---------------------------------------+
  |              JVM Memory               |
  +---------------------------------------+
  |  STACK (Method Frames)                |
  |  +---------------------------------+  |
  |  | calculateTotal() frame          |  |
  |  |  [local variable: price = 100]  |  |
  |  +---------------------------------+  |
  |                                       |
  |  HEAP (Objects & Fields)              |
  |  +---------------------------------+  |
  |  | User Object                     |  |
  |  |  [instance variable: age = 25]  |  |
  |  +---------------------------------+  |
  +---------------------------------------+
```

---

## Types of Variables
Java supports three scopes of variables:

| Variable Type | Declared Where | Memory Region | Lifetime | Accessible From |
| :--- | :--- | :--- | :--- | :--- |
| **Local** | Inside a method or block | Stack | Created on method call, destroyed on method exit | Only within that method |
| **Instance** | Inside a class, outside methods | Heap | Lives as long as the parent object lives | Anywhere inside the object |
| **Static** | Inside a class with `static` keyword | Class Area | Lives from class load to unload (entire run) | Anywhere in the application |

> [!NOTE]
> Static variables are shared among all instances of a class. If one object changes a static variable, it changes for all instances!

---

## Common Mistakes
1. **Using a Local Variable before Initializing it**:
   Local variables do not get default values. Declaring `int x;` and then printing `x` will cause a compile-time crash!
2. **Modifying static variables thinking they are instance-specific**:
   Changing a static variable changes it globally for every class reference.
3. **Variable Shadowing confusion**:
   Declaring a local variable with the exact same name as an instance variable shadows the field. Use `this.variableName` to refer to instance scope.
