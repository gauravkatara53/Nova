// Application status options
export const APPLICATION_STATUSES = [
  { value: "WISHLIST", label: "Wishlist", color: "bg-slate-500" },
  { value: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { value: "OA", label: "Online Assessment", color: "bg-yellow-500" },
  { value: "INTERVIEW", label: "Interview", color: "bg-purple-500" },
  { value: "OFFER", label: "Offer", color: "bg-green-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
  { value: "WITHDRAWN", label: "Withdrawn", color: "bg-gray-500" },
] as const;

// Cold email statuses
export const EMAIL_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "bg-slate-500" },
  { value: "SENT", label: "Sent", color: "bg-blue-500" },
  { value: "OPENED", label: "Opened", color: "bg-cyan-500" },
  { value: "REPLIED", label: "Replied", color: "bg-green-500" },
  { value: "FOLLOW_UP_SENT", label: "Follow-up Sent", color: "bg-yellow-500" },
  { value: "INTERVIEW", label: "Interview", color: "bg-purple-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
  { value: "OFFER", label: "Offer", color: "bg-emerald-500" },
  { value: "GHOSTED", label: "Ghosted", color: "bg-gray-500" },
] as const;

// Email categories
export const EMAIL_CATEGORIES = [
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "REFERRAL_REQUEST", label: "Referral Request" },
  { value: "NETWORKING", label: "Networking" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "HIRING_MANAGER", label: "Hiring Manager" },
  { value: "ALUMNI", label: "Alumni" },
] as const;

// Contact categories
export const CONTACT_CATEGORIES = [
  { value: "REFERRAL", label: "Referral" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "FRIEND", label: "Friend" },
  { value: "HR", label: "HR" },
  { value: "HIRING_MANAGER", label: "Hiring Manager" },
  { value: "OTHER", label: "Other" },
] as const;

// Contact statuses
export const CONTACT_STATUSES = [
  { value: "NO_CONTACT", label: "No Contact", color: "bg-slate-500" },
  { value: "CONTACTED", label: "Contacted", color: "bg-blue-500" },
  { value: "REPLIED", label: "Replied", color: "bg-green-500" },
  { value: "INTERVIEW", label: "Interview", color: "bg-purple-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
  { value: "OFFER", label: "Offer", color: "bg-emerald-500" },
] as const;

// Email priorities
export const EMAIL_PRIORITIES = [
  { value: "LOW", label: "Low", color: "text-slate-500" },
  { value: "MEDIUM", label: "Medium", color: "text-yellow-500" },
  { value: "HIGH", label: "High", color: "text-red-500" },
] as const;

// Well-known company domains for auto-detection
export const COMPANY_DOMAINS: Record<string, { name: string; logo: string }> = {
  "google.com": { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  "amazon.com": { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  "microsoft.com": { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  "meta.com": { name: "Meta", logo: "https://logo.clearbit.com/meta.com" },
  "apple.com": { name: "Apple", logo: "https://logo.clearbit.com/apple.com" },
  "netflix.com": { name: "Netflix", logo: "https://logo.clearbit.com/netflix.com" },
  "tesla.com": { name: "Tesla", logo: "https://logo.clearbit.com/tesla.com" },
  "nvidia.com": { name: "NVIDIA", logo: "https://logo.clearbit.com/nvidia.com" },
  "salesforce.com": { name: "Salesforce", logo: "https://logo.clearbit.com/salesforce.com" },
  "adobe.com": { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com" },
  "uber.com": { name: "Uber", logo: "https://logo.clearbit.com/uber.com" },
  "stripe.com": { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com" },
  "airbnb.com": { name: "Airbnb", logo: "https://logo.clearbit.com/airbnb.com" },
  "linkedin.com": { name: "LinkedIn", logo: "https://logo.clearbit.com/linkedin.com" },
  "twitter.com": { name: "X (Twitter)", logo: "https://logo.clearbit.com/x.com" },
  "github.com": { name: "GitHub", logo: "https://logo.clearbit.com/github.com" },
  "vercel.com": { name: "Vercel", logo: "https://logo.clearbit.com/vercel.com" },
  "figma.com": { name: "Figma", logo: "https://logo.clearbit.com/figma.com" },
  "notion.so": { name: "Notion", logo: "https://logo.clearbit.com/notion.so" },
  "spotify.com": { name: "Spotify", logo: "https://logo.clearbit.com/spotify.com" },
  "shopify.com": { name: "Shopify", logo: "https://logo.clearbit.com/shopify.com" },
  "databricks.com": { name: "Databricks", logo: "https://logo.clearbit.com/databricks.com" },
  "snowflake.com": { name: "Snowflake", logo: "https://logo.clearbit.com/snowflake.com" },
  "palantir.com": { name: "Palantir", logo: "https://logo.clearbit.com/palantir.com" },
  "coinbase.com": { name: "Coinbase", logo: "https://logo.clearbit.com/coinbase.com" },
  "oracle.com": { name: "Oracle", logo: "https://logo.clearbit.com/oracle.com" },
  "ibm.com": { name: "IBM", logo: "https://logo.clearbit.com/ibm.com" },
  "intel.com": { name: "Intel", logo: "https://logo.clearbit.com/intel.com" },
  "vmware.com": { name: "VMware", logo: "https://logo.clearbit.com/vmware.com" },
  "twilio.com": { name: "Twilio", logo: "https://logo.clearbit.com/twilio.com" },
};

// Follow-up outcomes
export const FOLLOW_UP_OUTCOMES = [
  { value: "NO_REPLY", label: "No Reply", color: "bg-slate-500" },
  { value: "REPLIED", label: "Replied", color: "bg-green-500" },
  { value: "INTERESTED", label: "Interested", color: "bg-emerald-500" },
  { value: "NOT_INTERESTED", label: "Not Interested", color: "bg-red-500" },
  { value: "MEETING_SCHEDULED", label: "Meeting Scheduled", color: "bg-purple-500" },
  { value: "BOUNCED", label: "Bounced", color: "bg-orange-500" },
] as const;

// Default follow-up days
export const DEFAULT_FOLLOW_UP_DAYS = 4;

// AI Models
export const AI_MODELS = [
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)" },
  { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B (Best)" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
] as const;

// Email tones
export const EMAIL_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
  { value: "short", label: "Short & Direct" },
] as const;

// Template categories
export const TEMPLATE_CATEGORIES = [
  "referral",
  "recruiter",
  "startup-founder",
  "hiring-manager",
  "alumni",
  "linkedin-connection",
  "internship",
  "full-time",
  "follow-up",
  "thank-you",
] as const;
