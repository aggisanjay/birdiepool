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
      
      ['map', 'find', 'filter', 'some', 'every'].forEach(method => {
        // .(method)((item) =>
        content = content.replace(new RegExp(`\\.${method}\\(\\(\\s*([a-zA-Z0-9_]+)\\s*\\)\\s*=>`, 'g'), `.${method}(( $1: any ) =>`);
        
        // .(method)(item =>
        content = content.replace(new RegExp(`\\.${method}\\(\\s*([a-zA-Z0-9_]+)\\s*=>`, 'g'), `.${method}(( $1: any ) =>`);
        
        // .(method)((item, index) =>
        content = content.replace(new RegExp(`\\.${method}\\(\\(\\s*([a-zA-Z0-9_]+)\\s*,\\s*([a-zA-Z0-9_]+)\\s*\\)\\s*=>`, 'g'), `.${method}(( $1: any, $2: number ) =>`);
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed array method in:', fullPath);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing array type inference.');
