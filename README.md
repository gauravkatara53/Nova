# Nova

> AI-Powered Job Application CRM — Manage cold emails, track referrals, analyze job descriptions, match resumes, and accelerate your job search.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)

## Features

- 📊 **Dashboard** — Statistics, charts, activity feed
- 📧 **Cold Email Manager** — Track outreach with auto follow-up scheduling
- 👥 **Contact CRM** — Manage networking connections with relationship tracking
- 🏢 **Company Database** — Auto-detect companies, logos, tech stacks
- 📄 **Resume Manager** — Upload, parse, and manage multiple resumes
- ✅ **Eligibility Checker** — AI-powered JD matching with gap analysis
- 🤖 **AI Assistant** — Career chat, email generation, resume optimization
- 📝 **Email Templates** — Pre-built and custom templates with variables
- 🔔 **Follow-up Automation** — Smart reminders and AI-generated follow-ups
- 📅 **Calendar** — Track interviews, deadlines, and follow-ups
- 🔍 **Command Palette** — Quick navigation with ⌘K
- 🌓 **Dark/Light Mode** — Beautiful theme support

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Shadcn UI |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Auth.js v5 (NextAuth) |
| **AI** | OpenAI GPT-4o |
| **State** | Zustand + TanStack Query |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Email** | Resend / Nodemailer |
| **Uploads** | UploadThing |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd coldreach-ai
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, API keys, etc.

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (`npx auth secret`)
- `AUTH_GOOGLE_ID/SECRET` — Google OAuth credentials
- `AUTH_GITHUB_ID/SECRET` — GitHub OAuth credentials
- `OPENAI_API_KEY` — OpenAI API key
- `UPLOADTHING_TOKEN` — UploadThing token
- `RESEND_API_KEY` — Resend API key

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login/register
│   ├── (dashboard)/      # Protected dashboard pages
│   └── api/              # API routes & cron jobs
├── actions/              # Server Actions (CRUD)
├── components/           # React components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Sidebar, Navbar, CommandPalette
│   ├── dashboard/        # Dashboard widgets
│   └── shared/           # Reusable components
├── config/               # App configuration
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & services
│   └── ai/               # AI service layer
├── stores/               # Zustand state stores
└── types/                # TypeScript types
```

## Deployment

Optimized for Vercel:

```bash
npm run build
# Deploy to Vercel
vercel --prod
```

## License

MIT
