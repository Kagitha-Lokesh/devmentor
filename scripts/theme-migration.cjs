const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Comprehensive mapping from hardcoded to semantic
const classMappings = [
  // Backgrounds
  { regex: /\bbg-(black|white)\b/g, replacement: 'bg-background' },
  { regex: /\bbg-(gray|slate|zinc|neutral|stone)-(950|900|850)\b/g, replacement: 'bg-surface' },
  { regex: /\bbg-(gray|slate|zinc|neutral|stone)-(800|700)\b/g, replacement: 'bg-surface-secondary' },
  { regex: /\bbg-(gray|slate|zinc|neutral|stone)-(600|500)\b/g, replacement: 'bg-surface-tertiary' },
  { regex: /\bbg-(gray|slate|zinc|neutral|stone)-(400|300|200|100|50)\b/g, replacement: 'bg-surface' },
  
  // Text Colors
  { regex: /\btext-(white|black)\b/g, replacement: 'text-primary' },
  { regex: /\btext-(gray|slate|zinc|neutral|stone)-(950|900|850|800)\b/g, replacement: 'text-primary' },
  { regex: /\btext-(gray|slate|zinc|neutral|stone)-(700|600)\b/g, replacement: 'text-secondary' },
  { regex: /\btext-(gray|slate|zinc|neutral|stone)-(500|400)\b/g, replacement: 'text-muted' },
  { regex: /\btext-(gray|slate|zinc|neutral|stone)-(300|200|100|50)\b/g, replacement: 'text-primary' },

  // Borders
  { regex: /\bborder-(white|black)\b/g, replacement: 'border-default' },
  { regex: /\bborder-(gray|slate|zinc|neutral|stone)-(950|900|850)\b/g, replacement: 'border-default' },
  { regex: /\bborder-(gray|slate|zinc|neutral|stone)-(800|700)\b/g, replacement: 'border-default' },
  { regex: /\bborder-(gray|slate|zinc|neutral|stone)-(600|500|400|300|200|100|50)\b/g, replacement: 'border-muted' },

  // Rings
  { regex: /\bring-(white|black|gray|slate|zinc|neutral|stone)-\d+\b/g, replacement: 'ring-border-active' },

  // Fills & Strokes
  { regex: /\bfill-(gray|slate|zinc|neutral|stone)-\d+\b/g, replacement: 'fill-current' },
  { regex: /\bstroke-(gray|slate|zinc|neutral|stone)-\d+\b/g, replacement: 'stroke-current' },

  // Specific HEX/RGB in inline styles (crude but catches common ones)
  { regex: /color:\s*['"]#(fff|ffffff|000|000000)['"]/gi, replacement: 'color: "var(--color-text-primary)"' },
  { regex: /background(?:Color)?:\s*['"]#(fff|ffffff|000|000000)['"]/gi, replacement: 'background: "var(--color-background)"' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      classMappings.forEach(mapping => {
        if (mapping.regex.test(content)) {
          content = content.replace(mapping.regex, mapping.replacement);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

console.log('Starting theme migration...');
processDirectory(srcDir);
console.log('Migration complete.');
