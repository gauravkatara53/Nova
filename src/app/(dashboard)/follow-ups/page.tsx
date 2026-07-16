"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFollowUps,
  updateFollowUpStatus,
  updateFollowUpContent,
  markEmailFollowUpSent,
  markEmailFollowUpSkipped,
} from "@/actions/follow-ups";
import { getColdEmails, updateColdEmail } from "@/actions/cold-emails";
import { generateFollowUp } from "@/actions/ai";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FollowUpHistoryDrawer } from "@/components/dashboard/FollowUpHistoryDrawer";
import { FOLLOW_UP_OUTCOMES } from "@/config/constants";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Sparkles,
  Loader2,
  SkipForward,
  Eye,
  CalendarDays,
  Inbox,
  Copy,
  History,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

// A unified follow-up item that can come from either the FollowUp model
// or from the ColdEmail.followUpDate field
type UnifiedFollowUp = {
  id: string; // FollowUp id or ColdEmail id (prefixed)
  source: "model" | "email"; // where this came from
  status: "PENDING" | "SENT" | "SKIPPED";
  dueDate: string;
  type: "FIRST" | "SECOND" | "FINAL";
  generatedContent: string | null;
  // The cold email info
  coldEmailId: string;
  recipientName: string;
  recipientEmail: string;
  role: string | null;
  body: string | null;
  subject: string | null;
  companyName: string | null;
  sentDate: string | null;
};

// ============================================================================
// HELPERS
// ============================================================================

