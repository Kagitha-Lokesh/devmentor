const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..'); // Run from scripts dir or root, let's run from root
// I'll assume we run from the project root

const excludeDirs = ['node_modules', '.git', 'dist', 'public/generated'];
const includeExts = ['.js', '.jsx', '.json', '.html', '.md', '.yml', '.css', '.spec.js'];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        processDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (includeExts.includes(ext) || file === 'package.json') {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Perform replacements
        const originalContent = content;
        content = content.replace(/DevMentor AI/g, 'JavaMentor');
        content = content.replace(/DevMentor/g, 'JavaMentor');
        content = content.replace(/devmentor-ai/g, 'javamentor');
        content = content.replace(/devmentor/g, 'javamentor');

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  });
}

console.log('Starting rename...');
processDirectory(__dirname);
console.log('Rename complete.');
