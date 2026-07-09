# OOP — Code Examples

## Full Example: Student class
```java
class Student {
    private String name;
    private int grade;

    public Student(String name, int grade) {
        this.name = name;
        setGrade(grade); // use setter for validation
    }

    public String getName() { return name; }
    public int getGrade() { return grade; }

    public void setGrade(int grade) {
        if (grade >= 0 && grade <= 100) this.grade = grade;
        else System.out.println("Invalid grade: " + grade);
    }

    @Override
    public String toString() {
        return name + " (" + grade + "%)";
    }
}

// Usage
Student s = new Student("Alice", 95);
System.out.println(s); // Alice (95%)
s.setGrade(110);       // Invalid grade: 110
```