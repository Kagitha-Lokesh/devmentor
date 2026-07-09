# Methods Cheatsheet

## Syntax
```java
accessModifier returnType methodName(params) {
    return value; // omit if void
}
```

## Access Modifiers
| Modifier | Accessible From |
|---|---|
| `public` | Everywhere |
| `private` | Same class only |
| `protected` | Same package + subclasses |
| (none) | Same package |

## Overloading Rules
- Same name, different parameter TYPE or COUNT
- Return type alone does NOT differentiate

## Key Facts
- Java is always **pass-by-value**
- `static` methods belong to the class, not an instance
- `final` methods cannot be overridden