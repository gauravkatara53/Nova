const fs = require('fs');

const file = 'src/app/(dashboard)/follow-ups/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', `import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getColdEmails } from "@/actions/cold-emails";\nimport { Loader2 } from "lucide-react";`);
content = content.replace(/\/\/ Demo data\nconst demoFollowUps = \[[\s\S]*?\];\n/, '');

const queryHook = `
  const { data: allEmails = [], isLoading } = useQuery({
    queryKey: ["cold-emails"],
    queryFn: () => getColdEmails(),
  });

  // Filter only emails that need follow-up
  const followUps = allEmails.filter(e => e.status === "SENT" && e.followUpDate);
`;

content = content.replace(
  'const followUps = demoFollowUps;',
  queryHook
);

content = content.replace(
  '{todayFollowUps.length === 0 ? (',
  `{isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : todayFollowUps.length === 0 ? (`
);

content = content.replace(
  '{overdueFollowUps.length === 0 ? (',
  `{isLoading ? null : overdueFollowUps.length === 0 ? (`
);

content = content.replace(
  '{upcomingFollowUps.length === 0 ? (',
  `{isLoading ? null : upcomingFollowUps.length === 0 ? (`
);

// We need to fix the map since the schema for coldEmails has recipientName, role, company (which is relation)
content = content.replace(/item\.company/g, '(item.company?.name || "")');
content = content.replace(/item\.name/g, 'item.recipientName');
content = content.replace(/\{item\.dueDate\}/g, '{item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : ""}');

fs.writeFileSync(file, content);
console.log('Done');
