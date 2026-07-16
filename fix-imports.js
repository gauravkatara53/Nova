const fs = require('fs');
const file = 'src/app/(dashboard)/follow-ups/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { useQuery } from "@tanstack/react-query";\nimport { getColdEmails } from "@/actions/cold-emails";');

fs.writeFileSync(file, content);
