import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found in the database. Please sign in to create a user first.");
    process.exit(1);
  }

  const user = users[0];
  console.log(`Using user ID: ${user.id} (${user.email})`);

  const sampleData = [
    {
      recipientName: "Alice Smith",
      recipientEmail: "alice@techcorp.com",
      companyName: "TechCorp",
      role: "Engineering Manager",
      category: "COLD_OUTREACH",
      subject: "Connecting regarding frontend roles",
      body: "Hi Alice,\n\nI noticed TechCorp is doing some great work in the AI space...",
      status: "SENT",
      priority: "HIGH",
      sentDate: new Date("2026-07-01"),
      followUpDate: new Date("2026-07-05"),
    },
    {
      recipientName: "Bob Jones",
      recipientEmail: "bob.jones@startup.io",
      companyName: "Startup.io",
      role: "CTO",
      category: "NETWORKING",
      subject: "Would love to chat about your recent funding round",
      body: "Hey Bob,\n\nCongrats on the Series A...",
      status: "REPLIED",
      priority: "MEDIUM",
      sentDate: new Date("2026-06-25"),
      followUpDate: null,
    },
    {
      recipientName: "Charlie Brown",
      recipientEmail: "cbrown@enterprise.com",
      companyName: "Enterprise Inc",
      role: "VP of Engineering",
      category: "REFERRAL_REQUEST",
      subject: "Referral for Senior SWE role",
      body: "Hi Charlie,\n\nHope you're doing well...",
      status: "DRAFT",
      priority: "LOW",
      sentDate: null,
      followUpDate: null,
    },
    {
      recipientName: "Diana Prince",
      recipientEmail: "diana@amazon.com",
      companyName: "Amazon",
      role: "Technical Recruiter",
      category: "RECRUITER",
      subject: "Application for SDE II",
      body: "Hi Diana,\n\nI recently applied for the SDE II position...",
      status: "OPENED",
      priority: "HIGH",
      sentDate: new Date("2026-07-10"),
      followUpDate: new Date("2026-07-14"),
    },
    {
      recipientName: "Evan Wright",
      recipientEmail: "evan@google.com",
      companyName: "Google",
      role: "Hiring Manager",
      category: "HIRING_MANAGER",
      subject: "Frontend Engineer position at Google Cloud",
      body: "Hi Evan,\n\nI saw your post on LinkedIn...",
      status: "INTERVIEW",
      priority: "HIGH",
      sentDate: new Date("2026-06-15"),
      followUpDate: null,
    },
    {
      recipientName: "Fiona Gallagher",
      recipientEmail: "fiona@netflix.com",
      companyName: "Netflix",
      role: "Alumni / SWE",
      category: "ALUMNI",
      subject: "Connecting with a fellow alum!",
      body: "Hi Fiona,\n\nI saw we both went to the same university...",
      status: "FOLLOW_UP_SENT",
      priority: "MEDIUM",
      sentDate: new Date("2026-07-05"),
      followUpDate: new Date("2026-07-15"),
    },
    {
      recipientName: "George Martin",
      recipientEmail: "george@microsoft.com",
      companyName: "Microsoft",
      role: "Director of Engineering",
      category: "COLD_OUTREACH",
      subject: "Interested in the Copilot team",
      body: "Hi George,\n\nI'm a huge fan of what the Copilot team is building...",
      status: "REJECTED",
      priority: "MEDIUM",
      sentDate: new Date("2026-06-01"),
      followUpDate: null,
    },
    {
      recipientName: "Hannah Lee",
      recipientEmail: "hannah@apple.com",
      companyName: "Apple",
      role: "Senior Recruiter",
      category: "RECRUITER",
      subject: "Software Engineer application",
      body: "Hi Hannah,\n\nFollowing up on my application...",
      status: "OFFER",
      priority: "HIGH",
      sentDate: new Date("2026-05-20"),
      followUpDate: null,
    },
    {
      recipientName: "Ian Fleming",
      recipientEmail: "ian@mi6.com",
      companyName: "MI6 Analytics",
      role: "Lead Data Scientist",
      category: "NETWORKING",
      subject: "Coffee chat?",
      body: "Hi Ian,\n\nWould love to learn more about your transition...",
      status: "GHOSTED",
      priority: "LOW",
      sentDate: new Date("2026-06-10"),
      followUpDate: null,
    },
    {
      recipientName: "Julia Child",
      recipientEmail: "julia@foodtech.co",
      companyName: "FoodTech Co",
      role: "Founder & CEO",
      category: "COLD_OUTREACH",
      subject: "Loved your recent podcast feature!",
      body: "Hi Julia,\n\nYour insights on the future of food delivery...",
      status: "SENT",
      priority: "MEDIUM",
      sentDate: new Date("2026-07-12"),
      followUpDate: new Date("2026-07-16"),
    }
  ];

  for (const item of sampleData) {
    const { companyName, ...emailData } = item;

    // Check if company exists for user
    let resolvedCompanyId = null;
    if (companyName) {
      let company = await prisma.company.findFirst({
        where: { userId: user.id, name: companyName },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            userId: user.id,
          },
        });
      }
      resolvedCompanyId = company.id;
    }

    await prisma.coldEmail.create({
      data: {
        ...emailData,
        userId: user.id,
        companyId: resolvedCompanyId,
        category: emailData.category as any,
        status: emailData.status as any,
        priority: emailData.priority as any,
      },
    });
  }

  console.log("Successfully seeded 10 cold emails.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
