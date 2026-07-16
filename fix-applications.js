const fs = require('fs');

const file = 'src/app/(dashboard)/applications/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getApplications } from "@/actions/applications";\nimport { Loader2 } from "lucide-react";`);

// 2. Remove demo data array
content = content.replace(/\/\/ Demo data\nconst demoApplications = \[[\s\S]*?\];\n/, '');

// 3. Update the component to use query
const queryHook = `
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getApplications(),
  });
`;

content = content.replace(
  'const applications = demoApplications;',
  queryHook
);

// 4. Update JSX to show loader
content = content.replace(
  '{filtered.length === 0 ? (',
  `{isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (`
);

// Close the ternary
content = content.replace(
  '          </AnimatePresence>\n        )}',
  '          </AnimatePresence>\n        )}'
); // Actually let's just make sure we close the isLoading properly

fs.writeFileSync(file, content);
console.log('Done');
