const fs = require('fs');
const file = 'src/app/(dashboard)/follow-ups/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const hook = `
  const { data: allEmails = [], isLoading } = useQuery({
    queryKey: ["cold-emails"],
    queryFn: () => getColdEmails(),
  });

  const followUps = allEmails.filter((e: any) => e.status === "SENT" && e.followUpDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const todayFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() === today);
  const overdueFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() < today);
  const upcomingFollowUps = followUps.filter((e: any) => new Date(e.followUpDate).getTime() > today);
`;

// Insert right after FollowUpsPage {
content = content.replace('export default function FollowUpsPage() {', 'export default function FollowUpsPage() {\n' + hook);

fs.writeFileSync(file, content);
