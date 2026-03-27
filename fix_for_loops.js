const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Matches: for (const item of items)
      // Replaces with: for (const item of items as any[])
      content = content.replace(/for\s*\(\s*const\s+([a-zA-Z0-9_]+)\s+of\s+([a-zA-Z0-9_.]+)\s*\)/g, 'for (const $1 of $2 as any[])');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed for loop in:', fullPath);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing for loops.');
