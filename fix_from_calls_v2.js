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

      // Replaces client.from('table') with client.from('table') as any
      content = content.replace(/([a-zA-Z0-9_]+)\.from\(['"]([^'"]+)['"]\)(?!\s*as\s+any)/g, (match, client, table) => {
        if (client === 'Array') return match;
        return `${client}.from('${table}') as any`;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing from calls.');
