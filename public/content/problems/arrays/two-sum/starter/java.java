import java.util.*;
import java.io.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // TODO: Implement an O(N) time complexity solution using a HashMap
        return new int[]{0, 0};
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        if (line1 == null) return;
        
        String[] parts = line1.trim().split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        String line2 = br.readLine();
        if (line2 == null) return;
        int target = Integer.parseInt(line2.trim());
        
        int[] result = twoSum(nums, target);
        // Print result, e.g. [0, 1]
        System.out.println(Arrays.toString(result).replace(" ", ""));
    }
}
