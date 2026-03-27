const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace symbols
  content = content.replace(/£/g, '₹');
  content = content.replace(/\bGBP\b/g, 'INR');
  content = content.replace(/\bgbp\b/g, 'inr');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

const dir = path.join(__dirname, 'src');
console.log('Starting symbol replacement in:', dir);
processDirectory(dir);
console.log('Done.');
