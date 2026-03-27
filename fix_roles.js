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
      
      const searchStr = "if (profile?.role !== 'admin')";
      const replaceStr = "if ((profile as any)?.role !== 'admin')";
      
      if (content.includes(searchStr)) {
        content = content.replace(new RegExp("if \\(profile\\?\\.role !== 'admin'\\)", 'g'), replaceStr);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done fixing profile role checks.');
