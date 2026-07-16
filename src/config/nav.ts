import {
  LayoutDashboard,
  Briefcase,
  Mail,
  Users,
  Building2,
  FileText,
  CheckCircle,
  MessageSquare,
  FileCode,
  Calendar,
  Settings,
  Bell,
  Sparkles,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    title: "Applications",
    href: "/applications",
    icon: Briefcase,
    description: "Track job applications",
  },
  {
    title: "Cold Emails",
    href: "/cold-emails",
    icon: Mail,
    description: "Manage outreach emails",
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
    description: "Networking CRM",
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
    description: "Company database",
  },
  {
    title: "Resumes",
    href: "/resumes",
    icon: FileText,
    description: "Resume manager",
  },
  {
    title: "Eligibility",
    href: "/eligibility",
    icon: CheckCircle,
    description: "JD match checker",
  },
  {
    title: "AI Assistant",
    href: "/ai-chat",
    icon: Sparkles,
    description: "Career AI chat",
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileCode,
    description: "Email templates",
  },
  {
    title: "Follow-ups",
    href: "/follow-ups",
    icon: Bell,
    description: "Follow-up tracker",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    description: "Schedule & deadlines",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences",
  },
] as const;

export type NavItem = (typeof navItems)[number];
