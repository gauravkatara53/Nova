import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Nova — AI-Powered Job Application CRM",
    template: "%s | Nova",
  },
  description:
    "Manage cold emails, track referrals, analyze job descriptions, match resumes, and accelerate your job search with AI.",
  keywords: [
    "job application tracker",
    "cold email",
    "CRM",
    "AI resume",
    "job search",
    "career management",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <TooltipProvider delay={0}>
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
