# OOP Fundamentals

## Learning Objectives
- Create classes and objects in Java.
- Apply encapsulation using access modifiers and getters/setters.
- Understand constructors and the `this` keyword.

---

## What is OOP?
Object-Oriented Programming models software as a collection of **objects** — entities that combine **state** (data fields) and **behavior** (methods). Real-world entities map naturally to objects.

---

## Class vs Object
- **Class**: A blueprint (like a house blueprint)
- **Object**: A specific instance built from the blueprint (like a house built from it)

```java
// Class definition — the blueprint
class BankAccount {
    // Fields (state)
    private String owner;
    private double balance;

    // Constructor — called when creating an object
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    // Methods (behavior)
    public void deposit(double amount) { balance += amount; }
    public double getBalance() { return balance; }
}

// Creating an object from the class
BankAccount myAccount = new BankAccount("Alice", 1000.00);
myAccount.deposit(500);
System.out.println(myAccount.getBalance()); // 1500.0
```

---

## Encapsulation
Make fields `private` and expose them through `public` getters/setters. This protects the internal state.

```java
class Person {
    private int age; // hidden from outside

    public int getAge() { return age; } // controlled read

    public void setAge(int age) {       // controlled write
        if (age >= 0 && age <= 150) {
            this.age = age;
        }
        // invalid values silently rejected
    }
}
```

---

## The 'this' Keyword
Refers to the current object instance. Used to disambiguate when a parameter has the same name as a field.

```java
public BankAccount(String owner) {
    this.owner = owner; // 'this.owner' = field, 'owner' = parameter
}
```