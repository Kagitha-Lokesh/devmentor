import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '../content/courses');

// ── Helper ──────────────────────────────────────────────────────────────────
function writeContent(course, volume, chapter, slug, { lesson, cheatsheet, examples, revision, flashcards, quiz, interview }) {
  const dir = path.join(contentDir, course, `volume-${volume}`, 'chapters', chapter, 'topics', slug);
  fs.writeFileSync(path.join(dir, 'lesson.md'), lesson.trim());
  fs.writeFileSync(path.join(dir, 'cheatsheet.md'), cheatsheet.trim());
  fs.writeFileSync(path.join(dir, 'examples.md'), examples.trim());
  fs.writeFileSync(path.join(dir, 'revision.md'), revision.trim());
  fs.writeFileSync(path.join(dir, 'flashcards.json'), JSON.stringify(flashcards, null, 2));
  fs.writeFileSync(path.join(dir, 'quiz.json'), JSON.stringify(quiz, null, 2));
  fs.writeFileSync(path.join(dir, 'interview.json'), JSON.stringify(interview, null, 2));
  console.log(`✓ Updated: ${course} / ${slug}`);
}

// ════════════════════════════════════════════════════════════════════════════
//  JAVA TOPICS
// ════════════════════════════════════════════════════════════════════════════

// ── loops ──────────────────────────────────────────────────────────────────
writeContent('java', 1, 'chapter-1', 'loops', {
  lesson: `# Loops in Java

## Learning Objectives
- Understand when to use \`for\`, \`while\`, and \`do-while\` loops.
- Differentiate between entry-controlled and exit-controlled loops.
- Use \`break\` and \`continue\` to control loop execution.

---

## Why Should I Learn This?
Imagine processing 1,000 bank transactions to find invalid ones. Without loops, you would need to copy-paste the same check 1,000 times. Loops eliminate this repetition, letting you process any amount of data with just a few lines of code.

---

## The For Loop
Use when the number of iterations is **known in advance**.

\`\`\`java
// Print numbers 1 to 5
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
// Output: Count: 1  Count: 2  Count: 3  Count: 4  Count: 5
\`\`\`

**Anatomy of a for loop:**
\`\`\`
for (initialization ; condition ; update) { body }
      int i = 0      i < 10       i++
\`\`\`

---

## The While Loop
Use when the number of iterations is **unknown** — you loop until a condition changes.

\`\`\`java
int pin = 0;
while (pin != 1234) {
    System.out.println("Wrong PIN, try again.");
    pin = getInputFromUser(); // imagine this reads input
}
System.out.println("Access granted!");
\`\`\`

> [!NOTE]
> If the condition is false from the start, the while loop body **never executes**.

---

## The Do-While Loop
Guarantees the body runs **at least once**, then checks the condition.

\`\`\`java
int choice;
do {
    System.out.println("Menu: 1) Play  2) Quit");
    choice = scanner.nextInt();
} while (choice != 2);
\`\`\`

---

## Break and Continue

| Keyword | Effect |
|---|---|
| \`break\` | Immediately exits the loop |
| \`continue\` | Skips current iteration, moves to next |

\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i == 5) continue; // skip 5
    if (i == 8) break;    // stop at 8
    System.out.print(i + " ");
}
// Output: 1 2 3 4 6 7
\`\`\`

---

## Common Mistakes
1. **Infinite loop**: Forgetting to update the loop variable \`i++\`
2. **Off-by-one error**: Using \`<\` vs \`<=\` — think carefully about whether you need to include the last value
3. **Modifying the loop variable inside the body**: Leads to unpredictable iteration counts`,

  cheatsheet: `# Loops Cheatsheet

## For Loop
\`\`\`java
for (int i = 0; i < n; i++) { }
\`\`\`

## Enhanced For (forEach)
\`\`\`java
for (String item : list) { }
\`\`\`

## While Loop
\`\`\`java
while (condition) { }
\`\`\`

## Do-While Loop
\`\`\`java
do { } while (condition);
\`\`\`

## Control Keywords
- \`break\` → exit loop immediately
- \`continue\` → skip to next iteration
- Labeled break: \`outer: for(...) { break outer; }\`

## Quick Decision Guide
| Situation | Use |
|---|---|
| Known iterations | \`for\` |
| Unknown, may not run | \`while\` |
| Must run at least once | \`do-while\` |
| Iterate collection | enhanced \`for\` |`,

  examples: `# Loops — Code Examples

## Example 1: Sum of digits
\`\`\`java
int number = 12345;
int sum = 0;
while (number > 0) {
    sum += number % 10;  // get last digit
    number /= 10;        // remove last digit
}
System.out.println("Sum of digits: " + sum); // 15
\`\`\`

## Example 2: Multiplication table
\`\`\`java
int n = 5;
for (int i = 1; i <= 10; i++) {
    System.out.println(n + " x " + i + " = " + (n * i));
}
\`\`\`

## Example 3: Nested loops — print a triangle
\`\`\`java
for (int row = 1; row <= 5; row++) {
    for (int col = 1; col <= row; col++) {
        System.out.print("* ");
    }
    System.out.println();
}
\`\`\``,

  revision: `# Loops — Revision Notes

## Key Points to Remember
- **for loop** → known iterations; initializer, condition, update all in one line
- **while loop** → entry-controlled; condition checked BEFORE body runs
- **do-while** → exit-controlled; body always runs at LEAST once
- **break** → exits the innermost enclosing loop
- **continue** → skips rest of current iteration

## Common Interview Patterns
- Find factorial using a for loop
- Reverse a number using while loop
- Validate input using do-while
- Nested loops for 2D matrix operations

## Gotchas
- \`for(;;)\` is a legal infinite loop in Java
- \`break\` only exits the innermost loop — use labeled break for nested loops`,

  flashcards: [
    { question: "What is the key difference between while and do-while loops?", answer: "A while loop checks the condition BEFORE executing the body (may never run). A do-while checks AFTER, so the body always runs at least once." },
    { question: "What does the 'continue' keyword do inside a loop?", answer: "It immediately skips the rest of the current iteration and jumps to the next iteration of the loop." },
    { question: "What are the three parts of a for loop header?", answer: "1) Initialization (runs once), 2) Condition (checked each iteration), 3) Update expression (runs after each body execution)." },
    { question: "When would you choose a while loop over a for loop?", answer: "When the number of iterations is not known in advance, such as reading input until the user types 'quit'." }
  ],

  quiz: [
    { question: "Which loop is guaranteed to execute its body at least once?", options: ["for loop", "while loop", "do-while loop", "enhanced for loop"], answerIndex: 2, explanation: "The do-while loop checks its condition AFTER the body executes, so the body always runs at least once even if the condition is false." },
    { question: "What will this code print?\n\nfor(int i=0; i<5; i++) { if(i==3) break; System.out.print(i); }", options: ["0 1 2", "0 1 2 3", "0 1 2 3 4", "Infinite loop"], answerIndex: 0, explanation: "When i equals 3, break exits the loop immediately. So only 0, 1, 2 are printed." },
    { question: "How do you iterate over every element in an ArrayList called 'names'?", options: ["for(int i : names)", "for(String name : names)", "while(names.hasNext())", "for(names.each())"], answerIndex: 1, explanation: "The enhanced for loop syntax is: for(Type element : collection). Since names is a list of Strings, String name is the correct type." }
  ],

  interview: [
    { question: "Can you explain the difference between break and continue with an example?", answer: "break exits the loop entirely. continue skips the current iteration and moves to the next. Example: in a loop from 1-10, 'if(i%2==0) continue' prints only odd numbers, while 'if(i==5) break' stops at 4." },
    { question: "What is an infinite loop and when might you intentionally use one?", answer: "An infinite loop runs forever (e.g., while(true){}). You intentionally use them in server event loops, game loops, or daemon threads — breaking out explicitly with 'break' or 'return' when a termination condition is met." }
  ]
});

