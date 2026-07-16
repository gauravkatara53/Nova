const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(process.cwd(), 'src'), function(file) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<DropdownMenuTrigger asChild>')) {
      content = content.replace(/<DropdownMenuTrigger asChild>\s*([\s\S]*?)<\/DropdownMenuTrigger>/g, (match, p1) => {
        return `<DropdownMenuTrigger render={${p1.trim()}} />`;
      });
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file);
    }
  }
});
