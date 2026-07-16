"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowUpHistory } from "@/actions/follow-ups";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Mail, CheckCircle, AlertCircle, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOLLOW_UP_OUTCOMES } from "@/config/constants";

// ============================================================================
// TYPES & HELPERS
// ============================================================================

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getOutcomeBadge(outcome: string | null) {
  if (!outcome) return null;

  const colorMap: Record<string, string> = {
    NO_REPLY: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    REPLIED: "bg-green-500/10 text-green-500 border-green-500/20",
    INTERESTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    NOT_INTERESTED: "bg-red-500/10 text-red-500 border-red-500/20",
    MEETING_SCHEDULED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    BOUNCED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  const config = FOLLOW_UP_OUTCOMES.find((o) => o.value === outcome);
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", colorMap[outcome])}>
      {config?.label || outcome}
    </Badge>
  );
}

function getStatusDot(status: string) {
  const colors: Record<string, string> = {
    SENT: "bg-green-500",
    SKIPPED: "bg-slate-400",
    PENDING: "bg-blue-500 animate-pulse",
  };
  return colors[status] || "bg-slate-400";
}

function getFollowUpTypeLabel(type: string) {
  switch (type) {
    case "FIRST": return "1st Follow-up";
    case "SECOND": return "2nd Follow-up";
    case "FINAL": return "Final Follow-up";
    default: return "Follow-up";
  }
}

function daysBetween(a: string | Date, b: string | Date) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FollowUpHistoryDrawer({
  coldEmailId,
  recipientName,
  companyName,
  open,
  onOpenChange,
}: {
  coldEmailId: string;
  recipientName: string;
  companyName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["follow-up-history", coldEmailId],
    queryFn: () => getFollowUpHistory(coldEmailId),
    enabled: open && !!coldEmailId,
  });

  const followUps = data?.followUps || [];
  const coldEmail = data?.coldEmail;

  // Stats
  const sentFollowUps = followUps.filter((f: any) => f.status === "SENT");
  const lastSent = sentFollowUps.length > 0 ? sentFollowUps[sentFollowUps.length - 1] : null;
  const firstContact = coldEmail?.sentDate || coldEmail?.createdAt;
  const daysSinceFirst = firstContact ? daysBetween(firstContact, new Date()) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg h-full flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            Follow-up History
          </SheetTitle>
          <SheetDescription>
            {recipientName}
            {companyName ? ` at ${companyName}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 p-6 pb-4">
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{sentFollowUps.length}</p>
                  <p className="text-[11px] text-muted-foreground">Follow-ups Sent</p>
                </div>
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{daysSinceFirst}d</p>
                  <p className="text-[11px] text-muted-foreground">Since First Contact</p>
                </div>
                <div className="rounded-lg border bg-card p-3 text-center">
                  <div className="flex justify-center mb-0.5">
                    {lastSent?.outcome ? (
                      getOutcomeBadge(lastSent.outcome)
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">—</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Last Outcome</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 pb-6">
                {followUps.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">No follow-up history yet</p>
                    <p className="text-xs text-muted-foreground">
                      Follow-up records will appear here once you start tracking.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

                    <div className="space-y-0">
                      {followUps.map((fu: any, index: number) => (
                        <div key={fu.id} className="relative flex gap-4 pb-6 last:pb-0">
                          {/* Timeline dot */}
                          <div className="relative z-10 mt-1.5">
                            <div
                              className={cn(
                                "h-[15px] w-[15px] rounded-full border-2 border-background",
                                getStatusDot(fu.status)
                              )}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="rounded-lg border bg-card p-3 space-y-2">
                              {/* Header row */}
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px]">
                                    {getFollowUpTypeLabel(fu.type)}
                                  </Badge>
                                  <Badge
                                    variant={fu.status === "SENT" ? "default" : "secondary"}
                                    className={cn(
                                      "text-[10px]",
                                      fu.status === "SENT" &&
                                        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                                    )}
                                  >
                                    {fu.status === "SENT" ? "Sent" : fu.status === "SKIPPED" ? "Skipped" : "Pending"}
                                  </Badge>
                                  {fu.outcome && getOutcomeBadge(fu.outcome)}
                                </div>
                              </div>

                              {/* Date info */}
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {formatDate(fu.dueDate)}
                                </span>
                                {fu.sentDate && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Sent: {formatDate(fu.sentDate)} at {formatTime(fu.sentDate)}
                                  </span>
                                )}
                              </div>

                              {/* Next follow-up indicator */}
                              {fu.nextFollowUpDate && (
                                <div className="flex items-center gap-1.5 text-[11px] text-indigo-500 font-medium">
                                  <ArrowRight className="h-3 w-3" />
                                  Next follow-up scheduled: {formatDate(fu.nextFollowUpDate)}
                                </div>
                              )}

                              {/* Notes */}
                              {fu.notes && (
                                <div className="rounded-md bg-muted/50 p-2.5 mt-1">
                                  <div className="flex items-start gap-1.5">
                                    <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {fu.notes}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Timestamp */}
                              <p className="text-[10px] text-muted-foreground/60">
                                Recorded {formatDate(fu.createdAt)} at {formatTime(fu.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Origin marker */}
                    {coldEmail?.sentDate && (
                      <div className="relative flex gap-4 pt-2">
                        <div className="relative z-10 mt-1.5">
                          <div className="h-[15px] w-[15px] rounded-full border-2 border-background bg-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>Original email sent on {formatDate(coldEmail.sentDate)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
