"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coldEmailSchema, type ColdEmailInput } from "@/lib/validators";
import { addDays } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getColdEmails() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.coldEmail.findMany({
    where: { userId: session.user.id },
    include: { company: true, contact: true, followUps: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createColdEmail(data: ColdEmailInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = coldEmailSchema.parse(data);
  const { companyName, ...emailData } = validated;

  // Get user settings for default follow-up days
  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });
  const followUpDays = settings?.defaultFollowUpDays || 4;

  let resolvedCompanyId = emailData.companyId || null;
  if (companyName && companyName.trim() !== "") {
    const existingCompany = await prisma.company.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: companyName.trim(), mode: "insensitive" },
      },
    });
    if (existingCompany) {
      resolvedCompanyId = existingCompany.id;
    } else {
      const newCompany = await prisma.company.create({
        data: {
          userId: session.user.id,
          name: companyName.trim(),
        },
      });
      resolvedCompanyId = newCompany.id;
    }
  }

  const email = await prisma.coldEmail.create({
    data: {
      userId: session.user.id,
      ...emailData,
      companyId: resolvedCompanyId,
      jobLink: emailData.jobLink || null,
      followUpDate: emailData.sentDate
        ? addDays(emailData.sentDate, followUpDays)
        : null,
    },
  });

  revalidatePath("/cold-emails");
  revalidatePath("/");
  return email;
}

export async function updateColdEmail(
  id: string,
  data: Partial<ColdEmailInput>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { companyName, ...emailData } = data;
  let resolvedCompanyId: string | null | undefined = emailData.companyId;

  if (companyName !== undefined) {
    if (companyName.trim() === "") {
      resolvedCompanyId = null;
    } else {
      const existingCompany = await prisma.company.findFirst({
        where: {
          userId: session.user.id,
          name: { equals: companyName.trim(), mode: "insensitive" },
        },
      });
      if (existingCompany) {
        resolvedCompanyId = existingCompany.id;
      } else {
        const newCompany = await prisma.company.create({
          data: {
            userId: session.user.id,
            name: companyName.trim(),
          },
        });
        resolvedCompanyId = newCompany.id;
      }
    }
  }

  const email = await prisma.coldEmail.update({
    where: { id, userId: session.user.id },
    data: {
      ...emailData,
      ...(companyName !== undefined ? { companyId: resolvedCompanyId } : {}),
      jobLink: emailData.jobLink || null,
    },
  });

  revalidatePath("/cold-emails");
  revalidatePath("/");
  return email;
}

export async function deleteColdEmail(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.coldEmail.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/cold-emails");
  revalidatePath("/");
}