// ── methods ────────────────────────────────────────────────────────────────
writeContent('java', 1, 'chapter-1', 'methods', {
  lesson: `# Methods in Java

## Learning Objectives
- Define and call methods with parameters and return types.
- Understand the difference between method overloading and overriding.
- Master pass-by-value vs pass-by-reference.

---

## Why Methods?
Without methods, you would repeat the same code every time you need it. Methods let you write logic once and reuse it anywhere — the "Don't Repeat Yourself" (DRY) principle.

---

## Anatomy of a Method

\`\`\`java
//  Access   Return  Name       Parameters
    public   int     add        (int a, int b) {
        return a + b;  // body
    }
\`\`\`

---

## Void vs Return
\`\`\`java
// void — performs action, returns nothing
public void greet(String name) {
    System.out.println("Hello, " + name + "!");
}

// int — performs calculation, returns a value
public int square(int n) {
    return n * n;
}
\`\`\`

---

## Method Overloading
Same method name, different parameter lists. Java picks the right one at **compile time**.

\`\`\`java
public int add(int a, int b) { return a + b; }
public double add(double a, double b) { return a + b; }
public int add(int a, int b, int c) { return a + b + c; }

// Java picks based on arguments:
add(2, 3);         // → int version
add(2.5, 3.5);     // → double version
add(1, 2, 3);      // → three-param version
\`\`\`

---

## Pass-by-Value
Java **always** passes by value. For primitives, a copy is passed. For objects, a copy of the **reference** is passed.

\`\`\`java
public void increment(int x) { x++; }

int num = 5;
increment(num);
System.out.println(num); // Still 5! Original unchanged.
\`\`\``,

  cheatsheet: `# Methods Cheatsheet

## Syntax
\`\`\`java
accessModifier returnType methodName(params) {
    return value; // omit if void
}
\`\`\`

## Access Modifiers
| Modifier | Accessible From |
|---|---|
| \`public\` | Everywhere |
| \`private\` | Same class only |
| \`protected\` | Same package + subclasses |
| (none) | Same package |

## Overloading Rules
- Same name, different parameter TYPE or COUNT
- Return type alone does NOT differentiate

## Key Facts
- Java is always **pass-by-value**
- \`static\` methods belong to the class, not an instance
- \`final\` methods cannot be overridden`,

  examples: `# Methods — Code Examples

## Example 1: Calculator using overloaded methods
\`\`\`java
public class Calculator {
    public int multiply(int a, int b) { return a * b; }
    public double multiply(double a, double b) { return a * b; }
    public int multiply(int a, int b, int c) { return a * b * c; }
}
\`\`\`

## Example 2: Recursive method — Factorial
\`\`\`java
public int factorial(int n) {
    if (n <= 1) return 1;          // base case
    return n * factorial(n - 1);   // recursive call
}
// factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
\`\`\``,

  revision: `# Methods — Revision Notes

## Core Concepts
- Methods group reusable logic — promotes DRY principle
- Signature = method name + parameter types (NOT return type)
- **Overloading**: same name, different params → compile-time polymorphism
- **Overriding**: subclass provides its own implementation → runtime polymorphism

## Pass-by-Value Trap
Java copies the value. For objects, it copies the reference (pointer), not the object. Reassigning the reference inside a method won't affect the original, but mutating the object will.

## varargs
\`\`\`java
public int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
sum(1, 2, 3, 4, 5); // Works!
\`\`\``,

  flashcards: [
    { question: "What is method overloading?", answer: "Defining multiple methods with the same name but different parameter lists (type or count). Java selects the correct version at compile time." },
    { question: "Is Java pass-by-value or pass-by-reference?", answer: "Always pass-by-value. For objects, a copy of the reference is passed — you can mutate the object but cannot reassign the original reference." },
    { question: "What defines a method's signature in Java?", answer: "The method name plus the parameter types and their order. The return type is NOT part of the signature." },
    { question: "What is the difference between method overloading and overriding?", answer: "Overloading: same class, same name, different params (compile-time). Overriding: subclass redefines a parent's method with the same signature (runtime)." }
  ],

  quiz: [
    { question: "Which of the following correctly overloads the method 'int add(int a, int b)'?", options: ["double add(int a, int b)", "int add(int x, int y)", "int add(int a, int b, int c)", "void add(int a, int b)"], answerIndex: 2, explanation: "Overloading requires a different parameter count or types. Only the three-parameter version qualifies. Changing only the return type or parameter names is not valid overloading." },
    { question: "What does void as a return type mean?", options: ["The method returns zero", "The method returns null", "The method does not return any value", "The method can return any type"], answerIndex: 2, explanation: "void means the method performs an action but does not produce a return value. You cannot assign the result of a void method." }
  ],

  interview: [
    { question: "Can you overload a method by changing only the return type?", answer: "No. The method signature in Java is determined by the method name and its parameter list only. Changing the return type without changing the parameters causes a compile error because Java cannot distinguish which version to call." },
    { question: "Explain the 'main' method signature and why each part is required.", answer: "public — accessible by the JVM; static — no object needed to call it; void — JVM doesn't need a return value; String[] args — allows command-line arguments to be passed in." }
  ]
});

