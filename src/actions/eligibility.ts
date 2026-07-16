"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStructuredResponse, generateAIResponse } from "@/lib/ai/openai";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { type EligibilityResult } from "@/lib/validators";

export async function checkEligibility(resumeId: string, jdText: string): Promise<EligibilityResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!jdText || jdText.trim().length < 10) {
    throw new Error("Job description is too short or missing.");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
      userId: session.user.id,
    },
  });

  if (!resume || !resume.rawText) {
    throw new Error("Resume not found or does not contain readable text.");
  }

  // Truncate strings to prevent token limits on Groq free tier
  const safeResumeText = resume.rawText.substring(0, 8000);
  const safeJdText = jdText.substring(0, 8000);

  const userPrompt = `
Candidate Resume Content:
${safeResumeText}

Job Description:
${safeJdText}

Analyze how well this resume matches the job description based on the criteria in the system prompt.
`;

  try {
    const result = await generateStructuredResponse<EligibilityResult>(
      SYSTEM_PROMPTS.resumeMatcher,
      userPrompt
    );
    return result;
  } catch (error) {
    console.error("Eligibility check failed:", error);
    throw new Error("Failed to analyze resume eligibility.");
  }
}

export async function checkStrictEligibility(resumeId: string, jdText: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!jdText || jdText.trim().length < 10) {
    throw new Error("Job description is too short or missing.");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
      userId: session.user.id,
    },
  });

  if (!resume) {
    throw new Error("Resume not found.");
  }

  // Construct parsed resume data if available, otherwise use raw text
  let candidateData = "";
  if (resume.experience || resume.education || resume.techStack.length > 0) {
    candidateData = `
Education: ${JSON.stringify(resume.education)}
Experience: ${JSON.stringify(resume.experience)}
Skills: ${JSON.stringify(resume.techStack)}
Summary: ${resume.summary || "N/A"}
`;
  } else {
    candidateData = resume.rawText?.substring(0, 8000) || "";
  }

  if (!candidateData.trim()) {
    throw new Error("Resume does not contain readable data.");
  }

  const safeJdText = jdText.substring(0, 8000);

  const userPrompt = `
**Candidate Resume Data (Parsed):**
${candidateData}

**Job Description (JD):**
${safeJdText}

Analyze how well this resume matches the job description based on the criteria in the system prompt.
`;

  try {
    const result = await generateAIResponse(
      SYSTEM_PROMPTS.strictEligibilityScreener,
      userPrompt
    );
    return result;
  } catch (error) {
    console.error("Strict eligibility check failed:", error);
    throw new Error("Failed to analyze resume eligibility.");
  }
}
