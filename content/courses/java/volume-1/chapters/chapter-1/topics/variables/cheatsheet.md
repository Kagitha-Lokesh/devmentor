# Cheat Sheet: Java Variables

## Quick Syntax
```java
type name = value; // Standard declaration and initialization
final int LIMIT = 100; // Constant: value cannot be modified after assignment
```

## Scopes Cheat Sheet
| Scope | Declared Where | Default Value | Accessible In | Reference Method |
| :--- | :--- | :--- | :--- | :--- |
| **Local** | Inside methods/blocks | None (Must initialize) | Local block | `variableName` |
| **Instance** | Inside class | `0` / `false` / `null` | Instance methods | `this.variableName` |
| **Static** | Inside class (`static`) | `0` / `false` / `null` | All class references | `ClassName.variableName` |

## Java Naming Conventions (CamelCase)
* **Variables**: Lower camelCase (`studentCount`, `firstName`).
* **Constants**: All uppercase with underscores (`MAX_LIMIT`, `DEFAULT_TIMEOUT`).
* **Classes**: Upper CamelCase / PascalCase (`VariableDemo`, `Counter`).

## Core Rules
1. Local variables **do not** get default values. Accessing uninitialized locals results in a compile error.
2. Constants must be declared with `final`. They can only be assigned once.
3. Shadows can be bypassed inside instance scopes using the `this` prefix.
