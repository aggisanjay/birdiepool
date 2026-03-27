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

      // Using regex with 'g' flag for broader compatibility than replaceAll
      const pattern = /charities:selected_charity_id/g;
      if (pattern.test(content)) {
        content = content.replace(pattern, 'charities:charities');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] Relationship syntax in: ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing relationship syntax.');
