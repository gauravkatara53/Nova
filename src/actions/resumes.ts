"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumeSchema, type ResumeInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { generateStructuredResponse } from "@/lib/ai/openai";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

export async function getResumes() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.resume.findMany({
    where: { userId: session.user.id },
    include: { skills: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createResume(data: ResumeInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = resumeSchema.parse(data);

  // If marking as active, deactivate all other resumes
  if (validated.isActive) {
    await prisma.resume.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      name: validated.name,
      fileUrl: validated.fileUrl,
      fileName: validated.fileName,
      isActive: validated.isActive,
    },
  });

  revalidatePath("/resumes");
  return resume;
}

export async function updateResume(id: string, data: Partial<ResumeInput>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // If marking as active, deactivate all other resumes
  if (data.isActive) {
    await prisma.resume.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isActive: false },
    });
  }

  const resume = await prisma.resume.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/resumes");
  return resume;
}

export async function deleteResume(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.resume.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/resumes");
}

export async function setActiveResume(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Deactivate all
  await prisma.resume.updateMany({
    where: { userId: session.user.id },
    data: { isActive: false },
  });

  // Activate selected
  await prisma.resume.update({
    where: { id, userId: session.user.id },
    data: { isActive: true },
  });

  revalidatePath("/resumes");
}

export async function uploadAndParseResume(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const isActive = formData.get("isActive") === "true";

  if (!file || !name) {
    throw new Error("File and name are required");
  }

  // Read file buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Parse PDF
  let rawText = "";
  try {
    const pdfData = await pdf(buffer);
    rawText = pdfData.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file. Please ensure it is a valid PDF.");
  }

  // Get AI structured data
  const parsedData = await generateStructuredResponse<{
    summary: string;
    skills: { name: string; category: string; proficiency: string }[];
    experience: any[];
    education: any[];
    projects: any[];
    techStack: string[];
  }>(SYSTEM_PROMPTS.resumeParser, rawText.substring(0, 15000)); // limit text length to avoid token limits

  // If marking as active, deactivate all other resumes
  if (isActive) {
    await prisma.resume.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  // Save to database
  const resume = await prisma.$transaction(async (tx) => {
    const createdResume = await tx.resume.create({
      data: {
        userId: session.user.id,
        name,
        fileName: file.name,
        rawText,
        summary: parsedData.summary,
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        projects: parsedData.projects || [],
        techStack: parsedData.techStack || [],
        isActive,
      },
    });

    if (parsedData.skills && parsedData.skills.length > 0) {
      await tx.resumeSkill.createMany({
        data: parsedData.skills.map((skill) => ({
          resumeId: createdResume.id,
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
        })),
      });
    }

    return createdResume;
  });

  // Log to AI History
  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "resume_parse",
      prompt: `Parsed resume ${file.name}`,
      response: JSON.stringify(parsedData),
    },
  });

  revalidatePath("/resumes");
  return resume;
}
