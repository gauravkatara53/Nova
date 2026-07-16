const fs = require('fs');

const file = 'src/app/(dashboard)/companies/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getCompanies } from "@/actions/companies";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoCompanies = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });
`;

content = content.replace(
  'const companies = demoCompanies;',
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

// We might need to change c.metrics.applications to c._count.applications if prisma relation count is used.
// Let's check getCompanies in src/actions/companies.ts
fs.writeFileSync(file, content);
console.log('Done');
