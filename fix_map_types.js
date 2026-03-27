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
      // .map((item) =>
      content = content.replace(/\.map\(\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g, '.map(( $1: any ) =>');
      
      // .map(item =>
      content = content.replace(/\.map\(\s*([a-zA-Z0-9_]+)\s*=>/g, '.map(( $1: any ) =>');

      // .map((item, index) =>
      content = content.replace(/\.map\(\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g, '.map(( $1: any, $2: number ) =>');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed map in:', fullPath);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing .map() types.');
