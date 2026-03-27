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

      // Replaces charities:selected_charity_id with charities:charities
      // This is because selected_charity_id is the column name, but charities is the table/relationship name.
      content = content.replaceAll('charities:selected_charity_id', 'charities:charities');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] Relationship syntax in: ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing relationship syntax.');
