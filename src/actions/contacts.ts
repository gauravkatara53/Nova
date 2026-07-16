"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getContacts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.contact.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createContact(data: ContactInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = contactSchema.parse(data);
  const { companyName, ...contactData } = validated;

  let resolvedCompanyId = contactData.companyId || null;
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

  const contact = await prisma.contact.create({
    data: {
      userId: session.user.id,
      ...contactData,
      companyId: resolvedCompanyId,
      email: contactData.email || null,
      linkedin: contactData.linkedin || null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath("/");
  return contact;
}

export async function updateContact(id: string, data: Partial<ContactInput>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { companyName, ...contactData } = data;

  let resolvedCompanyId: string | null | undefined = contactData.companyId;

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

  const contact = await prisma.contact.update({
    where: { id, userId: session.user.id },
    data: {
      ...contactData,
      ...(companyName !== undefined ? { companyId: resolvedCompanyId } : {}),
      email: contactData.email || null,
      linkedin: contactData.linkedin || null,
    },
  });

  revalidatePath("/contacts");
  return contact;
}

export async function deleteContact(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.contact.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/contacts");
}
