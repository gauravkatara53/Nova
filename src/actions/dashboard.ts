"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const [
    totalApplications,
    coldEmailsSent,
    totalContacts,
    totalResponses,
    interviews,
    offers,
    rejections,
    totalEmails,
    pendingFollowUps,
    totalCompanies,
  ] = await Promise.all([
    prisma.jobApplication.count({ where: { userId } }),
    prisma.coldEmail.count({ where: { userId, status: "SENT" } }),
    prisma.contact.count({ where: { userId } }),
    prisma.coldEmail.count({ where: { userId, status: { in: ["REPLIED", "INTERVIEW", "OFFER"] } } }),
    prisma.jobApplication.count({ where: { userId, status: "INTERVIEW" } }),
    prisma.jobApplication.count({ where: { userId, status: "OFFER" } }),
    prisma.jobApplication.count({ where: { userId, status: "REJECTED" } }),
    prisma.coldEmail.count({ where: { userId } }),
    prisma.coldEmail.count({ where: { userId, followUpDate: { not: null }, status: { in: ["SENT", "DRAFT", "FOLLOW_UP_SENT"] } } }),
    prisma.company.count({ where: { userId } }),
  ]);

  const responseRate = totalEmails > 0 ? Math.round((totalResponses / totalEmails) * 100) : 0;

  return {
    totalApplications,
    coldEmailsSent,
    totalContacts,
    totalResponses,
    interviews,
    offers,
    rejections,
    responseRate,
    pendingFollowUps,
    totalCompanies,
  };
}

export async function getRecentActivity() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Fetch recent cold emails and applications
  const [recentEmails, recentApplications] = await Promise.all([
    prisma.coldEmail.findMany({
      where: { userId },
      include: { company: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      include: { company: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  // Combine and sort by date
  const activities: Array<{
    action: string;
    target: string;
    time: string;
    color: string;
  }> = [];

  for (const email of recentEmails) {
    const statusAction: Record<string, { action: string; color: string }> = {
      DRAFT: { action: "Drafted email to", color: "bg-slate-500" },
      SENT: { action: "Email sent to", color: "bg-violet-500" },
      REPLIED: { action: "Response from", color: "bg-green-500" },
      FOLLOW_UP_SENT: { action: "Follow-up sent to", color: "bg-amber-500" },
      INTERVIEW: { action: "Interview via", color: "bg-purple-500" },
      OFFER: { action: "Offer received from", color: "bg-emerald-500" },
      GHOSTED: { action: "No response from", color: "bg-red-500" },
    };
    const config = statusAction[email.status] || { action: "Updated email to", color: "bg-blue-500" };
    activities.push({
      action: config.action,
      target: `${email.recipientName}${email.company?.name ? ` at ${email.company.name}` : ""}`,
      time: email.updatedAt.toISOString(),
      color: config.color,
    });
  }

  for (const app of recentApplications) {
    const statusAction: Record<string, { action: string; color: string }> = {
      WISHLIST: { action: "Added to wishlist", color: "bg-slate-500" },
      APPLIED: { action: "Applied to", color: "bg-blue-500" },
      OA: { action: "OA received for", color: "bg-cyan-500" },
      INTERVIEW: { action: "Interview scheduled for", color: "bg-purple-500" },
      OFFER: { action: "Offer received for", color: "bg-emerald-500" },
      REJECTED: { action: "Rejected from", color: "bg-red-500" },
    };
    const config = statusAction[app.status] || { action: "Updated", color: "bg-blue-500" };
    activities.push({
      action: config.action,
      target: `${app.role}${app.company?.name ? ` at ${app.company.name}` : ""}`,
      time: app.updatedAt.toISOString(),
      color: config.color,
    });
  }

  // Sort by time descending and take top 8
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return activities.slice(0, 8);
}

export async function getApplicationStatusDistribution() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const statuses = ["WISHLIST", "APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"] as const;
  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.jobApplication.count({ where: { userId, status } })
    )
  );

  const colorMap: Record<string, string> = {
    WISHLIST: "#64748b",
    APPLIED: "#6366f1",
    OA: "#06b6d4",
    INTERVIEW: "#a855f7",
    OFFER: "#22c55e",
    REJECTED: "#ef4444",
    WITHDRAWN: "#f59e0b",
  };

  return statuses
    .map((status, i) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: counts[i],
      color: colorMap[status],
    }))
    .filter((d) => d.value > 0);
}

export async function getTopCompanies() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { applications: true, coldEmails: true, contacts: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 7,
  });

  return companies.map((c) => ({
    company: c.name,
    count: c._count.applications + c._count.coldEmails,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
}
