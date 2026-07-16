"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "@/actions/companies";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Plus,
  Search,
  Globe,
  MoreHorizontal,
  Users,
  Mail,
  Briefcase,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyLogo } from "@/components/CompanyLogo";



export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultFormData = {
    name: "",
    domain: "",
    industry: "",
    size: "",
    website: "",
    location: "",
    notes: "",
    techStack: [] as string[],
  };
  const [formData, setFormData] = useState(defaultFormData);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company created successfully");
      setShowNewDialog(false);
      setFormData(defaultFormData);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to create company");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company updated successfully");
      setShowNewDialog(false);
      setFormData(defaultFormData);
      setEditingId(null);
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to update company");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deleted successfully");
    },
    onError: (error: any) => {
      console.error(`error`);
      toast.error("Failed to delete company");
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      console.error(`error`);
      toast.error("Company name is required");
      return;
    }
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (company: any) => {
    setEditingId(company.id);
    setFormData({
      name: company.name || "",
      domain: company.domain || "",
      industry: company.industry || "",
      size: company.size || "",
      website: company.website || "",
      location: company.location || "",
      notes: company.notes || "",
      techStack: company.techStack || [],
    });
    setShowNewDialog(true);
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Your company database"
      >
        <Button
          onClick={() => setShowNewDialog(true)}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add companies you're interested in to organize your job search."
          actionLabel="Add Company"
          onAction={() => setShowNewDialog(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group transition-all hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                          <CompanyLogo
                            logo={company.logo}
                            website={company.website}
                            name={company.name}
                            className="h-7 w-7 object-contain rounded-sm"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{company.name}</h3>
                          <p className="text-xs text-muted-foreground">{company.industry || "No Industry"}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(company)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            AI Research
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this company?")) {
                                deleteMutation.mutate(company.id);
                              }
                            }}
                          >Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {company.location && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {company.location}
                        </span>
                      )}
                      {company.size && <span>{company.size} employees</span>}
                    </div>

                    {/* Tech stack tags */}
                    {company.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {company.techStack.slice(0, 4).map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-[10px] font-normal h-5 px-1.5"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {company.techStack.length > 4 && (
                          <Badge variant="outline" className="text-[10px] font-normal h-5 px-1.5">
                            +{company.techStack.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company._count.contacts} contacts
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {company._count.coldEmails} emails
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {company._count.applications} apps
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showNewDialog} onOpenChange={(open) => {
        setShowNewDialog(open);
        if (!open) {
          setEditingId(null);
          setFormData(defaultFormData);
        }
      }}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Company" : "Add Company"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update company details" : "Add a new company to your database"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Company Name *</Label>
                  <Input 
                    placeholder="Google" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Domain</Label>
                  <Input 
                    placeholder="google.com" 
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Industry</Label>
                  <Input 
                    placeholder="Technology"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Size</Label>
                  <Input 
                    placeholder="10,000+"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input 
                    placeholder="https://google.com" 
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="Mountain View, CA" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Notes about this company..." 
                  rows={3} 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowNewDialog(false);
                setEditingId(null);
                setFormData(defaultFormData);
              }}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? "Save Changes" : "Add Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
