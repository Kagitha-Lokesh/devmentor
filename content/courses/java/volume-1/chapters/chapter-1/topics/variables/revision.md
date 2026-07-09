# Quick Revision: Variables in Java

## Key Takeaways
1. **Definition**: A variable is a named storage location in memory.
2. **Components**: Every variable requires a **type**, a **name** (identifier), and an optional **value**.
3. **Scaffolding**:
   * **Declaration**: `int speed;`
   * **Initialization**: `speed = 50;`
   * **Combined**: `int speed = 50;`

## Variable Scopes Quick Reference
* **Local Variables**:
  * Declared inside a method, constructor, or block (e.g. loops).
  * Stored on the **Stack**.
  * **Crucial rule**: Must be initialized before reading. No default values exist.
  * Lifetime: Destroyed when control exits the block.
* **Instance Variables (Fields)**:
  * Declared inside class but outside methods.
  * Stored on the **Heap** as part of their parent Object.
  * Receive default values automatically if not initialized (e.g. `0` for numeric, `false` for boolean, `null` for objects).
  * Lifetime: Resides as long as the parent object stays alive.
* **Static Variables (Class Fields)**:
  * Declared inside a class with the `static` keyword.
  * Shared across all instances of the class.
  * Stored in the Class Area.
  * Lifetime: Resides from class loading to program exit.

## Top Internals to Remember
* Local references are stored directly on the method stack frame. 
* Objects themselves (such as `String name = "Test"`) are always allocated on the Heap, while their reference pointer (`name`) lives on the Stack if declared locally.
* Static fields can be accessed without creating an instance: `MyClass.staticField`.
* `this` represents the active object instance. It is typically used to resolve naming conflicts when local variables or parameters shadow instance fields.
