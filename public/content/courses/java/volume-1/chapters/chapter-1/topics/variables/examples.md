# Variable Code Examples

## Example 1: Basic Declaration & Local Variables
This example shows how local variables are declared, initialized, modified, and printed.

```java
public class BasicVariables {
    public static void main(String[] args) {
        // 1. Declare and initialize an integer variable
        int studentAge = 20;
        
        // 2. Declare and initialize a string variable
        String studentName = "Alice";
        
        System.out.println("Student Name: " + studentName);
        System.out.println("Initial Age: " + studentAge);
        
        // 3. Modify variable values
        studentAge = 21;
        System.out.println("Updated Age: " + studentAge);
    }
}
```

### Expected Output
```text
Student Name: Alice
Initial Age: 20
Updated Age: 21
```

---

## Example 2: Instance vs Static Variables
This example demonstrates the core difference between instance (object-level) and static (class-level) variables.

```java
public class CounterDemo {
    // Instance variable: each object gets its own copy
    int instanceCount = 0;
    
    // Static variable: shared across all CounterDemo objects
    static int staticCount = 0;
    
    public void increment() {
        instanceCount++;
        staticCount++;
    }
    
    public static void main(String[] args) {
        CounterDemo objectA = new CounterDemo();
        CounterDemo objectB = new CounterDemo();
        
        objectA.increment();
        objectA.increment();
        
        System.out.println("objectA - Instance count: " + objectA.instanceCount); // 2
        System.out.println("objectA - Static count: " + objectA.staticCount);     // 2
        
        objectB.increment();
        
        System.out.println("objectB - Instance count: " + objectB.instanceCount); // 1
        System.out.println("objectB - Static count: " + objectB.staticCount);     // 3 (Shared!)
    }
}
```

### Expected Output
```text
objectA - Instance count: 2
objectA - Static count: 2
objectB - Instance count: 1
objectB - Static count: 3
```

---

## Example 3: Advanced Scopes and Shadowing (Industry Style)
This example highlights variable shadowing, scope isolation, and accessing shadowed instance variables using `this`.

```java
public class ShadowingDemo {
    // Member field (Instance variable)
    private String name = "Global Config";
    
    public void configure(String name) {
        // The method parameter 'name' shadows the member field 'name'
        System.out.println("Parameter 'name': " + name);
        
        // Use 'this' to reference the member field
        System.out.println("Member field 'name': " + this.name);
        
        // Update the member field
        this.name = name;
        System.out.println("Updated Member field 'name': " + this.name);
    }
    
    public static void main(String[] args) {
        ShadowingDemo demo = new ShadowingDemo();
        demo.configure("Local Context");
    }
}
```

### Expected Output
```text
Parameter 'name': Local Context
Member field 'name': Global Config
Updated Member field 'name': Local Context
```
