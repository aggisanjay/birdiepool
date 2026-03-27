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

      // Match const { data: var } = await client.from('table')...
      // And append ' as any' if not present
      const regex = /const\s+\{\s*data:\s*([a-zA-Z0-9_]+)\s*\}\s*=\s*await\s+([^;]+)\.(from|rpc)\(([\s\S]*?)\)(?!\s+as\s+any)/g;
      
      content = content.replace(regex, (match, variable, clientPrefix, method, args) => {
        const fixed = `const { data: ${variable} } = await ${clientPrefix}.${method}(${args}) as any`;
        console.log(`[FIXED] ${fullPath}: ${match.trim()} -> ${fixed}`);
        return fixed;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing data extractions.');
