const fs = require('fs');

function fixFile(file, queryName, actionFn) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useQuery')) {
    console.log("File already has useQuery... Wait, it doesn't? No, the import was added, but hook wasn't.");
  }

  // Find "const filtered ="
  const hook = `
  const { data: ${queryName} = [], isLoading } = useQuery({
    queryKey: ["${queryName}"],
    queryFn: () => ${actionFn}(),
  });
`;

  content = content.replace(
    '  const filtered = ',
    hook + '\n  const filtered = '
  );
  fs.writeFileSync(file, content);
}

fixFile('src/app/(dashboard)/cold-emails/page.tsx', 'emails', 'getColdEmails');
fixFile('src/app/(dashboard)/contacts/page.tsx', 'contacts', 'getContacts');
fixFile('src/app/(dashboard)/companies/page.tsx', 'companies', 'getCompanies');

console.log('Done');
