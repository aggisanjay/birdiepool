const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  console.log(`Checking directory: ${dir}`);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // for (const s of allScores) -> for (const s of allScores as any[])
      // Regex: for\s*\(\s*const\s+([a-zA-Z0-9_]+)\s+of\s+([a-zA-Z0-9_.]+)\s*\)
      const regex = /for\s*\(\s*const\s+([a-zA-Z0-9_]+)\s+of\s+([a-zA-Z0-9_.]+)\s*\)/g;
      if (regex.test(content)) {
        content = content.replace(regex, 'for (const $1 of $2 as any[])');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] for-loop in: ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing for loops.');