// ── arrays ─────────────────────────────────────────────────────────────────
writeContent('java', 1, 'chapter-1', 'arrays', {
  lesson: `# Arrays in Java

## Learning Objectives
- Declare, initialize, and access one-dimensional arrays.
- Use multi-dimensional arrays for grid-based data.
- Understand how arrays are stored in memory.

---

## What Is an Array?
An array is a **fixed-size, ordered container** that stores multiple values of the **same type** under a single variable name. Elements are accessed by their **index**, starting at 0.

\`\`\`java
String[] fruits = {"Apple", "Banana", "Cherry"};
//                  [0]       [1]        [2]
System.out.println(fruits[1]); // Banana
\`\`\`

---

## Declaring & Initializing

\`\`\`java
// Method 1: Declare then initialize
int[] scores = new int[5]; // all zeros by default

// Method 2: Declare with values
int[] marks = {95, 87, 76, 88, 92};

// Method 3: New with values
String[] days = new String[]{"Mon", "Tue", "Wed"};
\`\`\`

---

## Array Length
\`\`\`java
int[] arr = {10, 20, 30, 40};
System.out.println(arr.length); // 4  ← property, NOT method (no parentheses)
\`\`\`

---

## Common Iteration Patterns
\`\`\`java
int[] nums = {3, 1, 4, 1, 5};

// Classic for loop (when you need the index)
for (int i = 0; i < nums.length; i++) {
    System.out.println("Index " + i + ": " + nums[i]);
}

// Enhanced for loop (when you only need values)
for (int n : nums) {
    System.out.println(n);
}
\`\`\`

---

## 2D Arrays
\`\`\`java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[1][2]); // 6 (row 1, column 2)
\`\`\`

> [!NOTE]
> Arrays in Java have a **fixed size**. If you need a resizable collection, use \`ArrayList\`.`,

  cheatsheet: `# Arrays Cheatsheet

## Declaration
\`\`\`java
type[] name = new type[size];
type[] name = {val1, val2, val3};
\`\`\`

## Key Properties
- \`arr.length\` → number of elements
- Index starts at **0**, ends at **length - 1**
- Fixed size after creation

## Sorting & Searching
\`\`\`java
Arrays.sort(arr);                   // sort ascending
int idx = Arrays.binarySearch(arr, key); // must be sorted first
\`\`\`

## Copying
\`\`\`java
int[] copy = Arrays.copyOf(arr, newLen);
int[] range = Arrays.copyOfRange(arr, from, to);
\`\`\`

## Common Mistakes
- \`arr.length();\` → WRONG (no parentheses!)
- \`arr[arr.length]\` → ArrayIndexOutOfBoundsException`,

  examples: `# Arrays — Code Examples

## Example 1: Find maximum value
\`\`\`java
int[] scores = {45, 82, 67, 91, 38};
int max = scores[0];
for (int i = 1; i < scores.length; i++) {
    if (scores[i] > max) max = scores[i];
}
System.out.println("Max: " + max); // 91
\`\`\`

## Example 2: Reverse an array in-place
\`\`\`java
int[] arr = {1, 2, 3, 4, 5};
int left = 0, right = arr.length - 1;
while (left < right) {
    int temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++; right--;
}
// arr is now {5, 4, 3, 2, 1}
\`\`\``,

  revision: `# Arrays — Revision Notes

## Must-Know Facts
- Arrays are **objects** in Java stored on the **Heap**
- The variable holds a **reference** to the array object
- Default values: \`int[]\` → 0, \`boolean[]\` → false, \`String[]\` → null
- \`ArrayIndexOutOfBoundsException\` → accessing index < 0 or >= length

## java.util.Arrays Utility Methods
- \`Arrays.sort(arr)\` — O(n log n) dual-pivot quicksort
- \`Arrays.toString(arr)\` — readable string for printing
- \`Arrays.equals(a, b)\` — deep element comparison
- \`Arrays.fill(arr, val)\` — fill all elements with a value`,

  flashcards: [
    { question: "What is the index of the first element in a Java array?", answer: "0. Arrays in Java are zero-indexed, so the first element is at index 0 and the last is at index (length - 1)." },
    { question: "What exception is thrown when you access an invalid array index?", answer: "ArrayIndexOutOfBoundsException — thrown at runtime when accessing an index < 0 or >= array.length." },
    { question: "How do you get the number of elements in a Java array?", answer: "Using the .length property (not a method — no parentheses). Example: arr.length" },
    { question: "What are the default values for int[], String[], and boolean[] arrays?", answer: "int[] defaults to 0, String[] defaults to null, boolean[] defaults to false." }
  ],

  quiz: [
    { question: "What does 'int[] arr = new int[5]' create?", options: ["An array with values 1,2,3,4,5", "An array of 5 zeros", "A compile error", "An array of 5 nulls"], answerIndex: 1, explanation: "When you create an int array with 'new int[5]', all elements are initialized to 0 by default." },
    { question: "Given arr = {10,20,30,40,50}, what is arr[arr.length - 1]?", options: ["40", "50", "null", "ArrayIndexOutOfBoundsException"], answerIndex: 1, explanation: "arr.length is 5, so arr.length - 1 is 4. arr[4] is the last element, which is 50." }
  ],

  interview: [
    { question: "What is the difference between an array and an ArrayList?", answer: "Arrays have a fixed size set at creation and can store primitives. ArrayLists are dynamic (resize automatically) and can only store objects. Arrays use [] syntax, ArrayList uses .get() and .add()." },
    { question: "How is a 2D array stored in Java's memory?", answer: "A 2D array is an array of arrays. The outer array holds references to inner arrays, which hold the actual values. Each row is a separate object on the heap, so rows can technically have different lengths (jagged arrays)." }
  ]
});

// ── strings ────────────────────────────────────────────────────────────────
writeContent('java', 1, 'chapter-1', 'strings', {
  lesson: `# Strings in Java

## Learning Objectives
- Understand String immutability and the String Pool.
- Use common String methods for manipulation and comparison.
- Know when to use StringBuilder for performance.

---

## Strings Are Immutable
Once a String object is created, its value **cannot change**. Every operation that "modifies" a string actually creates a new one.

\`\`\`java
String name = "Java";
name.toUpperCase(); // Creates a NEW String "JAVA"
System.out.println(name); // Still "Java" — original unchanged!

// Correct way:
name = name.toUpperCase();
System.out.println(name); // "JAVA"
\`\`\`

---

## String Pool
Java maintains a pool of String literals in memory. When you create a string literal, Java checks the pool first. This saves memory.

\`\`\`java
String a = "hello";  // stored in String Pool
String b = "hello";  // reuses same object from pool
String c = new String("hello"); // forces new Heap object

System.out.println(a == b);      // true  (same reference)
System.out.println(a == c);      // false (different reference)
System.out.println(a.equals(c)); // true  (same content) ← ALWAYS use equals()
\`\`\`

> [!IMPORTANT]
> **Always use .equals() to compare String content**, never ==.

---

## Essential String Methods

\`\`\`java
String s = "  Hello, World!  ";

s.length()              // 18
s.trim()                // "Hello, World!"
s.toLowerCase()         // "  hello, world!  "
s.toUpperCase()         // "  HELLO, WORLD!  "
s.trim().charAt(0)      // 'H'
s.trim().indexOf("o")   // 4
s.trim().substring(7)   // "World!"
s.trim().substring(7,12)// "World"
s.trim().contains("World")  // true
s.trim().replace("World","Java") // "Hello, Java!"
s.trim().split(", ")    // ["Hello", "World!"]
\`\`\`

---

## StringBuilder — For Performance
When building strings in a loop, use \`StringBuilder\` to avoid creating hundreds of unnecessary String objects.

\`\`\`java
// Bad (creates 1000 intermediate Strings):
String result = "";
for (int i = 0; i < 1000; i++) result += i;

// Good (single mutable buffer):
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) sb.append(i);
String result = sb.toString();
\`\`\``,

  cheatsheet: `# Strings Cheatsheet

## Key Methods
| Method | Description |
|---|---|
| \`length()\` | Number of characters |
| \`charAt(i)\` | Character at index i |
| \`indexOf(s)\` | First position of s, -1 if not found |
| \`substring(s,e)\` | Extract from s (inclusive) to e (exclusive) |
| \`toUpperCase()\` | All uppercase |
| \`toLowerCase()\` | All lowercase |
| \`trim()\` | Remove leading/trailing spaces |
| \`replace(old,new)\` | Replace occurrences |
| \`split(regex)\` | Split into String[] |
| \`equals(s)\` | Content equality |
| \`equalsIgnoreCase(s)\` | Case-insensitive equality |
| \`startsWith(s)\` | Prefix check |
| \`isEmpty()\` | true if length == 0 |
| \`isBlank()\` | true if empty or only whitespace |

## Comparison Rule
- \`==\` compares references
- \`.equals()\` compares content ← **Always use this**

## StringBuilder vs StringBuffer
- \`StringBuilder\` — faster, not thread-safe
- \`StringBuffer\` — thread-safe, slightly slower`,

  examples: `# Strings — Code Examples

## Example 1: Count vowels in a string
\`\`\`java
String word = "Programming";
int count = 0;
for (char c : word.toLowerCase().toCharArray()) {
    if ("aeiou".indexOf(c) != -1) count++;
}
System.out.println("Vowels: " + count); // 3
\`\`\`

## Example 2: Reverse a string using StringBuilder
\`\`\`java
String original = "DevMentor";
String reversed = new StringBuilder(original).reverse().toString();
System.out.println(reversed); // rotneMyeD
\`\`\`

## Example 3: Check if a string is a palindrome
\`\`\`java
String s = "racecar";
String reversed = new StringBuilder(s).reverse().toString();
System.out.println(s.equals(reversed)); // true
\`\`\``,

  revision: `# Strings — Revision Notes

## Immutability — Why It Matters
- Thread-safe by nature (no synchronization needed)
- Safe as HashMap keys (hash code is consistent)
- Security: passwords can't be accidentally mutated

## Interview Hotspots
1. \`==\` vs \`.equals()\` — most common trap
2. Why StringBuilder in loops (O(n) vs O(n²) complexity)
3. String Pool: \`"abc"\` vs \`new String("abc")\`
4. \`intern()\` — force a string into the pool

## String to char[] and back
\`\`\`java
char[] chars = "hello".toCharArray();
String back = new String(chars);
\`\`\``,

  flashcards: [
    { question: "Why should you use .equals() instead of == to compare Strings?", answer: "== compares memory references (locations). .equals() compares the actual character content. Two String objects with the same text can be at different memory locations, so == would return false even though they look the same." },
    { question: "What is String immutability in Java?", answer: "Once a String object is created, its character sequence cannot be changed. Methods like toUpperCase() and replace() return NEW String objects rather than modifying the original." },
    { question: "What is the String Pool?", answer: "A special memory area (part of the heap) where Java stores String literals. When you write String s = \"hello\", Java checks the pool first. If \"hello\" exists, it reuses it — saving memory." },
    { question: "When should you use StringBuilder instead of String concatenation?", answer: "When building strings inside loops. String concatenation in a loop is O(n²) because each '+' creates a new object. StringBuilder uses a mutable buffer making it O(n)." }
  ],

  quiz: [
    { question: "What does the following print?\nString a = \"hello\";\nString b = new String(\"hello\");\nSystem.out.println(a == b);", options: ["true", "false", "Compile error", "hello"], answerIndex: 1, explanation: "'a' points to the String pool. 'b = new String(...)' always creates a new heap object. They are at different memory addresses, so == returns false. Use .equals() to compare content." },
    { question: "What does String.split(\",\") return for input \"a,b,c\"?", options: ["[\"a,b,c\"]", "[\"a\", \"b\", \"c\"]", "[\"a\",\",\",\"b\",\",\",\"c\"]", "Compile error"], answerIndex: 1, explanation: "split() divides the string at each occurrence of the delimiter and returns a String array. \"a,b,c\".split(\",\") gives [\"a\", \"b\", \"c\"]." }
  ],

  interview: [
    { question: "Why is String immutable in Java and what are the benefits?", answer: "Strings are immutable by design for: 1) Security — string parameters (file paths, passwords) can't be altered by a method. 2) Thread safety — immutable objects can be shared freely across threads. 3) Caching — the hash code is computed once and cached. 4) String pool — immutability enables safe reference sharing." },
    { question: "What is the difference between String, StringBuilder, and StringBuffer?", answer: "String: immutable, thread-safe by nature. StringBuilder: mutable, fast, NOT thread-safe — use in single-threaded contexts. StringBuffer: mutable, thread-safe (synchronized methods) — use in multi-threaded contexts but slower than StringBuilder." }
  ]
});

