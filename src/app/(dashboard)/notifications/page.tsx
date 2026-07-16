"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  Mail,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoNotifications = [
  {
    id: "1",
    type: "FOLLOW_UP",
    title: "Follow-up due: Sarah Chen @ Stripe",
    message: "Your follow-up email to Sarah Chen is due today.",
    isRead: false,
    link: "/follow-ups",
    createdAt: "2 hours ago",
    icon: Clock,
    color: "text-blue-500",
  },
  {
    id: "2",
    type: "INTERVIEW",
    title: "Interview tomorrow: Google SWE",
    message: "You have an interview with Google for the Software Engineer position tomorrow at 2:00 PM PST.",
    isRead: false,
    link: "/applications",
    createdAt: "5 hours ago",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    id: "3",
    type: "SYSTEM",
    title: "Resume needs update",
    message: "Your Frontend Specialist resume hasn't been updated in 30 days.",
    isRead: false,
    link: "/resumes",
    createdAt: "1 day ago",
    icon: FileText,
    color: "text-amber-500",
  },
  {
    id: "4",
    type: "FOLLOW_UP",
    title: "Response received from Lisa Park",
    message: "Lisa Park at Vercel replied to your cold email.",
    isRead: true,
    link: "/cold-emails",
    createdAt: "2 days ago",
    icon: Mail,
    color: "text-green-500",
  },
  {
    id: "5",
    type: "DEADLINE",
    title: "Application deadline: Meta",
    message: "The Meta Product Engineer application deadline is in 3 days.",
    isRead: true,
    link: "/applications",
    createdAt: "3 days ago",
    icon: AlertTriangle,
    color: "text-red-500",
  },
];

export default function NotificationsPage() {
  const unread = demoNotifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`You have ${unread} unread notifications`}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Check className="h-4 w-4" />
          Mark all as read
        </Button>
      </PageHeader>

      <div className="max-w-2xl space-y-2">
        {demoNotifications.map((notification, i) => {
          const Icon = notification.icon;
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-sm",
                  !notification.isRead && "bg-accent/30"
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn("mt-0.5 shrink-0", notification.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn("text-sm", !notification.isRead && "font-semibold")}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-violet-500 mt-1.5" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    )}
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      {notification.createdAt}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
