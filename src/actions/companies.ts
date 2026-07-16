"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companySchema, type CompanyInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getCompanies() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.company.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { contacts: true, coldEmails: true, applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCompany(data: CompanyInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = companySchema.parse(data);

  const company = await prisma.company.create({
    data: {
      userId: session.user.id,
      ...validated,
      website: validated.website || null,
    },
  });

  revalidatePath("/companies");
  return company;
}

export async function updateCompany(id: string, data: Partial<CompanyInput>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const company = await prisma.company.update({
    where: { id, userId: session.user.id },
    data: {
      ...data,
      website: data.website || null,
    },
  });

  revalidatePath("/companies");
  return company;
}

export async function deleteCompany(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.company.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/companies");
}