// ── oop-basics ─────────────────────────────────────────────────────────────
writeContent('java', 1, 'chapter-1', 'oop-basics', {
  lesson: `# OOP Fundamentals

## Learning Objectives
- Create classes and objects in Java.
- Apply encapsulation using access modifiers and getters/setters.
- Understand constructors and the \`this\` keyword.

---

## What is OOP?
Object-Oriented Programming models software as a collection of **objects** — entities that combine **state** (data fields) and **behavior** (methods). Real-world entities map naturally to objects.

---

## Class vs Object
- **Class**: A blueprint (like a house blueprint)
- **Object**: A specific instance built from the blueprint (like a house built from it)

\`\`\`java
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
\`\`\`

---

## Encapsulation
Make fields \`private\` and expose them through \`public\` getters/setters. This protects the internal state.

\`\`\`java
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
\`\`\`

---

## The 'this' Keyword
Refers to the current object instance. Used to disambiguate when a parameter has the same name as a field.

\`\`\`java
public BankAccount(String owner) {
    this.owner = owner; // 'this.owner' = field, 'owner' = parameter
}
\`\`\``,

  cheatsheet: `# OOP Cheatsheet

## Class Template
\`\`\`java
class ClassName {
    // fields
    private type fieldName;

    // constructor
    public ClassName(type param) { this.fieldName = param; }

    // methods
    public type getFieldName() { return fieldName; }
    public void setFieldName(type val) { this.fieldName = val; }
}
\`\`\`

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
| public | ✓ | ✓ | ✓ | ✓ |`,

  examples: `# OOP — Code Examples

## Full Example: Student class
\`\`\`java
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
\`\`\``,

  revision: `# OOP — Revision Notes

## Core Ideas
- **Encapsulation** = private data + public methods
- **Constructor** = special method called with \`new\`, same name as class, no return type
- **this** = reference to current object
- **static** = belongs to class, not instance

## Constructor Rules
- No return type (not even void)
- Same name as class
- If you write no constructor, Java provides a default no-arg one
- If you write ANY constructor, the default one disappears

## Chained Constructors
\`\`\`java
public class Point {
    int x, y;
    public Point() { this(0, 0); } // calls two-arg constructor
    public Point(int x, int y) { this.x = x; this.y = y; }
}
\`\`\``,

  flashcards: [
    { question: "What is encapsulation and how is it implemented in Java?", answer: "Encapsulation is hiding an object's internal state and requiring all interaction to go through methods. In Java, it's implemented by making fields 'private' and providing 'public' getters and setters." },
    { question: "What is the purpose of the 'this' keyword in Java?", answer: "'this' refers to the current object instance. It's used to resolve naming conflicts between instance fields and constructor/method parameters, and to call other constructors in the same class (this())." },
    { question: "What happens if you don't define any constructor in a Java class?", answer: "Java automatically provides a default no-argument constructor. However, if you define any constructor yourself, the default one is no longer provided automatically." },
    { question: "What is the difference between a class and an object?", answer: "A class is a blueprint or template that defines fields and methods. An object is a concrete instance of that class created with the 'new' keyword, allocated on the Heap with its own copy of instance fields." }
  ],

  quiz: [
    { question: "Which keyword is used to create an object from a class?", options: ["create", "new", "object", "instance"], answerIndex: 1, explanation: "'new' allocates memory on the heap and calls the constructor to initialize the object." },
    { question: "What is the main benefit of making a field 'private'?", options: ["Faster execution", "Less memory usage", "Controlled access — prevents invalid state", "Allows access from all classes"], answerIndex: 2, explanation: "Private fields can only be accessed via the class's own methods. This lets you add validation in setters and prevents other code from setting the field to an invalid value." }
  ],

  interview: [
    { question: "Explain the four pillars of OOP.", answer: "1) Encapsulation: bundling data and methods, hiding internal state. 2) Inheritance: subclass extends parent, reusing and specializing code. 3) Polymorphism: one interface, many forms — method overloading (compile-time) and overriding (runtime). 4) Abstraction: exposing only essential details through abstract classes and interfaces." },
    { question: "Can a constructor be private? If so, when would you use it?", answer: "Yes. A private constructor prevents external instantiation. This is used in the Singleton pattern (to ensure only one instance exists) and in Factory/Builder patterns where object creation is controlled through static factory methods." }
  ]
});

