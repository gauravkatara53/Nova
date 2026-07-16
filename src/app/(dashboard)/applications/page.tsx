"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/actions/applications";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Briefcase,
  Plus,
  Search,
  Filter,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  LayoutGrid,
  List,
  PanelRightOpen,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyLogo } from "@/components/CompanyLogo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPLICATION_STATUSES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getStatusBadge(status: string) {
  const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status);
  if (!statusConfig) return null;

  const colorMap: Record<string, string> = {
    WISHLIST: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    APPLIED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    OA: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    INTERVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    OFFER: "bg-green-500/10 text-green-500 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    WITHDRAWN: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium whitespace-nowrap", colorMap[status])}
    >
      {statusConfig.label}
    </Badge>
  );
}

const getInitialFormState = () => ({
  role: "",
  companyName: "",
  location: "",
  salary: "",
  status: "WISHLIST" as any,
  jobLink: "",
  notes: "",
  hasReferral: false,
  appliedDate: new Date().toISOString().split('T')[0],
});

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(getInitialFormState());
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getApplications(),
  });

  const createMut = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application created successfully!");
      setShowFormSheet(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to create application");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated successfully!");
      setShowFormSheet(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update application");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application deleted successfully!");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to delete application");
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Status updated!");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update status");
    },
  });

  const handleOpenForm = (app?: any) => {
    if (app) {
      setEditingId(app.id);
      setFormData({
        role: app.role || "",
        companyName: app.company?.name || "",
        location: app.location || "",
        salary: app.salary || "",
        status: app.status || "WISHLIST",
        jobLink: app.jobLink || "",
        notes: app.notes || "",
        hasReferral: app.hasReferral || false,
        appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : "",
      });
    } else {
      setEditingId(null);
      setFormData(getInitialFormState());
    }
    setShowFormSheet(true);
  };

  const handleOpenView = (app: any) => {
    setSelectedApp(app);
    setShowViewDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.role.trim()) {
      toast.error("Role is required");
      return;
    }

    const payload = {
      ...formData,
      appliedDate: formData.appliedDate ? new Date(formData.appliedDate) : undefined,
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const filtered = applications.filter((app: any) => {
    const matchesSearch =
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      <PageHeader
        title="Applications"
        description="Track and manage your job applications"
      >
        <Button
          onClick={() => handleOpenForm()}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </PageHeader>

      {/* Filters & View Toggle */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
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
              {APPLICATION_STATUSES.map((s) => (
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

      {/* Application list */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your job applications to stay organized and never miss a deadline."
          actionLabel="Add Application"
          onAction={() => handleOpenForm()}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((app: any, i: number) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group transition-all hover:shadow-sm">
                  <CardContent className="flex items-start gap-4 p-4 relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      <CompanyLogo
                        logo={app.company?.logo}
                        website={app.company?.website}
                        name={app.company?.name}
                        className="h-6 w-6 object-contain rounded-sm"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium truncate">
                          {app.role}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="text-xs text-muted-foreground truncate mb-2">
                        {app.company?.name || "Unknown Company"}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.location}
                          </span>
                        )}
                        {app.salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {app.salary}
                          </span>
                        )}
                        {app.appliedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(app.appliedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2">
                          {app.jobLink && (
                            <a
                              href={app.jobLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenView(app)}
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenForm(app)}
                            title="Edit Application"
                          >
                            <PanelRightOpen className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this application?")) {
                                deleteMut.mutate(app.id);
                              }
                            }}
                            title="Delete Application"
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
                <TableHead>Role & Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app: any) => (
                <TableRow key={app.id} className="group">
                  <TableCell>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                        <CompanyLogo
                          logo={app.company?.logo}
                          website={app.company?.website}
                          name={app.company?.name}
                          className="h-4 w-4 object-contain rounded-sm"
                        />
                      </div>
                      <div className="truncate">
                        {app.role}
                        <span className="text-muted-foreground block text-[11px]">
                          at {app.company?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {app.location || "-"}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {app.salary || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="cursor-pointer appearance-none bg-transparent border-none p-0 text-left">
                            {getStatusBadge(app.status)}
                          </button>
                        }
                      />
                      <DropdownMenuContent>
                        {APPLICATION_STATUSES.map((s) => (
                          <DropdownMenuItem 
                            key={s.value} 
                            onClick={() => statusMut.mutate({ id: app.id, status: s.value })}
                          >
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {app.jobLink && (
                        <a
                          href={app.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleOpenView(app)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleOpenForm(app)}
                        title="Edit Application"
                      >
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this application?")) {
                            deleteMut.mutate(app.id);
                          }
                        }}
                        title="Delete Application"
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

      {/* New/Edit Application Sheet (Drawer) */}
      <Sheet open={showFormSheet} onOpenChange={setShowFormSheet}>
        <SheetContent className="sm:max-w-md md:max-w-lg h-full flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>{editingId ? "Edit Application" : "Add Application"}</SheetTitle>
            <SheetDescription>
              {editingId ? "Update job application details" : "Track a new job application"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="Software Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Google"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  placeholder="$150k - $200k"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="app-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="app-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appliedDate">Applied Date</Label>
              <Input
                id="appliedDate"
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobLink">Job Link</Label>
              <Input
                id="jobLink"
                placeholder="https://..."
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-notes">Notes</Label>
              <Textarea
                id="app-notes"
                placeholder="Any additional notes..."
                rows={5}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="p-6 border-t mt-auto flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFormSheet(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              onClick={handleSubmit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingId ? "Save Changes" : "Add Application"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* View Application Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase">Role</Label>
                <div className="font-medium">{selectedApp.role}</div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase">Company</Label>
                <div className="font-medium">{selectedApp.company?.name || "N/A"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Location</Label>
                  <div className="font-medium">{selectedApp.location || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Salary</Label>
                  <div className="font-medium">{selectedApp.salary || "N/A"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Applied Date</Label>
                  <div className="font-medium">
                    {selectedApp.appliedDate
                      ? new Date(selectedApp.appliedDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
              {selectedApp.jobLink && (
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Job Link</Label>
                  <div>
                    <a
                      href={selectedApp.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Posting
                    </a>
                  </div>
                </div>
              )}
              {selectedApp.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Notes</Label>
                  <div className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedApp.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
