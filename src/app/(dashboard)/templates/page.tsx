"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/actions/templates";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  FileCode
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TEMPLATE_CATEGORIES } from "@/config/constants";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

const defaultFormState = {
  name: "",
  category: "referral",
  subject: "",
  body: "",
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => getTemplates(),
  });

  const extractVariables = (text: string) => {
    const matches = Array.from(text.matchAll(/\{([^}]+)\}/g));
    return Array.from(new Set(matches.map(m => m[1])));
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => createTemplate({ ...data, variables: extractVariables(data.subject + " " + data.body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error(`error`);
      console.error(`error`);
      toast.error("Failed to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateTemplate(data.id, { 
      ...data.payload, 
      variables: extractVariables(data.payload.subject + " " + data.payload.body) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error(`error`);
      console.error(`error`);
      toast.error("Failed to update template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      console.error(`error`);
      console.error(`error`);
      toast.error("Failed to delete template");
    },
  });

  const filtered = templates.filter((t: any) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenForm = (template?: any) => {
    if (template) {
      setEditingId(template.id);
      setFormState({
        name: template.name,
        category: template.category,
        subject: template.subject,
        body: template.body,
      });
    } else {
      setEditingId(null);
      setFormState(defaultFormState);
    }
    setShowFormDialog(true);
  };

  const handleCloseForm = () => {
    setShowFormDialog(false);
    setTimeout(() => {
      setFormState(defaultFormState);
      setEditingId(null);
    }, 200);
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.subject || !formState.body) {
      console.error(`error`);
      toast.error("Please fill in all required fields");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: formState });
    } else {
      createMutation.mutate(formState);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Pre-built and custom email templates with rich text formatting"
      >
        <Button
          onClick={() => handleOpenForm()}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileCode as any}
          title="No templates found"
          description={
            searchQuery
              ? "No templates match your search query."
              : "You haven't created any templates yet."
          }
          actionLabel="Create your first template"
          onAction={() => handleOpenForm()}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((template: any, i: number) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="group cursor-pointer transition-all hover:shadow-sm h-full flex flex-col"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{template.name}</h3>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {template.category}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-muted"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm(template);
                          }}>
                            <Edit className="mr-2 h-3.5 w-3.5" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this template?")) {
                                deleteMutation.mutate(template.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground line-clamp-3 flex-grow prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: template.body }} />
                      

                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((v: string) => (
                        <span key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {`{${v}}`}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline">{previewTemplate?.category}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <p className="text-sm font-medium">{previewTemplate?.subject}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Body</Label>
              <div 
                className="mt-1 rounded-lg bg-muted p-4 text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: previewTemplate?.body || "" }}
              />
            </div>
            {previewTemplate?.variables?.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Detected Variables</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {previewTemplate.variables.map((v: string) => (
                    <Badge key={v} variant="outline" className="text-[10px]">{`{${v}}`}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button
              className="gap-2"
              onClick={() => {
                handleOpenForm(previewTemplate);
                setPreviewTemplate(null);
              }}
            >
              <Edit className="h-4 w-4" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New/Edit Template Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-5xl sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>Create a reusable rich text email template</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input 
                  placeholder="Template name" 
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select 
                  value={formState.category || ""} 
                  onValueChange={(val) => setFormState({ ...formState, category: val as string })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Subject *</Label>
              <Input 
                placeholder="Email subject (use {variable} for placeholders)" 
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex justify-between items-center">
                <span>Body *</span>
                <span className="text-[10px] text-muted-foreground font-normal">Use {"{variableName}"} to add dynamic fields</span>
              </Label>
              <RichTextEditor 
                value={formState.body || ""}
                onChange={(html) => setFormState({ ...formState, body: html })}
                placeholder="Write your template here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm} disabled={isSaving}>Cancel</Button>
            <Button 
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white min-w-[120px]"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