// ════════════════════════════════════════════════════════════════════════════
//  FRONTEND TOPICS
// ════════════════════════════════════════════════════════════════════════════

// ── css-fundamentals ───────────────────────────────────────────────────────
writeContent('frontend', 1, 'chapter-1', 'css-fundamentals', {
  lesson: `# CSS Fundamentals

## Learning Objectives
- Understand the CSS Box Model.
- Apply selectors, colors, typography, and spacing.
- Control element visibility and positioning.

---

## What is CSS?
CSS (Cascading Style Sheets) describes how HTML elements should be displayed. Without CSS, the web would be plain black text on white backgrounds.

---

## The Cascade & Specificity
When multiple rules target the same element, CSS uses **specificity** to decide which wins.

| Selector | Specificity |
|---|---|
| Inline style | 1000 |
| ID \`#id\` | 100 |
| Class \`.class\`, attribute, pseudo-class | 10 |
| Element \`div\`, \`p\` | 1 |

\`\`\`css
p { color: blue; }           /* specificity: 1 */
.text { color: green; }      /* specificity: 10 — wins */
#heading { color: red; }     /* specificity: 100 — wins over class */
\`\`\`

---

## The Box Model
Every element is a rectangular box made up of four areas.

\`\`\`
+---------------------------+
|         MARGIN            |  ← space outside border
|  +---------------------+  |
|  |       BORDER        |  |  ← outline around padding
|  |  +--------------+   |  |
|  |  |   PADDING    |   |  |  ← space inside border
|  |  | +----------+ |   |  |
|  |  | | CONTENT  | |   |  |  ← the actual text/image
|  |  | +----------+ |   |  |
|  |  +--------------+   |  |
|  +---------------------+  |
+---------------------------+
\`\`\`

\`\`\`css
.card {
    width: 300px;
    padding: 20px;     /* space inside */
    border: 2px solid #ccc;
    margin: 10px;      /* space outside */
    box-sizing: border-box; /* padding included in width */
}
\`\`\`

---

## Positioning
\`\`\`css
position: static;   /* default, normal flow */
position: relative; /* offset from normal position */
position: absolute; /* relative to nearest positioned ancestor */
position: fixed;    /* relative to viewport, stays on scroll */
position: sticky;   /* relative until scroll threshold */
\`\`\``,

  cheatsheet: `# CSS Fundamentals Cheatsheet

## Selectors
\`\`\`css
*           { }  /* universal */
p           { }  /* element */
.className  { }  /* class */
#idName     { }  /* id */
div > p     { }  /* direct child */
div p       { }  /* descendant */
a:hover     { }  /* pseudo-class */
p::first-line { } /* pseudo-element */
\`\`\`

## Box Model (border-box is best practice)
\`\`\`css
* { box-sizing: border-box; }
\`\`\`

## Common Properties
| Property | Example |
|---|---|
| color | \`color: #333\` |
| background | \`background: #f0f0f0\` |
| font-size | \`font-size: 1rem\` |
| font-weight | \`font-weight: bold\` |
| margin | \`margin: 10px 20px\` |
| padding | \`padding: 8px 16px\` |
| border | \`border: 1px solid black\` |
| border-radius | \`border-radius: 8px\` |
| display | \`display: flex / block / inline\` |`,

  examples: `# CSS — Code Examples

## A styled card component
\`\`\`css
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 24px;
    max-width: 360px;
    margin: 20px auto;
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-4px);
}

.card h2 {
    font-size: 1.4rem;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.card p {
    color: #555;
    line-height: 1.6;
}
\`\`\``,

  revision: `# CSS — Revision Notes

## Box Model Mental Model
- content → padding → border → margin
- \`box-sizing: border-box\` makes width include padding + border (use always)

## Specificity Calculation
- Inline > ID > Class > Element
- \`!important\` overrides everything (avoid if possible)

## Display Values
- \`block\` — full width, new line
- \`inline\` — content width, no new line
- \`inline-block\` — content width, accepts width/height
- \`flex\` — flexible container
- \`grid\` — 2D layout system
- \`none\` — hides element completely`,

  flashcards: [
    { question: "What are the four components of the CSS Box Model (from inside out)?", answer: "Content → Padding → Border → Margin. Content is the actual element content, padding is transparent space inside the border, border surrounds the padding, and margin is the transparent space outside the border." },
    { question: "What does 'box-sizing: border-box' do?", answer: "It makes the width and height properties include padding and border in their calculation. Without it, padding and border ADD to the specified width, which makes layout math confusing." },
    { question: "What is CSS specificity and how is it calculated?", answer: "Specificity determines which CSS rule wins when multiple rules target the same element. ID selectors (100) beat class selectors (10) which beat element selectors (1). Inline styles score 1000." },
    { question: "What is the difference between 'display: none' and 'visibility: hidden'?", answer: "display: none removes the element from the layout entirely (no space taken). visibility: hidden hides the element visually but it still occupies space in the layout." }
  ],

  quiz: [
    { question: "Which CSS selector has the highest specificity?", options: [".class", "#id", "element", "* (universal)"], answerIndex: 1, explanation: "ID selectors (#id) have a specificity of 100, which is higher than class (10) or element (1) selectors. Inline styles are even higher at 1000, but that's not a selector." },
    { question: "In the box model, which area creates visible space INSIDE the border?", options: ["Margin", "Padding", "Content", "Border"], answerIndex: 1, explanation: "Padding is the space between the content and the border. It's inside the border and takes the background color of the element." }
  ],

  interview: [
    { question: "Explain the difference between relative, absolute, and fixed positioning.", answer: "Relative: element stays in normal flow, offset from its normal position. Absolute: removed from flow, positioned relative to the nearest non-static ancestor. Fixed: removed from flow, positioned relative to the browser viewport and doesn't scroll." },
    { question: "What is the difference between margin and padding?", answer: "Padding is inside the border — it's part of the element's clickable area and takes the background color. Margin is outside the border — it's transparent space between elements. Margins can collapse (two adjacent margins merge into the larger one). Padding never collapses." }
  ]
});

