"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, createContact, updateContact, deleteContact } from "@/actions/contacts";
import { getCompanies } from "@/actions/companies";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  Plus,
  Search,
  Star,
  MoreHorizontal,
  Mail,
  Link2,
  Phone,
  Copy,
  LayoutGrid,
  List,
  Check,
  Trash2,
  PanelRightOpen,
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
import { CONTACT_CATEGORIES, CONTACT_STATUSES } from "@/config/constants";
import { cn, getInitials } from "@/lib/utils";

function getContactStatusBadge(status: string) {
  const colorMap: Record<string, string> = {
    NO_CONTACT: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    CONTACTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    REPLIED: "bg-green-500/10 text-green-500 border-green-500/20",
    INTERVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    OFFER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  const statusConfig = CONTACT_STATUSES.find((s) => s.value === status);
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", colorMap[status])}>
      {statusConfig?.label || status}
    </Badge>
  );
}

function RelationshipStars({ strength, onChange }: { strength: number; onChange?: (s: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          onClick={() => onChange?.(i + 1)}
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            onChange ? "cursor-pointer hover:scale-110" : "",
            i < strength
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [companyFocus, setCompanyFocus] = useState(false);
  const [roleFocus, setRoleFocus] = useState(false);

  const SUGGESTED_ROLES = [
    "SDE INTERN",
    "SOFTWARE ENGINEER INTERN",
    "SDE",
    "SOFTWARE ENGINEER",
    "AI ENGINEER",
    "DATA ENGINEER"
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  // Form State
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    companyName: "",
    role: "",
    linkedin: "",
    phone: "",
    category: "OTHER" as any,
    status: "NO_CONTACT" as any,
    notes: "",
    relationshipStrength: 1,
    tagsInput: "",
  });

  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact added successfully");
      setShowNewDialog(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to add contact");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated successfully");
      setShowNewDialog(false);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted successfully");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to delete contact");
    },
  });

  const handleOpenAddDialog = () => {
    setFormState({
      name: "",
      email: "",
      companyName: "",
      role: "",
      linkedin: "",
      phone: "",
      category: "OTHER",
      status: "NO_CONTACT",
      notes: "",
      relationshipStrength: 1,
      tagsInput: "",
    });
    setIsEditing(false);
    setSelectedContactId(null);
    setShowNewDialog(true);
  };

  const handleOpenEditDialog = (contact: any) => {
    setFormState({
      name: contact.name,
      email: contact.email || "",
      companyName: contact.company?.name || "",
      role: contact.role || "",
      linkedin: contact.linkedin || "",
      phone: contact.phone || "",
      category: contact.category,
      status: contact.status,
      notes: contact.notes || "",
      relationshipStrength: contact.relationshipStrength,
      tagsInput: contact.tags ? contact.tags.join(", ") : "",
    });
    setIsEditing(true);
    setSelectedContactId(contact.id);
    setShowNewDialog(true);
  };

  const handleSaveContact = () => {
    if (!formState.name.trim()) {
      console.error(`error`);
      toast.error("Name is required");
      return;
    }

    const payload = {
      name: formState.name,
      email: formState.email || undefined,
      linkedin: formState.linkedin || undefined,
      phone: formState.phone || undefined,
      companyName: formState.companyName || undefined,
      role: formState.role || undefined,
      category: formState.category,
      relationshipStrength: formState.relationshipStrength,
      status: formState.status,
      notes: formState.notes || undefined,
      tags: formState.tagsInput
        ? formState.tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [],
    };

    if (isEditing && selectedContactId) {
      updateMutation.mutate({ id: selectedContactId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteContact = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage your networking connections"
      >
        <Button
          onClick={handleOpenAddDialog}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {CONTACT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add your networking contacts to keep track of your professional relationships."
          actionLabel="Add Contact"
          onAction={handleOpenAddDialog}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group transition-all hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-xs text-white">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium">{contact.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {contact.role || "No Role"} {contact.company?.name ? `at ${contact.company.name}` : ""}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(contact)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (contact.email) {
                              navigator.clipboard.writeText(contact.email);
                              toast.success("Email copied to clipboard");
                            } else {
                              console.error(`error`);
      toast.error("Contact does not have an email address");
                            }
                          }}>Copy Email</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(contact.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
                          {getContactStatusBadge(contact.status)}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {CONTACT_STATUSES.map(status => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => {
                                updateMutation.mutate({ id: contact.id, data: { status: status.value as any } });
                              }}
                            >
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Badge variant="outline" className="text-[10px]">
                        {CONTACT_CATEGORIES.find((c) => c.value === contact.category)?.label}
                      </Badge>
                    </div>

                    {/* Contact Details (Email & Phone) */}
                    {(contact.email || contact.phone) && (
                      <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                        {contact.email && (
                          <div 
                            className="flex items-center justify-between group/item cursor-pointer hover:text-foreground transition-colors select-none"
                            onClick={() => handleCopy(contact.email as string, `${contact.id}-email`)}
                            title="Click to copy email"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {copiedKey === `${contact.id}-email` ? (
                                <Check className="h-3 w-3 text-green-500 animate-in fade-in zoom-in duration-200" />
                              ) : (
                                <Mail className="h-3 w-3 shrink-0" />
                              )}
                              <span className={cn(
                                "truncate transition-all duration-200 origin-left",
                                copiedKey === `${contact.id}-email` ? "scale-95 text-green-500 font-medium" : ""
                              )}>
                                {contact.email}
                              </span>
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              {copiedKey === `${contact.id}-email` ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                        {contact.phone && (
                          <div 
                            className="flex items-center justify-between group/item cursor-pointer hover:text-foreground transition-colors select-none"
                            onClick={() => handleCopy(contact.phone as string, `${contact.id}-phone`)}
                            title="Click to copy phone number"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {copiedKey === `${contact.id}-phone` ? (
                                <Check className="h-3 w-3 text-green-500 animate-in fade-in zoom-in duration-200" />
                              ) : (
                                <Phone className="h-3 w-3 shrink-0" />
                              )}
                              <span className={cn(
                                "truncate transition-all duration-200 origin-left",
                                copiedKey === `${contact.id}-phone` ? "scale-95 text-green-500 font-medium" : ""
                              )}>
                                {contact.phone}
                              </span>
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              {copiedKey === `${contact.id}-phone` ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <RelationshipStars strength={contact.relationshipStrength} />
                      <div className="flex gap-1">
                        {contact.linkedin && (
                          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {contact.tags && contact.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {contact.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {contact.lastContactDate && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Last contact: {new Date(contact.lastContactDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company & Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead className="w-[120px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow key={contact.id} className="group">
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {contact.role || "No Role"}
                      {contact.company?.name && (
                        <span className="text-muted-foreground block text-[11px]">
                          at {contact.company.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <div
                        onClick={() => handleCopy(contact.email as string, `${contact.id}-email`)}
                        className="flex items-center gap-1.5 cursor-pointer hover:text-foreground text-muted-foreground select-none text-xs transition-colors"
                        title="Click to copy email"
                      >
                        {copiedKey === `${contact.id}-email` ? (
                          <Check className="h-3.5 w-3.5 text-green-500 animate-in fade-in zoom-in duration-200" />
                        ) : (
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className={cn(
                          "transition-all duration-200 origin-left",
                          copiedKey === `${contact.id}-email` ? "scale-95 text-green-500 font-medium" : ""
                        )}>
                          {contact.email}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <div
                        onClick={() => handleCopy(contact.phone as string, `${contact.id}-phone`)}
                        className="flex items-center gap-1.5 cursor-pointer hover:text-foreground text-muted-foreground select-none text-xs transition-colors"
                        title="Click to copy phone number"
                      >
                        {copiedKey === `${contact.id}-phone` ? (
                          <Check className="h-3.5 w-3.5 text-green-500 animate-in fade-in zoom-in duration-200" />
                        ) : (
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className={cn(
                          "transition-all duration-200 origin-left",
                          copiedKey === `${contact.id}-phone` ? "scale-95 text-green-500 font-medium" : ""
                        )}>
                          {contact.phone}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                      {CONTACT_CATEGORIES.find((c) => c.value === contact.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
                        {getContactStatusBadge(contact.status)}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {CONTACT_STATUSES.map(status => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => {
                              updateMutation.mutate({ id: contact.id, data: { status: status.value as any } });
                            }}
                          >
                            {status.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <RelationshipStars strength={contact.relationshipStrength} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {contact.linkedin ? (
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <Link2 className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-25 cursor-not-allowed" disabled title="No LinkedIn link">
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEditDialog(contact)}
                        title="Open Details (Edit)"
                      >
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteContact(contact.id)}
                        title="Delete Contact"
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

      <Sheet open={showNewDialog} onOpenChange={setShowNewDialog}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl h-full flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>{isEditing ? "Edit Contact" : "Add Contact"}</SheetTitle>
            <SheetDescription>{isEditing ? "Update networking contact details" : "Add a new networking contact"}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@company.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 relative">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  placeholder="Google"
                  value={formState.companyName}
                  onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                  onFocus={() => setCompanyFocus(true)}
                  onBlur={() => setTimeout(() => setCompanyFocus(false), 200)}
                  autoComplete="off"
                />
                {companyFocus && formState.companyName.length >= 1 && (
                  (() => {
                    const filtered = companies.filter(c => 
                      c.name.toLowerCase().includes(formState.companyName.toLowerCase()) && 
                      c.name.toLowerCase() !== formState.companyName.toLowerCase()
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 w-full bg-popover text-popover-foreground border rounded-md shadow-md top-[68px] max-h-48 overflow-y-auto">
                        {filtered.map(c => (
                          <div
                            key={c.id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                            onClick={() => setFormState({ ...formState, companyName: c.name })}
                          >
                            {c.name}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="contact-role">Role</Label>
                <Input
                  id="contact-role"
                  placeholder="Software Engineer"
                  value={formState.role}
                  onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                  onFocus={() => setRoleFocus(true)}
                  onBlur={() => setTimeout(() => setRoleFocus(false), 200)}
                  autoComplete="off"
                />
                {roleFocus && formState.role.length >= 1 && (
                  (() => {
                    const filtered = SUGGESTED_ROLES.filter(r => 
                      r.toLowerCase().includes(formState.role.toLowerCase()) && 
                      r.toLowerCase() !== formState.role.toLowerCase()
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 w-full bg-popover text-popover-foreground border rounded-md shadow-md top-[68px] max-h-48 overflow-y-auto">
                        {filtered.map(r => (
                          <div
                            key={r}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                            onClick={() => setFormState({ ...formState, role: r })}
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-linkedin">LinkedIn</Label>
                <Input
                  id="contact-linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={formState.linkedin}
                  onChange={(e) => setFormState({ ...formState, linkedin: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1 (555) 000-0000"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(val) => setFormState({ ...formState, category: val as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(val) => setFormState({ ...formState, status: val as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Relationship Strength</Label>
                <div className="flex h-10 items-center">
                  <RelationshipStars
                    strength={formState.relationshipStrength}
                    onChange={(s) => setFormState({ ...formState, relationshipStrength: s })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-tags">Tags (comma separated)</Label>
                <Input
                  id="contact-tags"
                  placeholder="Recruitment, Technical, Referral"
                  value={formState.tagsInput}
                  onChange={(e) => setFormState({ ...formState, tagsInput: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-notes">Notes</Label>
              <Textarea
                id="contact-notes"
                placeholder="Any notes about this contact..."
                rows={3}
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="p-6 border-t mt-auto flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={handleSaveContact}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Contact"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
