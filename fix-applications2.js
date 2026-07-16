const fs = require('fs');

const file = 'src/app/(dashboard)/applications/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix app.company.logo
content = content.replace(/app\.company\.logo/g, 'app.company?.logo');

// Fix app.company.name
content = content.replace(/app\.company\.name/g, 'app.company?.name');

// Fix appliedDate which might be a Date object instead of a string in Prisma
// We need to format the Date or it'll throw in React.
// Let's replace {app.appliedDate} with {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Not applied yet"}
content = content.replace(/\{app\.appliedDate\}/g, '{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Not applied yet"}');

fs.writeFileSync(file, content);
console.log('Done');
