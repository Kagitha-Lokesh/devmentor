const fs = require('fs');

function twoSum(nums, target) {
    // TODO: Implement an O(N) time complexity solution using a Map
    return [0, 0];
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\n');
    if (input.length < 2) return;
    
    const nums = input[0].trim().split(',').map(Number);
    const target = Number(input[1].trim());
    
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
}

main();
