const fs = require('fs');

const file = 'src/app/(dashboard)/templates/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getTemplates } from "@/actions/templates";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoTemplates = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => getTemplates(),
  });
`;

content = content.replace(
  'const [selectedTemplate, setSelectedTemplate] = useState<typeof demoTemplates[0] | null>(null);',
  `const [selectedTemplate, setSelectedTemplate] = useState<any>(null);\n${queryHook}`
);

content = content.replace(/demoTemplates/g, 'templates');

content = content.replace(
  '{filtered.length === 0 ? (',
  `{isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (`
);

content = content.replace(/\{template\.usageCount\}/g, '0'); // mock usage count

fs.writeFileSync(file, content);
console.log('Done');
