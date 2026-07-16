import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint to check for due follow-ups and create notifications.
 * Call via Vercel Cron Jobs or external cron service.
 * 
 * Recommended cron: 0 9 * * * (daily at 9 AM)
 */
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find cold emails with follow-up dates due today or overdue
    const dueEmails = await prisma.coldEmail.findMany({
      where: {
        followUpDate: { lte: tomorrow },
        status: { in: ["SENT", "FOLLOW_UP_SENT"] },
      },
      include: { user: true },
    });

    // Create notifications for each due follow-up
    const notifications = [];
    for (const email of dueEmails) {
      // Check if notification already exists for today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: email.userId,
          type: "FOLLOW_UP",
          title: { contains: email.recipientName },
          createdAt: { gte: today },
        },
      });

      if (!existing) {
        const notification = await prisma.notification.create({
          data: {
            userId: email.userId,
            type: "FOLLOW_UP",
            title: `Follow-up due: ${email.recipientName}`,
            message: `Your follow-up to ${email.recipientName}${email.role ? ` for ${email.role}` : ""} is due.`,
            link: "/follow-ups",
          },
        });
        notifications.push(notification);
      }
    }

    return NextResponse.json({
      success: true,
      checked: dueEmails.length,
      notificationsCreated: notifications.length,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
