"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema, type JobApplicationInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getApplications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    include: { company: true, resume: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApplication(data: JobApplicationInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = jobApplicationSchema.parse(data);

  let companyId = validated.companyId;

  if (!companyId && validated.companyName) {
    let company = await prisma.company.findFirst({
      where: { userId: session.user.id, name: validated.companyName },
    });
    if (!company) {
      company = await prisma.company.create({
        data: { userId: session.user.id, name: validated.companyName },
      });
    }
    companyId = company.id;
  }

  const application = await prisma.jobApplication.create({
    data: {
      userId: session.user.id,
      role: validated.role,
      companyId: companyId,
      resumeId: validated.resumeId,
      location: validated.location,
      salary: validated.salary,
      jobLink: validated.jobLink || null,
      jdText: validated.jdText,
      status: validated.status,
      appliedDate: validated.appliedDate,
      deadline: validated.deadline,
      hasReferral: validated.hasReferral,
      referralName: validated.referralName,
      notes: validated.notes,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/");
  return application;
}

export async function updateApplication(
  id: string,
  data: Partial<JobApplicationInput>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let companyId = data.companyId;

  if (!companyId && data.companyName) {
    let company = await prisma.company.findFirst({
      where: { userId: session.user.id, name: data.companyName },
    });
    if (!company) {
      company = await prisma.company.create({
        data: { userId: session.user.id, name: data.companyName },
      });
    }
    companyId = company.id;
  }

  const { companyName, ...updateData } = data;

  const application = await prisma.jobApplication.update({
    where: { id, userId: session.user.id },
    data: {
      ...updateData,
      companyId: companyId || undefined,
      jobLink: data.jobLink || null,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/");
  return application;
}

export async function deleteApplication(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.jobApplication.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/applications");
  revalidatePath("/");
}
