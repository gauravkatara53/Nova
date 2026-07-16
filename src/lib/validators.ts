import { z } from "zod";

// ============================================================================
// JOB APPLICATION VALIDATORS
// ============================================================================

export const jobApplicationSchema = z.object({
  role: z.string().min(1, "Role is required"),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  resumeId: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  jdText: z.string().optional(),
  status: z.enum(["WISHLIST", "APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"]).default("WISHLIST"),
  appliedDate: z.date().optional(),
  deadline: z.date().optional(),
  hasReferral: z.boolean().default(false),
  referralName: z.string().optional(),
  notes: z.string().optional(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

// ============================================================================
// COLD EMAIL VALIDATORS
// ============================================================================

export const coldEmailSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email is required"),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  contactId: z.string().optional(),
  resumeId: z.string().optional(),
  role: z.string().optional(),
  category: z.enum(["COLD_OUTREACH", "REFERRAL_REQUEST", "NETWORKING", "RECRUITER", "HIRING_MANAGER", "ALUMNI"]).default("COLD_OUTREACH"),
  subject: z.string().optional(),
  body: z.string().optional(),
  shortVersion: z.string().optional(),
  followUpEmail: z.string().optional(),
  linkedInMessage: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "OPENED", "REPLIED", "FOLLOW_UP_SENT", "INTERVIEW", "REJECTED", "OFFER", "GHOSTED"]).default("DRAFT"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  sentDate: z.date().optional(),
  followUpDate: z.date().optional(),
  notes: z.string().optional(),
  jobLink: z.string().optional(),
  jdText: z.string().optional(),
  source: z.string().optional(),
});

export type ColdEmailInput = z.infer<typeof coldEmailSchema>;

// ============================================================================
// CONTACT VALIDATORS
// ============================================================================

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  category: z.enum(["REFERRAL", "COLD_OUTREACH", "RECRUITER", "ALUMNI", "FRIEND", "HR", "HIRING_MANAGER", "OTHER"]).default("OTHER"),
  relationshipStrength: z.number().min(1).max(5).default(1),
  status: z.enum(["NO_CONTACT", "CONTACTED", "REPLIED", "INTERVIEW", "REJECTED", "OFFER"]).default("NO_CONTACT"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================================================
// COMPANY VALIDATORS
// ============================================================================

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  domain: z.string().optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

// ============================================================================
// RESUME VALIDATORS
// ============================================================================

export const resumeSchema = z.object({
  name: z.string().min(1, "Resume name is required"),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  isActive: z.boolean().default(false),
});

export type ResumeInput = z.infer<typeof resumeSchema>;

// ============================================================================
// EMAIL TEMPLATE VALIDATORS
// ============================================================================

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  variables: z.array(z.string()).default([]),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

// ============================================================================
// SETTINGS VALIDATORS
// ============================================================================

export const settingsSchema = z.object({
  defaultFollowUpDays: z.number().min(1).max(30).default(4),
  emailSignature: z.string().optional(),
  aiModel: z.string().default("gpt-4o-mini"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ============================================================================
// AI FEATURE VALIDATORS
// ============================================================================

export const eligibilityCheckSchema = z.object({
  jdText: z.string().min(10, "Job description is required"),
  resumeId: z.string().optional(),
});

export type EligibilityCheckInput = z.infer<typeof eligibilityCheckSchema>;

export const emailGenerateSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email required"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  linkedinUrl: z.string().optional(),
  notes: z.string().optional(),
  category: z.enum(["COLD_OUTREACH", "REFERRAL_REQUEST", "NETWORKING", "RECRUITER", "HIRING_MANAGER", "ALUMNI"]).default("COLD_OUTREACH"),
  tone: z.enum(["professional", "friendly", "confident", "short"]).default("professional"),
  resumeId: z.string().optional(),
});

export type EmailGenerateInput = z.infer<typeof emailGenerateSchema>;

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;

export const eligibilityResultSchema = z.object({
  overallMatch: z.number(),
  atsScore: z.number(),
  strongSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  fitCategory: z.enum(["Excellent Fit", "Good Fit", "Maybe", "Not a Fit"]),
  probability: z.number(),
  gapAnalysis: z.string(),
  suggestions: z.array(z.string()),
  coursesToLearn: z.array(z.string()),
  projectsToBuild: z.array(z.string()),
  estimatedInterviewChance: z.number(),
  estimatedResumePassRate: z.number(),
  reasons: z.array(z.string()),
  batchEligibility: z.string().optional(),
  branchAndCourse: z.string().optional(),
  cgpa: z.string().optional(),
  experienceRequired: z.string().optional(),
  isEligible: z.boolean().optional(),
});

export type EligibilityResult = z.infer<typeof eligibilityResultSchema>;
