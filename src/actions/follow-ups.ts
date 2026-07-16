"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFollowUps() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.followUp.findMany({
    where: {
      coldEmail: {
        userId: session.user.id,
      },
    },
    include: {
      coldEmail: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getFollowUpHistory(coldEmailId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify the cold email belongs to the user
  const coldEmail = await prisma.coldEmail.findUnique({
    where: { id: coldEmailId, userId: session.user.id },
    include: { company: true },
  });
  if (!coldEmail) throw new Error("Cold email not found");

  const followUps = await prisma.followUp.findMany({
    where: { coldEmailId },
    orderBy: { createdAt: "asc" },
  });

  return { coldEmail, followUps };
}

export async function createFollowUp(data: {
  coldEmailId: string;
  type: "FIRST" | "SECOND" | "FINAL";
  dueDate: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify the cold email belongs to the user
  const coldEmail = await prisma.coldEmail.findUnique({
    where: { id: data.coldEmailId, userId: session.user.id },
  });
  if (!coldEmail) throw new Error("Cold email not found");

  const followUp = await prisma.followUp.create({
    data: {
      coldEmailId: data.coldEmailId,
      type: data.type,
      dueDate: data.dueDate,
    },
  });

  revalidatePath("/follow-ups");
  revalidatePath("/");
  return followUp;
}

export async function updateFollowUpStatus(
  id: string,
  status: "SENT" | "SKIPPED",
  trackingData?: {
    outcome?: string;
    notes?: string;
    nextFollowUpDate?: Date;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership through cold email
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: { coldEmail: true },
  });
  if (!followUp || followUp.coldEmail.userId !== session.user.id) {
    throw new Error("Follow-up not found");
  }

  const updated = await prisma.followUp.update({
    where: { id },
    data: {
      status,
      ...(status === "SENT" ? { sentDate: new Date() } : {}),
      ...(trackingData?.outcome ? { outcome: trackingData.outcome as any } : {}),
      ...(trackingData?.notes ? { notes: trackingData.notes } : {}),
      ...(trackingData?.nextFollowUpDate
        ? { nextFollowUpDate: trackingData.nextFollowUpDate }
        : {}),
    },
  });

  // If marked as sent, also update the cold email status
  if (status === "SENT") {
    await prisma.coldEmail.update({
      where: { id: followUp.coldEmailId },
      data: {
        status: "FOLLOW_UP_SENT",
        // If a next follow-up date is provided, set it; otherwise clear it
        followUpDate: trackingData?.nextFollowUpDate || null,
      },
    });
  }

  revalidatePath("/follow-ups");
  revalidatePath("/cold-emails");
  revalidatePath("/");
  return updated;
}

export async function updateFollowUpContent(id: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: { coldEmail: true },
  });
  if (!followUp || followUp.coldEmail.userId !== session.user.id) {
    throw new Error("Follow-up not found");
  }

  const updated = await prisma.followUp.update({
    where: { id },
    data: { generatedContent: content },
  });

  revalidatePath("/follow-ups");
  return updated;
}

export async function markEmailFollowUpSent(
  coldEmailId: string,
  trackingData?: {
    outcome?: string;
    notes?: string;
    nextFollowUpDate?: Date;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coldEmail = await prisma.coldEmail.findUnique({
    where: { id: coldEmailId, userId: session.user.id },
  });
  if (!coldEmail) throw new Error("Cold email not found");

  // Count existing follow-ups to determine the type
  const existingCount = await prisma.followUp.count({
    where: { coldEmailId, status: "SENT" },
  });

  let followUpType: "FIRST" | "SECOND" | "FINAL" = "FIRST";
  if (existingCount >= 2) followUpType = "FINAL";
  else if (existingCount >= 1) followUpType = "SECOND";

  if (coldEmail.followUpDate) {
    await prisma.followUp.create({
      data: {
        coldEmailId,
        type: followUpType,
        dueDate: coldEmail.followUpDate,
        status: "SENT",
        sentDate: new Date(),
        generatedContent: coldEmail.followUpEmail,
        outcome: (trackingData?.outcome as any) || null,
        notes: trackingData?.notes || null,
        nextFollowUpDate: trackingData?.nextFollowUpDate || null,
      },
    });
  }

  await prisma.coldEmail.update({
    where: { id: coldEmailId },
    data: {
      status: "FOLLOW_UP_SENT",
      // If a next follow-up date is provided, set it; otherwise clear it
      followUpDate: trackingData?.nextFollowUpDate || null,
    },
  });

  revalidatePath("/follow-ups");
  revalidatePath("/cold-emails");
  revalidatePath("/");
}

export async function markEmailFollowUpSkipped(coldEmailId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coldEmail = await prisma.coldEmail.findUnique({
    where: { id: coldEmailId, userId: session.user.id },
  });
  if (!coldEmail) throw new Error("Cold email not found");

  if (coldEmail.followUpDate) {
    await prisma.followUp.create({
      data: {
        coldEmailId,
        type: "FIRST",
        dueDate: coldEmail.followUpDate,
        status: "SKIPPED",
        generatedContent: coldEmail.followUpEmail,
      },
    });
  }

  await prisma.coldEmail.update({
    where: { id: coldEmailId },
    data: {
      followUpDate: null,
    },
  });

  revalidatePath("/follow-ups");
  revalidatePath("/cold-emails");
  revalidatePath("/");
}
