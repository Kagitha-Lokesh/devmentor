const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const forbiddenPatterns = [
  { regex: /\bbg-(black|white)\b/, message: "Do not use 'bg-black' or 'bg-white'." },
  { regex: /\bbg-(gray|slate|zinc|neutral|stone)-\d+\b/, message: "Do not use hardcoded gray background shades." },
  { regex: /\btext-(white|black)\b/, message: "Do not use 'text-white' or 'text-black'." },
  { regex: /\btext-(gray|slate|zinc|neutral|stone)-\d+\b/, message: "Do not use hardcoded gray text shades." },
  { regex: /\bborder-(white|black|gray|slate|zinc|neutral|stone)-\d*\b/, message: "Do not use hardcoded border colors." },
  { regex: /\bstyle=\{\{.*?color:\s*['"]#.*?['"].*?\}\}/, message: "Do not use hardcoded inline styles for colors." },
  { regex: /\bstyle=\{\{.*?background(Color)?:\s*['"]#.*?['"].*?\}\}/, message: "Do not use hardcoded inline styles for background colors." },
];

let hasErrors = false;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        forbiddenPatterns.forEach(pattern => {
          if (pattern.regex.test(line)) {
            console.error(`Theme Lint Error in ${fullPath}:${index + 1}`);
            console.error(`  Line: ${line.trim()}`);
            console.error(`  Reason: ${pattern.message}\n`);
            hasErrors = true;
          }
        });
      });
    }
  });
}

console.log('Running Theme Linter...');
processDirectory(srcDir);

if (hasErrors) {
  console.error('Theme Linter failed! Please use semantic theme tokens instead of hardcoded colors.');
  process.exit(1);
} else {
  console.log('Theme Linter passed! No hardcoded colors found.');
  process.exit(0);
}
