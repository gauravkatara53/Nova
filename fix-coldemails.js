const fs = require('fs');

const file = 'src/app/(dashboard)/cold-emails/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getColdEmails } from "@/actions/cold-emails";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoEmails = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["cold-emails"],
    queryFn: () => getColdEmails(),
  });
`;

content = content.replace(
  'const emails = demoEmails;',
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

content = content.replace(/email\.company\.name/g, 'email.company?.name || ""');
content = content.replace(/email\.company\.logo/g, 'email.company?.logo || ""');
// sentDate / followUpDate are Date objects in Prisma, string in demo data.
content = content.replace(/\{email\.sentDate\}/g, '{email.sentDate ? new Date(email.sentDate).toLocaleDateString() : ""}');
content = content.replace(/\{email\.followUpDate\}/g, '{email.followUpDate ? new Date(email.followUpDate).toLocaleDateString() : ""}');

fs.writeFileSync(file, content);
console.log('Done');
