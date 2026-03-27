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
      
      // We will replace .single(); with .single() as any;
      // Also .single(), with .single() as any,
      // This solves the 'never' type inference issue
      const original = content;
      content = content.replace(/\.single\(\);/g, '.single() as any;');
      content = content.replace(/\.single\(\),/g, '.single() as any,');
      
      // For cases where it's just .single() without a semicolon or comma
      // e.g. return await Object.single()
      // But let's be careful not to double add
      content = content.replace(/\.single\(\)(?! as any)([^;,\w])/g, '.single() as any$1');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Added as any to:', fullPath);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing .single() types.');
