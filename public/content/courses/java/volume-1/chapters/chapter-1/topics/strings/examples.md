# Strings — Code Examples

## Example 1: Count vowels in a string
```java
String word = "Programming";
int count = 0;
for (char c : word.toLowerCase().toCharArray()) {
    if ("aeiou".indexOf(c) != -1) count++;
}
System.out.println("Vowels: " + count); // 3
```

## Example 2: Reverse a string using StringBuilder
```java
String original = "DevMentor";
String reversed = new StringBuilder(original).reverse().toString();
System.out.println(reversed); // rotneMyeD
```

## Example 3: Check if a string is a palindrome
```java
String s = "racecar";
String reversed = new StringBuilder(s).reverse().toString();
System.out.println(s.equals(reversed)); // true
```