// ── sql-basics ─────────────────────────────────────────────────────────────
writeContent('database', 1, 'chapter-1', 'sql-basics', {
  lesson: `# SQL Basics

## Learning Objectives
- Write SELECT, INSERT, UPDATE, and DELETE statements.
- Filter data with WHERE, ORDER BY, and LIMIT.
- Understand database tables, rows, and columns.

---

## What is SQL?
SQL (Structured Query Language) is the standard language for relational databases. With SQL you can store, retrieve, update, and delete data from tables.

---

## SELECT — Reading Data
\`\`\`sql
-- Get all columns from all rows
SELECT * FROM users;

-- Get specific columns
SELECT first_name, email FROM users;

-- Filter with WHERE
SELECT * FROM users WHERE age > 18;

-- Sort results
SELECT * FROM products ORDER BY price DESC;

-- Limit number of results
SELECT * FROM products ORDER BY price DESC LIMIT 5;
\`\`\`

---

## INSERT — Adding Data
\`\`\`sql
INSERT INTO users (first_name, email, age)
VALUES ('Alice', 'alice@example.com', 28);
\`\`\`

---

## UPDATE — Modifying Data
\`\`\`sql
UPDATE users
SET email = 'new@email.com'
WHERE id = 5;
\`\`\`
> [!CAUTION]
> Always include a WHERE clause with UPDATE and DELETE, or you'll modify/delete ALL rows!

---

## DELETE — Removing Data
\`\`\`sql
DELETE FROM users WHERE id = 5;
\`\`\`

---

## WHERE Operators
\`\`\`sql
WHERE age = 25          -- Equal
WHERE age != 25         -- Not equal
WHERE age > 18          -- Greater than
WHERE age BETWEEN 18 AND 65  -- Range (inclusive)
WHERE name LIKE 'A%'    -- Starts with A (% = any chars)
WHERE name LIKE '%son'  -- Ends with son
WHERE city IN ('London', 'Paris') -- Match any value in list
WHERE email IS NULL     -- Check for null
WHERE email IS NOT NULL -- Check for non-null
\`\`\``,

  cheatsheet: `# SQL Basics Cheatsheet

## CRUD at a Glance
\`\`\`sql
-- Read
SELECT col1, col2 FROM table WHERE condition ORDER BY col LIMIT n;

-- Create
INSERT INTO table (col1, col2) VALUES (val1, val2);

-- Update
UPDATE table SET col = val WHERE condition;

-- Delete
DELETE FROM table WHERE condition;
\`\`\`

## Filtering
| Operator | Example |
|---|---|
| =, !=, <, >, <=, >= | \`age > 18\` |
| BETWEEN | \`age BETWEEN 18 AND 30\` |
| LIKE | \`name LIKE 'J%'\` |
| IN | \`city IN ('London', 'NYC')\` |
| IS NULL | \`email IS NULL\` |
| AND / OR / NOT | \`age > 18 AND active = true\` |

## Sorting & Limiting
\`\`\`sql
ORDER BY price ASC   -- ascending (default)
ORDER BY price DESC  -- descending
LIMIT 10             -- first 10 rows
OFFSET 20            -- skip 20 rows (pagination)
\`\`\``,

  examples: `# SQL — Code Examples

## Find all active users over 25, sorted by name
\`\`\`sql
SELECT id, first_name, email
FROM users
WHERE age > 25 AND active = true
ORDER BY first_name ASC;
\`\`\`

## Get the 3 most expensive products
\`\`\`sql
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 3;
\`\`\`

## Update all out-of-stock items
\`\`\`sql
UPDATE products
SET status = 'unavailable'
WHERE stock_count = 0;
\`\`\``,

  revision: `# SQL Basics — Revision Notes

## Execution Order (Mental Model)
SQL executes in this logical order:
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

## NULL Handling
- NULL means "unknown" — not zero, not empty string
- \`NULL = NULL\` is FALSE! Use \`IS NULL\` / \`IS NOT NULL\`
- Any arithmetic with NULL gives NULL: \`5 + NULL = NULL\`

## LIKE Wildcards
- \`%\` matches any sequence of characters (including none)
- \`_\` matches exactly one character
- \`LIKE 'a_c'\` matches 'abc', 'arc', but not 'ac'`,

  flashcards: [
    { question: "What is the correct SQL syntax to get all rows from a 'products' table?", answer: "SELECT * FROM products;  The * means all columns." },
    { question: "What happens if you run UPDATE without a WHERE clause?", answer: "It updates ALL rows in the table! Always include a WHERE clause to target specific rows." },
    { question: "What does the LIKE operator with '%' wildcard do?", answer: "'%' matches any sequence of zero or more characters. 'name LIKE J%' matches anything starting with J — Java, JavaScript, John, etc." },
    { question: "How do you check if a column value is NULL in SQL?", answer: "Use 'IS NULL' or 'IS NOT NULL'. You cannot use '= NULL' because NULL represents unknown — comparing anything to NULL using = always returns NULL (not true/false)." }
  ],

  quiz: [
    { question: "Which SQL command removes all rows where status = 'inactive'?", options: ["REMOVE FROM users WHERE status='inactive'", "DELETE FROM users WHERE status='inactive'", "DROP users WHERE status='inactive'", "TRUNCATE users WHERE status='inactive'"], answerIndex: 1, explanation: "DELETE FROM is the correct command to remove specific rows. REMOVE doesn't exist. DROP removes the entire table. TRUNCATE removes all rows but doesn't support a WHERE clause." },
    { question: "How do you retrieve records where the name starts with 'Jo'?", options: ["WHERE name = 'Jo'", "WHERE name STARTS WITH 'Jo'", "WHERE name LIKE 'Jo%'", "WHERE name CONTAINS 'Jo'"], answerIndex: 2, explanation: "LIKE with the % wildcard matches patterns. 'Jo%' matches any string starting with 'Jo' — John, Jones, Joseph, etc." }
  ],

  interview: [
    { question: "What is the difference between DELETE, TRUNCATE, and DROP?", answer: "DELETE: removes specific rows with WHERE clause; can be rolled back; triggers fire; slow on large tables. TRUNCATE: removes all rows; faster (doesn't log individual rows); cannot be rolled back in some databases. DROP: removes the entire table structure AND data; irreversible." },
    { question: "What is SQL injection and how do you prevent it?", answer: "SQL injection is when a malicious user inputs SQL code as data (e.g., 'OR 1=1--' in a login field), causing unintended queries to run. Prevent it by using parameterized queries (prepared statements) instead of string concatenation to build SQL queries." }
  ]
});

