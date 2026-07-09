# Arrays — Revision Notes

## Must-Know Facts
- Arrays are **objects** in Java stored on the **Heap**
- The variable holds a **reference** to the array object
- Default values: `int[]` → 0, `boolean[]` → false, `String[]` → null
- `ArrayIndexOutOfBoundsException` → accessing index < 0 or >= length

## java.util.Arrays Utility Methods
- `Arrays.sort(arr)` — O(n log n) dual-pivot quicksort
- `Arrays.toString(arr)` — readable string for printing
- `Arrays.equals(a, b)` — deep element comparison
- `Arrays.fill(arr, val)` — fill all elements with a value