"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColdEmails, createColdEmail, updateColdEmail, deleteColdEmail } from "@/actions/cold-emails";
import { getContacts } from "@/actions/contacts";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Plus,
  Search,
  Sparkles,
  Clock,
  MoreHorizontal,
  Send,
  ArrowUpRight,
  LayoutGrid,
  List,
  Check,
  Copy,
  Trash2,
  PanelRightOpen,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EMAIL_STATUSES, EMAIL_CATEGORIES, EMAIL_PRIORITIES } from "@/config/constants";
import { cn } from "@/lib/utils";

function getEmailStatusBadge(status: string) {
  const colorMap: Record<string, string> = {
    DRAFT: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    SENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    OPENED: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    REPLIED: "bg-green-500/10 text-green-500 border-green-500/20",
    FOLLOW_UP_SENT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    INTERVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    OFFER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    GHOSTED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const statusConfig = EMAIL_STATUSES.find((s) => s.value === status);
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", colorMap[status])}
    >
      {statusConfig?.label || status}
    </Badge>
  );
}

function getPriorityDot(priority: string) {
  const colors: Record<string, string> = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-yellow-400",
    HIGH: "bg-red-400",
  };
  return <div className={cn("h-2 w-2 rounded-full", colors[priority])} />;
}

export default function ColdEmailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    recipientName: "",
    recipientEmail: "",
    companyName: "",
    role: "",
    category: "COLD_OUTREACH",
    subject: "",
    body: "",
    status: "DRAFT",
    priority: "MEDIUM",
    sentDate: "",
    followUpDate: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: () => getColdEmails(),
  });

  const createMutation = useMutation({
    mutationFn: createColdEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Cold email created successfully");
      setShowNewDialog(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to create cold email");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateColdEmail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Cold email updated successfully");
      setShowNewDialog(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update cold email");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColdEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Cold email deleted successfully");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to delete cold email");
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  const handleOpenAddDialog = () => {
    const today = new Date();
    const followUp = new Date(today);
    followUp.setDate(today.getDate() + 4);

    setFormState({
      recipientName: "",
      recipientEmail: "",
      companyName: "",
      role: "",
      category: "COLD_OUTREACH",
      subject: "",
      body: "",
      status: "DRAFT",
      priority: "MEDIUM",
      sentDate: today.toISOString().split('T')[0],
      followUpDate: followUp.toISOString().split('T')[0],
      notes: "",
    });
    setIsEditing(false);
    setSelectedEmailId(null);
    setShowNewDialog(true);
  };

  const handleOpenEditDialog = (email: any) => {
    setFormState({
      recipientName: email.recipientName,
      recipientEmail: email.recipientEmail,
      companyName: email.company?.name || "",
      role: email.role || "",
      category: email.category,
      subject: email.subject || "",
      body: email.body || "",
      status: email.status,
      priority: email.priority,
      sentDate: email.sentDate ? new Date(email.sentDate).toISOString().split('T')[0] : "",
      followUpDate: email.followUpDate ? new Date(email.followUpDate).toISOString().split('T')[0] : "",
      notes: email.notes || "",
    });
    setIsEditing(true);
    setSelectedEmailId(email.id);
    setShowNewDialog(true);
  };

  const handleSaveEmail = () => {
    if (!formState.recipientName.trim()) {
      console.error(`error`);
      toast.error("Recipient Name is required");
      return;
    }
    if (!formState.recipientEmail.trim()) {
      console.error(`error`);
      toast.error("Recipient Email is required");
      return;
    }

    const payload = {
      recipientName: formState.recipientName,
      recipientEmail: formState.recipientEmail,
      companyName: formState.companyName || undefined,
      role: formState.role || undefined,
      category: formState.category as any,
      subject: formState.subject || undefined,
      body: formState.body || undefined,
      status: formState.status as any,
      priority: formState.priority as any,
      sentDate: formState.sentDate ? new Date(formState.sentDate) : undefined,
      followUpDate: formState.followUpDate ? new Date(formState.followUpDate) : undefined,
      notes: formState.notes || undefined,
    };

    if (isEditing && selectedEmailId) {
      updateMutation.mutate({ id: selectedEmailId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteEmail = (id: string) => {
    if (confirm("Are you sure you want to delete this cold email?")) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = emails.filter((email) => {
    const matchesSearch =
      email.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (email.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      <PageHeader
        title="Cold Emails"
        description="Manage and track your outreach emails"
      >
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Generate
        </Button>
        <Button
          onClick={handleOpenAddDialog}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          <Plus className="h-4 w-4" />
          New Email
        </Button>
      </PageHeader>

      {/* Filters & View Toggle */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {EMAIL_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/20 self-start sm:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            className="h-8 w-8"
            title="Table View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email list */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No cold emails yet"
          description="Start your outreach campaign by composing a cold email or generating one with AI."
          actionLabel="Compose Email"
          onAction={handleOpenAddDialog}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((email, i) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group transition-all hover:shadow-sm">
                  <CardContent className="flex items-start gap-4 p-4 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {getPriorityDot(email.priority)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium truncate">
                          {email.recipientName}
                        </h3>
                        {getEmailStatusBadge(email.status)}
                      </div>
                      
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer hover:text-foreground text-muted-foreground select-none text-xs transition-colors mb-2 w-fit"
                        onClick={() => handleCopy(email.recipientEmail, `${email.id}-email`)}
                        title="Click to copy email"
                      >
                        {copiedKey === `${email.id}-email` ? (
                          <Check className="h-3 w-3 text-green-500 animate-in fade-in zoom-in duration-200" />
                        ) : (
                          <Mail className="h-3 w-3 shrink-0" />
                        )}
                        <span className={cn(
                          "truncate transition-all duration-200 origin-left",
                          copiedKey === `${email.id}-email` ? "scale-95 text-green-500 font-medium" : ""
                        )}>
                          {email.recipientEmail}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground truncate mb-1">
                        {email.role || "No Role"} {email.company?.name ? `at ${email.company.name}` : ""}
                      </div>
                      
                      {email.followUpDate && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" /> Follow-up: {new Date(email.followUpDate).toLocaleDateString()}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground truncate font-medium mb-3">
                        {email.subject || "No Subject"}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {EMAIL_CATEGORIES.find((c) => c.value === email.category)?.label}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenEditDialog(email)}
                            title="Edit Email"
                          >
                            <PanelRightOpen className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteEmail(email.id)}
                            title="Delete Email"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Company & Role</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Follow Up</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((email) => (
                <TableRow key={email.id} className="group">
                  <TableCell>
                    <div className="font-medium text-sm">{email.recipientName}</div>
                    <div
                      onClick={() => handleCopy(email.recipientEmail, `${email.id}-email`)}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-foreground text-muted-foreground select-none text-xs transition-colors mt-0.5"
                      title="Click to copy email"
                    >
                      {copiedKey === `${email.id}-email` ? (
                        <Check className="h-3 w-3 text-green-500 animate-in fade-in zoom-in duration-200" />
                      ) : (
                        <Mail className="h-3 w-3 shrink-0" />
                      )}
                      <span className={cn(
                        "truncate transition-all duration-200 origin-left",
                        copiedKey === `${email.id}-email` ? "scale-95 text-green-500 font-medium" : ""
                      )}>
                        {email.recipientEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {email.role || "No Role"}
                      {email.company?.name && (
                        <span className="text-muted-foreground block text-[11px]">
                          at {email.company.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {email.subject || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                      {EMAIL_CATEGORIES.find((c) => c.value === email.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getPriorityDot(email.priority)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {email.priority.toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getEmailStatusBadge(email.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {email.sentDate ? new Date(email.sentDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {email.followUpDate ? new Date(email.followUpDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleOpenEditDialog(email)}
                        title="Edit Email"
                      >
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteEmail(email.id)}
                        title="Delete Email"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* New/Edit Email Drawer */}
      <Sheet open={showNewDialog} onOpenChange={setShowNewDialog}>
        <SheetContent className="sm:max-w-md md:max-w-lg h-full flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>{isEditing ? "Edit Cold Email" : "New Cold Email"}</SheetTitle>
            <SheetDescription>
              {isEditing ? "Update your cold email details" : "Compose or AI-generate a new cold email"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /> Import from Contacts
              </Label>
              <Select
                onValueChange={(contactId) => {
                  const contact = contacts.find((c: any) => c.id === contactId);
                  if (contact) {
                    setFormState(prev => ({
                      ...prev,
                      recipientName: contact.name || prev.recipientName,
                      recipientEmail: contact.email || prev.recipientEmail,
                      companyName: contact.company?.name || prev.companyName,
                      role: contact.role || prev.role,
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a contact to auto-fill..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col items-start text-left truncate">
                        <span className="font-medium truncate">{c.name}</span>
                        {c.email && (
                          <span className="text-xs text-muted-foreground truncate">
                            {c.email}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Recipient Name *</Label>
                <Input 
                  placeholder="John Doe" 
                  value={formState.recipientName}
                  onChange={(e) => setFormState({ ...formState, recipientName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Recipient Email *</Label>
                <Input 
                  placeholder="john@company.com" 
                  type="email"
                  value={formState.recipientEmail}
                  onChange={(e) => setFormState({ ...formState, recipientEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Company</Label>
                <Input 
                  placeholder="Google" 
                  value={formState.companyName}
                  onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input 
                  placeholder="Software Engineer" 
                  value={formState.role}
                  onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select 
                  value={formState.category}
                  onValueChange={(v) => setFormState({ ...formState, category: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select 
                  value={formState.priority}
                  onValueChange={(v) => setFormState({ ...formState, priority: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select 
                  value={formState.status}
                  onValueChange={(v) => setFormState({ ...formState, status: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sent Date</Label>
                <Input 
                  type="date"
                  value={formState.sentDate}
                  onChange={(e) => setFormState({ ...formState, sentDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Follow Up Date</Label>
                <Input 
                  type="date"
                  value={formState.followUpDate}
                  onChange={(e) => setFormState({ ...formState, followUpDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input 
                placeholder="Re: Software Engineer Opportunity" 
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Email Body</Label>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2 text-indigo-500 hover:text-indigo-600">
                  <Sparkles className="h-3 w-3" />
                  AI Generate
                </Button>
              </div>
              <Textarea 
                placeholder="Write your email..." 
                rows={8} 
                value={formState.body}
                onChange={(e) => setFormState({ ...formState, body: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Internal notes..." 
                rows={3} 
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="p-6 border-t mt-auto flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={handleSaveEmail}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save Email"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
