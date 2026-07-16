const fs = require('fs');

const file = 'src/app/(dashboard)/follow-ups/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the demo arrays
content = content.replace(/const todayFollowUps = \[[\s\S]*?\];\n\n/g, '');
content = content.replace(/const overdueFollowUps = \[[\s\S]*?\];\n\n/g, '');
content = content.replace(/const upcomingFollowUps = \[[\s\S]*?\];\n\n/g, '');

// 2. Change FollowUpItem props type to any for simplicity here since it receives Prisma objects now
content = content.replace(
  '  item: { id: string; name: string; company: string; role: string; type: string; sentDate?: string; dueDate?: string; daysOverdue?: number };',
  '  item: any;'
);

// 3. Instead of defining todayFollowUps etc statically, compute them from `allEmails`
// The useQuery hook is already at the top of FollowUpsPage from our previous script.
// Wait, the previous script injected it, but didn't remove todayFollowUps.
content = content.replace(
  '  const followUps = allEmails.filter(e => e.status === "SENT" && e.followUpDate);',
  `
  const followUps = allEmails.filter((e: any) => e.status === "SENT" && e.followUpDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const todayFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() === today);
  const overdueFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() < today);
  const upcomingFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() > today);
  `
);

fs.writeFileSync(file, content);
console.log('Done proper');
