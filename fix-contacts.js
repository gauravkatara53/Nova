const fs = require('fs');

const file = 'src/app/(dashboard)/contacts/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getContacts } from "@/actions/contacts";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoContacts = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });
`;

content = content.replace(
  'const contacts = demoContacts;',
  queryHook
);

content = content.replace(
  '{filtered.length === 0 ? (',
  `{isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (`
);

content = content.replace(/contact\.company\.name/g, 'contact.company?.name || ""');
content = content.replace(/contact\.company\.logo/g, 'contact.company?.logo || ""');
content = content.replace(/\{contact\.lastContactDate\}/g, '{contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : ""}');

fs.writeFileSync(file, content);
console.log('Done');
