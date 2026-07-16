const fs = require('fs');

function fix(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// cold-emails
fix('src/app/(dashboard)/cold-emails/page.tsx', /email\.subject\.toLowerCase/g, '(email.subject || "").toLowerCase');
fix('src/app/(dashboard)/cold-emails/page.tsx', /\{email\.subject\}/g, '{email.subject || "No Subject"}');
fix('src/app/(dashboard)/cold-emails/page.tsx', /\{email\.role\}/g, '{email.role || "No Role"}');

// contacts
fix('src/app/(dashboard)/contacts/page.tsx', /contact\.role\.toLowerCase/g, '(contact.role || "").toLowerCase');
fix('src/app/(dashboard)/contacts/page.tsx', /\{contact\.role\}/g, '{contact.role || "No Role"}');

// companies
// Fix company industry
fix('src/app/(dashboard)/companies/page.tsx', /company\.industry\.toLowerCase/g, '(company.industry || "").toLowerCase');
fix('src/app/(dashboard)/companies/page.tsx', /\{company\.industry\}/g, '{company.industry || "No Industry"}');
// fix c._count in companies to allow for empty
fix('src/app/(dashboard)/companies/page.tsx', /c\._count\.applications/g, '(c._count?.applications || 0)');
fix('src/app/(dashboard)/companies/page.tsx', /c\._count\.contacts/g, '(c._count?.contacts || 0)');
fix('src/app/(dashboard)/companies/page.tsx', /c\._count\.coldEmails/g, '(c._count?.coldEmails || 0)');

console.log('Done nulls');
