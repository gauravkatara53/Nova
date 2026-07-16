"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailTemplateSchema, type EmailTemplateInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.emailTemplate.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isGlobal: true }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTemplate(data: EmailTemplateInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = emailTemplateSchema.parse(data);

  const template = await prisma.emailTemplate.create({
    data: {
      userId: session.user.id,
      ...validated,
    },
  });

  revalidatePath("/templates");
  return template;
}

export async function updateTemplate(
  id: string,
  data: Partial<EmailTemplateInput>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const template = await prisma.emailTemplate.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/templates");
  return template;
}

export async function deleteTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.emailTemplate.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/templates");
}
