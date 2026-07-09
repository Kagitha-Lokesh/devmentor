# OOP Cheatsheet

## Class Template
```java
class ClassName {
    // fields
    private type fieldName;

    // constructor
    public ClassName(type param) { this.fieldName = param; }

    // methods
    public type getFieldName() { return fieldName; }
    public void setFieldName(type val) { this.fieldName = val; }
}
```

## Four OOP Pillars
| Pillar | Meaning |
|---|---|
| Encapsulation | Hide data, expose through methods |
| Inheritance | Subclass reuses parent's code |
| Polymorphism | One interface, many behaviors |
| Abstraction | Hide complexity, show essentials |

## Access Modifiers
| Modifier | Class | Package | Subclass | World |
|---|---|---|---|---|
| private | ✓ | ✗ | ✗ | ✗ |
| (default) | ✓ | ✓ | ✗ | ✗ |
| protected | ✓ | ✓ | ✓ | ✗ |
| public | ✓ | ✓ | ✓ | ✓ |