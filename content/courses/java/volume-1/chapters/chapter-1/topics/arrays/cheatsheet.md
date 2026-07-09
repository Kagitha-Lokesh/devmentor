# Arrays Cheatsheet

## Declaration
```java
type[] name = new type[size];
type[] name = {val1, val2, val3};
```

## Key Properties
- `arr.length` → number of elements
- Index starts at **0**, ends at **length - 1**
- Fixed size after creation

## Sorting & Searching
```java
Arrays.sort(arr);                   // sort ascending
int idx = Arrays.binarySearch(arr, key); // must be sorted first
```

## Copying
```java
int[] copy = Arrays.copyOf(arr, newLen);
int[] range = Arrays.copyOfRange(arr, from, to);
```

## Common Mistakes
- `arr.length();` → WRONG (no parentheses!)
- `arr[arr.length]` → ArrayIndexOutOfBoundsException