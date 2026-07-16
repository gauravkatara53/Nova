"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema, type SettingsInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  // Create default settings if not exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: session.user.id },
    });
  }

  return settings;
}

export async function updateSettings(data: SettingsInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = settingsSchema.parse(data);

  const settings = await prisma.settings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...validated,
    },
    update: validated,
  });

  revalidatePath("/settings");
  return settings;
}

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}
