# Arrays — Code Examples

## Example 1: Find maximum value
```java
int[] scores = {45, 82, 67, 91, 38};
int max = scores[0];
for (int i = 1; i < scores.length; i++) {
    if (scores[i] > max) max = scores[i];
}
System.out.println("Max: " + max); // 91
```

## Example 2: Reverse an array in-place
```java
int[] arr = {1, 2, 3, 4, 5};
int left = 0, right = arr.length - 1;
while (left < right) {
    int temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++; right--;
}
// arr is now {5, 4, 3, 2, 1}
```