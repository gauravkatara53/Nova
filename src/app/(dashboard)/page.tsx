"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRecentActivity,
} from "@/actions/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Loader2 } from "lucide-react";
import {
  Briefcase,
  Mail,
  Users,
  MessageSquare,
  Award,
  Trophy,
  XCircle,
  TrendingUp,
  Building2,
  Clock,
  Send,
  Code,
  Video,
  Bookmark,
  Activity,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function timeAgo(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const colorMap: Record<string, { bg: string, text: string, icon: any }> = {
  "bg-slate-500": { bg: "bg-slate-500/10", text: "text-slate-500", icon: Bookmark },
  "bg-blue-500": { bg: "bg-blue-500/10", text: "text-blue-500", icon: Briefcase },
  "bg-violet-500": { bg: "bg-violet-500/10", text: "text-violet-500", icon: Mail },
  "bg-amber-500": { bg: "bg-amber-500/10", text: "text-amber-500", icon: Send },
  "bg-green-500": { bg: "bg-green-500/10", text: "text-green-500", icon: MessageSquare },
  "bg-cyan-500": { bg: "bg-cyan-500/10", text: "text-cyan-500", icon: Code },
  "bg-purple-500": { bg: "bg-purple-500/10", text: "text-purple-500", icon: Video },
  "bg-emerald-500": { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: Trophy },
  "bg-red-500": { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
};

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });

  const { data: activity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => getRecentActivity(),
  });

  if (loadingStats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = stats || {
    totalApplications: 0,
    coldEmailsSent: 0,
    totalContacts: 0,
    totalResponses: 0,
    interviews: 0,
    offers: 0,
    rejections: 0,
    responseRate: 0,
    pendingFollowUps: 0,
    totalCompanies: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your job search at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title="Applications"
          value={s.totalApplications}
          icon={Briefcase}
          color="from-violet-600 to-indigo-600"
          delay={0}
        />
        <StatsCard
          title="Emails Sent"
          value={s.coldEmailsSent}
          icon={Mail}
          color="from-blue-600 to-cyan-600"
          delay={0.05}
        />
        <StatsCard
          title="Contacts"
          value={s.totalContacts}
          icon={Users}
          color="from-emerald-600 to-teal-600"
          delay={0.1}
        />
        <StatsCard
          title="Responses"
          value={s.totalResponses}
          icon={MessageSquare}
          color="from-amber-600 to-orange-600"
          delay={0.15}
        />
        <StatsCard
          title="Interviews"
          value={s.interviews}
          icon={Award}
          color="from-purple-600 to-pink-600"
          delay={0.2}
        />
        <StatsCard
          title="Offers"
          value={s.offers}
          icon={Trophy}
          color="from-green-600 to-emerald-600"
          delay={0.25}
        />
        <StatsCard
          title="Rejections"
          value={s.rejections}
          icon={XCircle}
          color="from-red-600 to-rose-600"
          delay={0.3}
        />
        <StatsCard
          title="Response Rate"
          value={`${s.responseRate}%`}
          icon={TrendingUp}
          color="from-sky-600 to-blue-600"
          delay={0.35}
        />
        <StatsCard
          title="Companies"
          value={s.totalCompanies}
          icon={Building2}
          color="from-fuchsia-600 to-purple-600"
          delay={0.4}
        />
        <StatsCard
          title="Follow-ups"
          value={s.pendingFollowUps}
          icon={Clock}
          color="from-orange-600 to-amber-600"
          subtitle=""
          delay={0.45}
        />
      </div>

      {/* Improved Recent Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Recent Activity
          </h2>
        </div>
        
        <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          {loadingActivity ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center p-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 mb-4">
                <Activity className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium">No activity yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Your recent actions like sending emails or tracking applications will appear here.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line connecting timeline - smooth SaaS styling */}
              <div className="absolute left-[43px] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden sm:block" />
              
              <div className="divide-y divide-border/50 sm:divide-y-0 p-2 sm:p-4 space-y-0 sm:space-y-4">
                <AnimatePresence>
                  {activity.map((item: any, i: number) => {
                    const style = colorMap[item.color] || { bg: "bg-indigo-500/10", text: "text-indigo-500", icon: Activity };
                    const Icon = style.icon;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 sm:p-2 rounded-lg hover:bg-accent/50 transition-colors relative z-10"
                      >
                        <div className="flex items-center gap-3 sm:gap-6 w-full">
                          {/* Icon Badge */}
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm border border-background",
                            style.bg,
                            style.text
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 justify-between">
                            <div>
                              <p className="text-sm">
                                <span className="font-medium text-foreground">{item.action}</span>{" "}
                                <span className="text-muted-foreground">{item.target}</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {timeAgo(item.time)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
