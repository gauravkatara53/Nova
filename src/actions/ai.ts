"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse, generateStructuredResponse } from "@/lib/ai/openai";
import { SYSTEM_PROMPTS, buildEmailPrompt, buildMatchPrompt, buildFollowUpPrompt } from "@/lib/ai/prompts";
import { revalidatePath } from "next/cache";

export async function generateEmail(data: {
  recipientName: string;
  company: string;
  role: string;
  category: string;
  tone: string;
  notes?: string;
  resumeId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let resumeSummary: string | undefined;
  if (data.resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: data.resumeId, userId: session.user.id },
    });
    resumeSummary = resume?.summary || resume?.rawText?.slice(0, 500) || undefined;
  }

  const prompt = buildEmailPrompt({ ...data, resumeSummary });
  const result = await generateStructuredResponse<{
    subject: string;
    body: string;
    shortVersion: string;
    followUpEmail: string;
    linkedInMessage: string;
  }>(SYSTEM_PROMPTS.emailGenerator, prompt);

  // Save to AI history
  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "email_generate",
      prompt: JSON.stringify(data),
      response: JSON.stringify(result),
    },
  });

  return result;
}

export async function analyzeJobDescription(jdText: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await generateStructuredResponse<{
    company: string;
    role: string;
    salary: string;
    experience: string;
    location: string;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    techStack: string[];
    difficulty: string;
    atsKeywords: string[];
  }>(SYSTEM_PROMPTS.jdParser, jdText);

  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "jd_parse",
      prompt: jdText.slice(0, 2000),
      response: JSON.stringify(result),
    },
  });

  return result;
}

export async function matchResumeToJob(data: {
  jdText: string;
  resumeId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get resume
  let resume;
  if (data.resumeId) {
    resume = await prisma.resume.findUnique({
      where: { id: data.resumeId, userId: session.user.id },
      include: { skills: true },
    });
  } else {
    // Use active resume
    resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: { skills: true },
    });
  }

  if (!resume?.rawText) {
    throw new Error("No resume text available. Please upload and parse a resume first.");
  }

  const prompt = buildMatchPrompt(resume.rawText, data.jdText);
  const result = await generateStructuredResponse<{
    overallMatch: number;
    atsScore: number;
    strongSkills: string[];
    missingSkills: string[];
    fitCategory: string;
    probability: number;
    gapAnalysis: string;
    suggestions: string[];
    coursesToLearn: string[];
    projectsToBuild: string[];
    estimatedInterviewChance: number;
    estimatedResumePassRate: number;
    reasons: string[];
  }>(SYSTEM_PROMPTS.resumeMatcher, prompt);

  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "resume_match",
      prompt: JSON.stringify({ jdText: data.jdText.slice(0, 1000), resumeId: resume.id }),
      response: JSON.stringify(result),
    },
  });

  return result;
}

export async function generateFollowUp(data: {
  coldEmailId: string;
  followUpNumber: number;
  tone: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coldEmail = await prisma.coldEmail.findUnique({
    where: { id: data.coldEmailId, userId: session.user.id },
  });

  if (!coldEmail) throw new Error("Email not found");

  const prompt = buildFollowUpPrompt({
    originalEmail: coldEmail.body || "",
    followUpNumber: data.followUpNumber,
    tone: data.tone,
    recipientName: coldEmail.recipientName,
    company: "", // Would come from company relation
    role: coldEmail.role || "",
  });

  const result = await generateStructuredResponse<{
    subject: string;
    body: string;
  }>(SYSTEM_PROMPTS.followUpGenerator, prompt);

  return result;
}

export async function chatWithAI(message: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const response = await generateAIResponse(
    SYSTEM_PROMPTS.careerAssistant,
    message
  );

  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "chat",
      prompt: message,
      response,
    },
  });

  return response;
}

export async function researchCompany(companyName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await generateStructuredResponse<{
    summary: string;
    products: string[];
    techStack: string[];
    recentNews: string[];
    hiringTrends: string;
    interviewProcess: string;
    glassdoorSummary: string;
    funding: string;
    culture: string;
    bestColdEmailStrategy: string;
  }>(SYSTEM_PROMPTS.companyResearch, `Research the company: ${companyName}`);

  await prisma.aIHistory.create({
    data: {
      userId: session.user.id,
      type: "company_research",
      prompt: companyName,
      response: JSON.stringify(result),
    },
  });

  return result;
}