// ── sql-joins ──────────────────────────────────────────────────────────────
writeContent('database', 1, 'chapter-1', 'sql-joins', {
  lesson: `# SQL Joins

## Learning Objectives
- Combine data from multiple tables using JOIN.
- Distinguish between INNER, LEFT, RIGHT, and FULL OUTER joins.
- Write multi-table queries for real-world scenarios.

---

## Why Joins?
Data in relational databases is split across multiple tables to avoid duplication. Joins let you combine related data from different tables into a single result.

---

## INNER JOIN — Only Matching Rows
Returns rows that have matching values in BOTH tables.

\`\`\`sql
SELECT orders.id, users.name, orders.total
FROM orders
INNER JOIN users ON orders.user_id = users.id;
-- Only returns orders that have a matching user
\`\`\`

---

## LEFT JOIN — All Left Rows + Matching Right
Returns ALL rows from the left table, and matched rows from the right. Non-matching right columns get NULL.

\`\`\`sql
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
-- Returns ALL users, including those with no orders (total will be NULL)
\`\`\`

---

## RIGHT JOIN — All Right Rows + Matching Left
Opposite of LEFT JOIN. Returns all rows from the right table.

---

## FULL OUTER JOIN — All Rows from Both
Returns all rows from both tables, with NULLs where there is no match.

---

## Venn Diagram Mental Model
\`\`\`
INNER JOIN:  A ∩ B (intersection only)
LEFT JOIN:   All of A + matched B
RIGHT JOIN:  All of B + matched A
FULL OUTER:  A ∪ B (everything)
\`\`\``,

  cheatsheet: `# SQL Joins Cheatsheet

## Syntax Template
\`\`\`sql
SELECT a.col, b.col
FROM tableA a
[INNER|LEFT|RIGHT|FULL OUTER] JOIN tableB b
ON a.foreign_key = b.primary_key
WHERE condition;
\`\`\`

## Join Types
| Type | Returns |
|---|---|
| INNER JOIN | Rows with matches in BOTH tables |
| LEFT JOIN | All left rows + matched right (NULL if no match) |
| RIGHT JOIN | All right rows + matched left (NULL if no match) |
| FULL OUTER JOIN | All rows from both, NULLs where no match |
| SELF JOIN | Table joined with itself |
| CROSS JOIN | Every row of A with every row of B (cartesian) |

## Aliasing Tables (Use for readability)
\`\`\`sql
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
\`\`\``,

  examples: `# SQL Joins — Examples

## Find all customers and their orders (including customers with no orders)
\`\`\`sql
SELECT c.name, o.order_date, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
ORDER BY c.name;
\`\`\`

## Find only customers who HAVE placed orders
\`\`\`sql
SELECT DISTINCT c.name
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
\`\`\`

## Three-table join: orders with customer name and product name
\`\`\`sql
SELECT c.name, p.name AS product, o.quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id;
\`\`\``,

  revision: `# SQL Joins — Revision Notes

## Most Common: LEFT JOIN
In practice, LEFT JOIN is used most often because you typically want all records from the primary table, even if there's no related data yet.

## Join on Multiple Columns
\`\`\`sql
JOIN table2 ON t1.col1 = t2.col1 AND t1.col2 = t2.col2
\`\`\`

## Find Rows with NO Match (Anti-join)
\`\`\`sql
-- Find customers with no orders
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
\`\`\`

## Self Join (e.g., employee-manager relationship)
\`\`\`sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
\`\`\``,

  flashcards: [
    { question: "What does an INNER JOIN return?", answer: "Only the rows that have matching values in BOTH joined tables. Rows from either table with no match in the other table are excluded." },
    { question: "What is the difference between LEFT JOIN and INNER JOIN?", answer: "INNER JOIN returns only matched rows from both tables. LEFT JOIN returns ALL rows from the left table plus any matching rows from the right — non-matching right rows appear as NULL." },
    { question: "How can you find all records in Table A that have NO match in Table B?", answer: "Use a LEFT JOIN and filter WHERE b.id IS NULL: SELECT * FROM A LEFT JOIN B ON A.id = B.a_id WHERE B.id IS NULL;" },
    { question: "What is a CROSS JOIN?", answer: "A CROSS JOIN (Cartesian product) returns every possible combination of rows from both tables. If A has 5 rows and B has 4 rows, you get 20 rows. Use with extreme caution." }
  ],

  quiz: [
    { question: "A LEFT JOIN between 'employees' and 'departments' will return:", options: ["Only employees with a department", "All employees, with NULL for department if unassigned", "All departments, with NULL for employee if empty", "All employees and all departments"], answerIndex: 1, explanation: "LEFT JOIN returns all rows from the LEFT table (employees) regardless of whether a match exists in the right table (departments). Unmatched department columns will be NULL." },
    { question: "Which join type returns all rows from both tables, with NULLs for non-matching rows?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answerIndex: 3, explanation: "FULL OUTER JOIN is the union of LEFT and RIGHT joins — it includes all rows from both tables, with NULLs where no match exists on either side." }
  ],

  interview: [
    { question: "What is the difference between INNER JOIN and LEFT JOIN? When would you use each?", answer: "INNER JOIN: use when you only want complete data (e.g., show orders WITH customer names — skip orders with no customer). LEFT JOIN: use when you want all records from the primary table regardless (e.g., show all customers and their orders, including customers who haven't ordered yet)." },
    { question: "Can you perform a join on more than two tables? How?", answer: "Yes. You chain multiple JOIN clauses. Each JOIN can use any join type independently. Example: FROM orders JOIN customers ON ... JOIN products ON ... JOIN categories ON ... Each join adds another table to the result set." }
  ]
});

// ── spring-boot-intro ──────────────────────────────────────────────────────
writeContent('backend', 1, 'chapter-1', 'spring-boot-intro', {
  lesson: `# Introduction to Spring Boot

## Learning Objectives
- Understand what Spring Boot is and its advantages over plain Spring.
- Create a Spring Boot project and run it.
- Understand auto-configuration and the starter dependency model.

---

## What is Spring Boot?
Spring Boot is an **opinionated, production-ready** framework built on top of the Spring Framework. It eliminates most of the boilerplate configuration that traditional Spring required.

**Without Spring Boot**: 100s of lines of XML configuration
**With Spring Boot**: Zero XML, runs in seconds

---

## Core Features

### 1. Auto-Configuration
Spring Boot automatically configures your application based on the dependencies you add. Add \`spring-boot-starter-web\` → it auto-configures an embedded Tomcat server, Spring MVC, and Jackson JSON.

### 2. Starter Dependencies
Curated dependency bundles — instead of figuring out 10 compatible libraries, add ONE starter:
\`\`\`xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
\`\`\`

### 3. Embedded Server
No need to deploy a WAR to external Tomcat. Spring Boot packages an embedded server and you run it as a plain Java application:
\`\`\`bash
java -jar myapp.jar
\`\`\`

---

## Your First Spring Boot App

\`\`\`java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot!";
    }
}
\`\`\`
Run it → visit \`http://localhost:8080/hello\` → see "Hello from Spring Boot!"`,

  cheatsheet: `# Spring Boot Cheatsheet

## Key Annotations
| Annotation | Purpose |
|---|---|
| \`@SpringBootApplication\` | Main class — combines @Configuration, @EnableAutoConfiguration, @ComponentScan |
| \`@RestController\` | HTTP controller returning data (not views) |
| \`@Controller\` | MVC controller returning view templates |
| \`@Service\` | Business logic layer |
| \`@Repository\` | Data access layer |
| \`@Component\` | Generic Spring-managed bean |
| \`@Autowired\` | Inject a dependency |
| \`@Value\` | Inject a property value |

## Request Mapping
\`\`\`java
@GetMapping("/path")     // GET
@PostMapping("/path")    // POST
@PutMapping("/path")     // PUT
@DeleteMapping("/path")  // DELETE
@RequestMapping("/path") // Any method
\`\`\`

## application.properties
\`\`\`properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost/mydb
spring.jpa.hibernate.ddl-auto=update
\`\`\``,

  examples: `# Spring Boot — Code Examples

## A simple REST endpoint
\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<String> getAll() {
        return List.of("Alice", "Bob", "Charlie");
    }

    @GetMapping("/{id}")
    public String getById(@PathVariable Long id) {
        return "User " + id;
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String name) {
        return ResponseEntity.status(201).body("Created: " + name);
    }
}
\`\`\``,

  revision: `# Spring Boot — Revision Notes

## @SpringBootApplication = 3 Annotations
- \`@SpringBootConfiguration\` — marks config class
- \`@EnableAutoConfiguration\` — enables auto-config
- \`@ComponentScan\` — scans current package for beans

## Common Starters
| Starter | Provides |
|---|---|
| spring-boot-starter-web | REST APIs, embedded Tomcat |
| spring-boot-starter-data-jpa | Hibernate, JPA repositories |
| spring-boot-starter-security | Spring Security |
| spring-boot-starter-test | JUnit 5, Mockito, AssertJ |

## Layers in a Spring Boot App
Controller → Service → Repository → Database`,

  flashcards: [
    { question: "What does @SpringBootApplication do?", answer: "It's a convenience annotation combining @SpringBootConfiguration, @EnableAutoConfiguration, and @ComponentScan. It marks the main class and triggers auto-configuration and component scanning." },
    { question: "What is auto-configuration in Spring Boot?", answer: "Spring Boot automatically configures beans based on the dependencies on your classpath. For example, adding spring-boot-starter-web automatically sets up an embedded Tomcat server and Spring MVC without any manual configuration." },
    { question: "What is the difference between @Controller and @RestController?", answer: "@Controller is used for web MVC apps returning HTML views. @RestController is a combination of @Controller and @ResponseBody — it returns data (JSON/XML) directly, not a view name." },
    { question: "How does Spring Boot differ from traditional Spring Framework?", answer: "Spring Framework requires extensive XML or Java configuration. Spring Boot provides auto-configuration, starter dependencies, an embedded server, and production-ready features out of the box — drastically reducing setup time." }
  ],

  quiz: [
    { question: "What does 'spring-boot-starter-web' provide?", options: ["Only Spring MVC", "Embedded Tomcat, Spring MVC, and Jackson JSON support", "JSP template support only", "WebSocket support only"], answerIndex: 1, explanation: "The web starter bundles an embedded Tomcat server, Spring MVC for REST endpoints, and Jackson for JSON serialization/deserialization — everything you need for a REST API." },
    { question: "What port does Spring Boot use by default?", options: ["3000", "8000", "8080", "443"], answerIndex: 2, explanation: "Spring Boot starts on port 8080 by default. You can change it with 'server.port=9090' in application.properties." }
  ],

  interview: [
    { question: "What is the difference between @Component, @Service, and @Repository?", answer: "All three are Spring stereotypes that register a class as a bean. @Component is generic. @Service marks business logic — semantically meaningful for readability. @Repository marks the data access layer and has an extra feature: it translates database-specific exceptions into Spring's DataAccessException hierarchy." },
    { question: "How does Spring Boot's auto-configuration work internally?", answer: "Spring Boot scans META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports in each starter JAR. Each listed class is a @Configuration class with @ConditionalOn... annotations — they only activate when certain conditions are met (e.g., a class is on the classpath, a property is set). This conditional loading is what makes auto-configuration non-invasive." }
  ]
});

// ── react-hooks ────────────────────────────────────────────────────────────
writeContent('frontend', 2, 'chapter-1', 'react-hooks', {
  lesson: `# React Hooks

## Learning Objectives
- Manage component state using useState.
- Run side effects with useEffect.
- Share state without prop drilling using useContext.

---

## What are Hooks?
Hooks are functions that let you "hook into" React state and lifecycle features from **function components**. Before Hooks (React 16.8), only class components could have state.

---

## useState — Managing State
\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0); // initial value = 0

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <button onClick={() => setCount(c => c - 1)}>-1</button>
        </div>
    );
}
\`\`\`

> [!IMPORTANT]
> Never mutate state directly: \`count++\` won't trigger re-render. Always use the setter function.

---

## useEffect — Side Effects
\`\`\`jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Runs after render when userId changes
        fetch(\`/api/users/\${userId}\`)
            .then(r => r.json())
            .then(data => setUser(data));

        // Cleanup function (runs before next effect / unmount)
        return () => console.log('cleanup');
    }, [userId]); // dependency array: re-run when userId changes

    return <div>{user ? user.name : 'Loading...'}</div>;
}
\`\`\`

**Dependency Array Rules:**
- \`[]\` — run once after first render (like componentDidMount)
- \`[dep1, dep2]\` — re-run when deps change
- No array — run after every render

---

## useRef — Persistent Value / DOM Access
\`\`\`jsx
const inputRef = useRef(null);

// Access DOM element
<input ref={inputRef} />
<button onClick={() => inputRef.current.focus()}>Focus</button>
\`\`\``,

  cheatsheet: `# React Hooks Cheatsheet

## useState
\`\`\`jsx
const [state, setState] = useState(initialValue);
setState(newValue);
setState(prev => prev + 1); // functional update
\`\`\`

## useEffect
\`\`\`jsx
useEffect(() => { /* effect */ }, [dependencies]);
useEffect(() => { /* once */ }, []);          // mount only
useEffect(() => { /* always */ });            // every render
useEffect(() => { return () => { /* cleanup */ }; }, [dep]);
\`\`\`

## useContext
\`\`\`jsx
const ThemeContext = createContext('light');
const theme = useContext(ThemeContext); // in consumer
\`\`\`

## useRef
\`\`\`jsx
const ref = useRef(null); // ref.current = null
// Does NOT trigger re-render when changed
\`\`\`

## Rules of Hooks
1. Only call Hooks at the **top level** (not in if/loops)
2. Only call Hooks in **React function components** or custom hooks`,

  examples: `# React Hooks — Examples

## useEffect for API calls + cleanup
\`\`\`jsx
function SearchResults({ query }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        const controller = new AbortController();

        fetch(\`/api/search?q=\${query}\`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => { setResults(data); setLoading(false); })
            .catch(() => setLoading(false));

        return () => controller.abort(); // cleanup: cancel previous request
    }, [query]);

    if (loading) return <p>Searching...</p>;
    return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
\`\`\``,

  revision: `# React Hooks — Revision Notes

## Why Functional Update?
\`setState(prev => prev + 1)\` is safer than \`setState(count + 1)\` when updates are batched or asynchronous. Use functional updates whenever the new state depends on the previous state.

## useEffect Cleanup is Critical
Without cleanup, subscriptions, timers, and fetch calls can cause memory leaks if the component unmounts before they complete.

## Common Hook Mistakes
1. Missing dependency in useEffect array → stale closures
2. Creating objects/arrays in dependency array → infinite re-renders
3. Setting state inside useEffect without a condition → infinite loop`,

  flashcards: [
    { question: "What does the dependency array in useEffect control?", answer: "It controls when the effect re-runs. Empty array [] = run once on mount. Array with values = re-run when any value changes. No array = run after every render." },
    { question: "Why should you never mutate state directly in React?", answer: "React tracks state changes through the setter function. Directly mutating state (e.g., state.push() or count++) doesn't notify React, so the component won't re-render and the UI won't update." },
    { question: "What is the difference between useRef and useState?", answer: "useState triggers a re-render when changed. useRef stores a mutable value that persists across renders without causing a re-render. useRef is also used to directly access DOM elements." },
    { question: "What are the two Rules of Hooks?", answer: "1) Only call Hooks at the top level (not inside if statements, loops, or nested functions). 2) Only call Hooks from React function components or custom Hooks." }
  ],

  quiz: [
    { question: "What will useEffect(() => { fetchData(); }, []) do?", options: ["Run after every render", "Run only once after the first render", "Run before every render", "Never run"], answerIndex: 1, explanation: "An empty dependency array [] means 'no dependencies changed' — so the effect only runs once after the initial mount, equivalent to componentDidMount in class components." },
    { question: "How should you update state when the new value depends on the old value?", options: ["setState(state + 1)", "setState(prev => prev + 1)", "state = state + 1", "setState({ value: state + 1 })"], answerIndex: 1, explanation: "Using the functional form setState(prev => prev + 1) ensures you always work with the latest state, especially in async situations or batched updates." }
  ],

  interview: [
    { question: "What is a custom Hook and when would you create one?", answer: "A custom Hook is a function starting with 'use' that calls other Hooks. Create one to extract and reuse stateful logic across multiple components. Example: useFetch(url) encapsulates fetch logic, loading state, and error handling so any component can reuse it without duplicating code." },
    { question: "What is a stale closure in the context of React hooks?", answer: "A stale closure happens when a useEffect callback captures an old value of a state or prop because it was closed over when the effect was created. If you use a state variable inside useEffect but don't include it in the dependency array, the effect always 'sees' the old value from when it was defined." }
  ]
});

console.log('\n✅ All real content written successfully!');