function getDaysOverdue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = now.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getDaysUntil(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getFollowUpLabel(type: string) {
  switch (type) {
    case "FIRST":
      return "1st Follow-up";
    case "SECOND":
      return "2nd Follow-up";
    case "FINAL":
      return "Final Follow-up";
    default:
      return "Follow-up";
  }
}

function getFollowUpNumber(type: string) {
  switch (type) {
    case "FIRST":
      return 1;
    case "SECOND":
      return 2;
    case "FINAL":
      return 3;
    default:
      return 1;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ============================================================================
// FOLLOW-UP ITEM COMPONENT
// ============================================================================

function FollowUpItem({
  item,
  variant,
  onGenerate,
  onMarkSent,
  onDismiss,
  onPreview,
  onViewHistory,
  isGenerating,
  isUpdating,
}: {
  item: UnifiedFollowUp;
  variant: "today" | "overdue" | "upcoming" | "completed";
  onGenerate: (item: UnifiedFollowUp) => void;
  onMarkSent: (item: UnifiedFollowUp) => void;
  onDismiss: (item: UnifiedFollowUp) => void;
  onPreview: (item: UnifiedFollowUp) => void;
  onViewHistory: (item: UnifiedFollowUp) => void;
  isGenerating: boolean;
  isUpdating: boolean;
}) {
  const daysOverdue = variant === "overdue" ? getDaysOverdue(item.dueDate) : 0;
  const daysUntil = variant === "upcoming" ? getDaysUntil(item.dueDate) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent/50"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            variant === "today" && "bg-blue-500",
            variant === "overdue" && "bg-red-500 animate-pulse",
            variant === "upcoming" && "bg-yellow-500"
          )}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {item.recipientName}
            </span>
            {item.companyName && (
              <span className="text-xs text-muted-foreground">
                at {item.companyName}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            {item.role && (
              <span className="text-xs text-muted-foreground">
                {item.role}
              </span>
            )}
            <Badge variant="outline" className="text-[10px]">
              {getFollowUpLabel(item.type)}
            </Badge>
            {item.sentDate && (
              <span className="text-[10px] text-muted-foreground">
                Sent {formatDate(item.sentDate)}
              </span>
            )}
            {item.generatedContent && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 cursor-pointer"
                onClick={() => onPreview(item)}
              >
                <Eye className="h-2.5 w-2.5" />
                Preview
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {variant === "overdue" && daysOverdue > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {daysOverdue}d overdue
          </Badge>
        )}
        {variant === "upcoming" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(item.dueDate)} ({daysUntil}d)
          </span>
        )}
        {variant === "completed" && (
          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">
            Completed
          </Badge>
        )}
        {variant === "today" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due today
          </span>
        )}
        {/* History button — always visible */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onViewHistory(item)}
          title="View follow-up history"
        >
          <History className="h-3 w-3" />
          History
        </Button>
        {variant !== "completed" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(item)}
              disabled={isUpdating}
            >
              <SkipForward className="h-3 w-3" />
              Dismiss
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => onGenerate(item)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {item.generatedContent ? "Regenerate" : "Generate"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={() => onMarkSent(item)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Mail className="h-3 w-3" />
              )}
              Mark Sent
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyTabState({
  variant,
}: {
  variant: "today" | "overdue" | "upcoming" | "completed";
}) {
  const config = {
    today: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      title: "All caught up!",
      description: "No follow-ups due today.",
    },
    overdue: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      title: "No overdue follow-ups",
      description: "You're on top of everything!",
    },
    upcoming: {
      icon: Inbox,
      iconColor: "text-muted-foreground",
      title: "No upcoming follow-ups",
      description:
        "Follow-ups will appear here when you add a Follow Up Date on your cold emails.",
    },
    completed: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      title: "No completed follow-ups",
      description: "You haven't completed any follow-ups yet.",
    },
  };
  const c = config[variant];

  return (
    <Card className="p-8 text-center">
      <c.icon className={cn("mx-auto mb-2 h-8 w-8", c.iconColor)} />
      <p className="text-sm font-medium">{c.title}</p>
      <p className="text-xs text-muted-foreground">{c.description}</p>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function FollowUpsPage() {
  const queryClient = useQueryClient();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<UnifiedFollowUp | null>(null);

  // "Mark as Sent" modal state
  const [markSentItem, setMarkSentItem] = useState<UnifiedFollowUp | null>(null);
  const [markSentForm, setMarkSentForm] = useState({
    nextFollowUpDate: "",
    outcome: "",
    notes: "",
  });

  // History drawer state
  const [historyItem, setHistoryItem] = useState<UnifiedFollowUp | null>(null);

  // Fetch from FollowUp model
  const { data: modelFollowUps = [], isLoading: loadingModel } = useQuery({
    queryKey: ["follow-ups"],
    queryFn: () => getFollowUps(),
  });

  // Fetch cold emails (those with followUpDate)
  const { data: coldEmails = [], isLoading: loadingEmails } = useQuery({
    queryKey: ["cold-emails"],
    queryFn: () => getColdEmails(),
  });

  const isLoading = loadingModel || loadingEmails;

  // Build unified list:
  // 1. Cold emails that have followUpDate and status in [SENT, DRAFT, FOLLOW_UP_SENT]
  //    (these are the main source of follow-up items the user sets via the form)
  // 2. FollowUp model records that DON'T already correspond to a cold email in the list
  const unifiedFollowUps: UnifiedFollowUp[] = [];
  const coveredEmailIds = new Set<string>();

  // First: cold emails with followUpDate
  for (const email of coldEmails as any[]) {
    if (!email.followUpDate) continue;
    // Skip if already fully handled (replied, offer, etc.)
    if (["REPLIED", "INTERVIEW", "OFFER", "GHOSTED", "REJECTED"].includes(email.status)) continue;

    coveredEmailIds.add(email.id);
    unifiedFollowUps.push({
      id: `email-${email.id}`,
      source: "email",
      status: "PENDING",
      dueDate: email.followUpDate,
      type: "FIRST",
      generatedContent: email.followUpEmail || null,
      coldEmailId: email.id,
      recipientName: email.recipientName,
      recipientEmail: email.recipientEmail,
      role: email.role,
      body: email.body,
      subject: email.subject,
      companyName: email.company?.name || null,
      sentDate: email.sentDate,
    });
  }

  // Second: FollowUp model records (for any not already covered)
  for (const fu of modelFollowUps as any[]) {
    if (fu.status === "PENDING" && coveredEmailIds.has(fu.coldEmailId)) continue;

    unifiedFollowUps.push({
      id: `model-${fu.id}`,
      source: "model",
      status: fu.status,
      dueDate: fu.dueDate,
      type: fu.type,
      generatedContent: fu.generatedContent,
      coldEmailId: fu.coldEmail.id,
      recipientName: fu.coldEmail.recipientName,
      recipientEmail: fu.coldEmail.recipientEmail,
      role: fu.coldEmail.role,
      body: fu.coldEmail.body,
      subject: fu.coldEmail.subject,
      companyName: fu.coldEmail.company?.name || null,
      sentDate: null,
    });
  }

  // Categorize
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const pendingFollowUps = unifiedFollowUps.filter((f) => f.status === "PENDING");
  const completedFollowUps = unifiedFollowUps.filter((f) => f.status === "SENT");

  const todayFollowUps = pendingFollowUps.filter((f) => {
    const d = new Date(f.dueDate).getTime();
    return d >= todayStart && d < todayEnd;
  });
  const overdueFollowUps = pendingFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() < todayStart
  );
  const upcomingFollowUps = pendingFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() >= todayEnd
  );

  // ==================== MUTATIONS ====================

  // Mark as sent — handles both sources, now with tracking data
  const markSentMutation = useMutation({
    mutationFn: async ({
      item,
      trackingData,
    }: {
      item: UnifiedFollowUp;
      trackingData?: {
        outcome?: string;
        notes?: string;
        nextFollowUpDate?: Date;
      };
    }) => {
      if (item.source === "model") {
        const modelId = item.id.replace("model-", "");
        return updateFollowUpStatus(modelId, "SENT", trackingData);
      } else {
        return markEmailFollowUpSent(item.coldEmailId, trackingData);
      }
    },
    onMutate: ({ item }) => setUpdatingId(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["cold-emails"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["follow-up-history"] });
      toast.success("Follow-up marked as sent");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update follow-up");
    },
    onSettled: () => setUpdatingId(null),
  });

  // Dismiss — handles both sources
  const dismissMutation = useMutation({
    mutationFn: async (item: UnifiedFollowUp) => {
      if (item.source === "model") {
        const modelId = item.id.replace("model-", "");
        return updateFollowUpStatus(modelId, "SKIPPED");
      } else {
        return markEmailFollowUpSkipped(item.coldEmailId);
      }
    },
    onMutate: (item) => setUpdatingId(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["cold-emails"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Follow-up dismissed");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to dismiss follow-up");
    },
    onSettled: () => setUpdatingId(null),
  });

  // AI generate mutation
  const generateMutation = useMutation({
    mutationFn: async (item: UnifiedFollowUp) => {
      const result = await generateFollowUp({
        coldEmailId: item.coldEmailId,
        followUpNumber: getFollowUpNumber(item.type),
        tone: "professional",
      });
      const fullContent = `Subject: ${result.subject}\n\n${result.body}`;

      // Save the generated content
      if (item.source === "model") {
        const modelId = item.id.replace("model-", "");
        await updateFollowUpContent(modelId, fullContent);
      } else {
        // Save to cold email's followUpEmail field
        await updateColdEmail(item.coldEmailId, {
          followUpEmail: fullContent,
        } as any);
      }
      return { ...result, fullContent };
    },
    onMutate: (item) => setGeneratingId(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["cold-emails"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Follow-up email generated!");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to generate follow-up");
    },
    onSettled: () => setGeneratingId(null),
  });

  // ==================== HANDLERS ====================

  const handleGenerate = (item: UnifiedFollowUp) => {
    generateMutation.mutate(item);
  };

  // Opens the "Mark as Sent" modal instead of instantly resolving
  const handleMarkSent = (item: UnifiedFollowUp) => {
    setMarkSentForm({ nextFollowUpDate: "", outcome: "", notes: "" });
    setMarkSentItem(item);
  };

  // Submit handler for the "Mark as Sent" modal
  const handleMarkSentSubmit = () => {
    if (!markSentItem) return;

    const trackingData: {
      outcome?: string;
      notes?: string;
      nextFollowUpDate?: Date;
    } = {};

    if (markSentForm.outcome) {
      trackingData.outcome = markSentForm.outcome;
    }
    if (markSentForm.notes.trim()) {
      trackingData.notes = markSentForm.notes.trim();
    }
    if (markSentForm.nextFollowUpDate) {
      trackingData.nextFollowUpDate = new Date(markSentForm.nextFollowUpDate);
    }

    markSentMutation.mutate({
      item: markSentItem,
      trackingData: Object.keys(trackingData).length > 0 ? trackingData : undefined,
    });
    setMarkSentItem(null);
  };

  const handleDismiss = (item: UnifiedFollowUp) => {
    if (confirm("Dismiss this follow-up? It won't appear in your list anymore.")) {
      dismissMutation.mutate(item);
    }
  };

  const handlePreview = (item: UnifiedFollowUp) => {
    setPreviewItem(item);
  };

  const handleViewHistory = (item: UnifiedFollowUp) => {
    setHistoryItem(item);
  };

  // ==================== RENDER HELPERS ====================

  const renderFollowUpList = (
    items: UnifiedFollowUp[],
    variant: "today" | "overdue" | "upcoming" | "completed"
  ) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (items.length === 0) {
      return <EmptyTabState variant={variant} />;
    }

    return (
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <FollowUpItem
            key={item.id}
            item={item}
            variant={variant}
            onGenerate={handleGenerate}
            onMarkSent={handleMarkSent}
            onDismiss={handleDismiss}
            onPreview={handlePreview}
            onViewHistory={handleViewHistory}
            isGenerating={generatingId === item.id}
            isUpdating={updatingId === item.id}
          />
        ))}
      </AnimatePresence>
    );
  };

  // ==================== RENDER ====================

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Stay on top of your follow-up schedule"
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayFollowUps.length}</p>
              <p className="text-xs text-muted-foreground">Due Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueFollowUps.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Bell className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingFollowUps.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today" className="gap-2">
            Today
            {todayFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {todayFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            Overdue
            {overdueFollowUps.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {overdueFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {upcomingFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            {completedFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {completedFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-2">
          {renderFollowUpList(todayFollowUps, "today")}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-2">
          {renderFollowUpList(overdueFollowUps, "overdue")}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-2">
          {renderFollowUpList(upcomingFollowUps, "upcoming")}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          {renderFollowUpList(completedFollowUps, "completed")}
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* MARK AS SENT MODAL */}
      {/* ============================================================ */}
      <Dialog
        open={!!markSentItem}
        onOpenChange={(open) => {
          if (!open) setMarkSentItem(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-500" />
              Mark Follow-up as Sent
            </DialogTitle>
            <DialogDescription>
              {markSentItem &&
                `${markSentItem.recipientName}${markSentItem.companyName ? ` at ${markSentItem.companyName}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Outcome */}
            <div className="grid gap-2">
              <Label>Follow-up Status / Outcome</Label>
              <Select
                value={markSentForm.outcome}
                onValueChange={(v) =>
                  setMarkSentForm((prev) => ({ ...prev, outcome: v ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="What was the outcome?" />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Next Follow-up Date */}
            <div className="grid gap-2">
              <Label>Next Follow-up Date</Label>
              <Input
                type="date"
                value={markSentForm.nextFollowUpDate}
                onChange={(e) =>
                  setMarkSentForm((prev) => ({
                    ...prev,
                    nextFollowUpDate: e.target.value,
                  }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty if no further follow-up is needed.
              </p>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any context about this follow-up..."
                rows={3}
                value={markSentForm.notes}
                onChange={(e) =>
                  setMarkSentForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkSentItem(null)}>
              Cancel
            </Button>
            <Button
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={handleMarkSentSubmit}
              disabled={markSentMutation.isPending}
            >
              {markSentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Confirm &amp; Mark Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* PREVIEW DIALOG */}
      {/* ============================================================ */}
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {previewItem &&
                `${getFollowUpLabel(previewItem.type)} — ${previewItem.recipientName}`}
            </DialogTitle>
            <DialogDescription>
              {previewItem?.companyName && `Company: ${previewItem.companyName}`}
              {previewItem?.role && ` · Role: ${previewItem.role}`}
              {previewItem?.dueDate &&
                ` · Due: ${formatDate(previewItem.dueDate)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {previewItem?.generatedContent || "No content generated yet. Click 'Generate' to create a follow-up email with AI."}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewItem(null)}>
              Close
            </Button>
            {previewItem && (
              <>
                {previewItem.generatedContent && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      if (previewItem.generatedContent) {
                        navigator.clipboard.writeText(
                          previewItem.generatedContent
                        );
                        toast.success("Copied to clipboard!");
                      }
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                )}
                <Button
                  className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                  onClick={() => {
                    handleMarkSent(previewItem);
                    setPreviewItem(null);
                  }}
                  disabled={updatingId === previewItem.id}
                >
                  {updatingId === previewItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Mark as Sent
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* HISTORY DRAWER */}
      {/* ============================================================ */}
      <FollowUpHistoryDrawer
        coldEmailId={historyItem?.coldEmailId || ""}
        recipientName={historyItem?.recipientName || ""}
        companyName={historyItem?.companyName}
        open={!!historyItem}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null);
        }}
      />
    </div>
  );
}
