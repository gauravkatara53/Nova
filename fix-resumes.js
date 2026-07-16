const fs = require('fs');

const file = 'src/app/(dashboard)/resumes/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getResumes } from "@/actions/resumes";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoResumes = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumes(),
  });
`;

// It uses demoResumes inside JSX like demoResumes.length and demoResumes.map
content = content.replace(/demoResumes/g, 'resumes');

content = content.replace(
  'const [resumes, setResumes] = useState<typeof demoResumes>(demoResumes);',
  queryHook
);

content = content.replace(
  '{resumes.length === 0 ? (',
  `{isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : resumes.length === 0 ? (`
);

content = content.replace(/\{resume\.lastUpdated\}/g, '{new Date(resume.updatedAt).toLocaleDateString()}');
content = content.replace(/resume\.matchRate/g, '85'); // mock matchRate since it's not in schema

fs.writeFileSync(file, content);
console.log('Done');
