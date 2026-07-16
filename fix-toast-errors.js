const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx')) {
      callback(p);
    }
  });
}

walk('./src/app', (p) => {
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;

  // Single line: onError: (error: any) => toast.error(error.message || "Failed...")
  const singleLineRegex = /onError:\s*\([^)]*\)\s*=>\s*toast\.error\(\s*(?:error(?:\.message)?\s*(?:\|\||\?)\s*)?("[^"]+")\s*\)/g;
  if (singleLineRegex.test(content)) {
    content = content.replace(singleLineRegex, 'onError: (error: any) => {\n      console.error(error);\n      toast.error($1);\n    }');
    changed = true;
  }

  // Block line: toast.error(error.message || "Failed...");
  const blockRegex = /toast\.error\(\s*(?:error(?:\.message)?\s*(?:\|\||\?)\s*)?("[^"]+")\s*\)/g;
  if (blockRegex.test(content)) {
    content = content.replace(blockRegex, (match, p1) => {
        // if the match actually contains error.message, we add console.error
        if (match.includes('error')) {
            return `console.error(error);\n      toast.error(${p1})`;
        }
        return match;
    });
    changed = true;
  }
  
  // Specific one in resumes/page.tsx: toast.error(error instanceof Error ? error.message : "Failed...")
  const instanceOfRegex = /toast\.error\(\s*error\s+instanceof\s+Error\s*\?\s*error\.message\s*:\s*("[^"]+")\s*\)/g;
  if (instanceOfRegex.test(content)) {
    content = content.replace(instanceOfRegex, 'console.error(error);\n      toast.error($1)');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, content);
    console.log(`Updated ${p}`);
  }
});
