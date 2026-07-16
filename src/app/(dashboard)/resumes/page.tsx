"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumes, uploadAndParseResume, deleteResume, setActiveResume } from "@/actions/resumes";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Upload,
  Star,
  MoreHorizontal,
  Sparkles,
  Download,
  Trash2,
  Check,
  Search,
  LayoutGrid,
  List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";



export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [file, setFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: getResumes,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAndParseResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume uploaded and parsed successfully");
      setShowUploadDialog(false);
      setFile(null);
      setResumeName("");
    },
    onError: (error) => {
      console.error(`error`);
      toast.error("Failed to upload resume");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: setActiveResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Active resume updated");
    },
  });

  const handleUpload = () => {
    if (!file) {
      console.error(`error`);
      toast.error("Please select a file");
      return;
    }
    if (!resumeName) {
      console.error(`error`);
      toast.error("Please enter a resume name");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", resumeName);
    formData.append("isActive", isActive.toString());

    uploadMutation.mutate(formData);
  };

  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch = resume.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resume.techStack.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Resumes"
        description="Manage your resumes and let AI extract key information"
      >
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
        >
          <Upload className="h-4 w-4" />
          Upload Resume
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search resumes or skills..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 border rounded-md p-1 w-full sm:w-auto">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 w-8 px-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="sm"
            className="h-8 w-8 px-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your resume and let AI extract skills, experience, and projects automatically."
          actionLabel="Upload Resume"
          onAction={() => setShowUploadDialog(true)}
        />
      ) : filteredResumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Search className="h-8 w-8 mb-4 opacity-50" />
          <p className="text-sm font-medium">No resumes found matching your search.</p>
          <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">Clear search</Button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredResumes.map((resume, i) => {
            
            const DropdownActions = () => (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>} />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveMutation.mutate(resume.id)}>
                    <Star className="mr-2 h-3.5 w-3.5" />
                    Set as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    AI Parse
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(resume.id)}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );

            return (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "group relative transition-all hover:shadow-sm",
                  resume.isActive && "ring-2 ring-violet-500/50"
                )}
              >
                <CardContent className={cn(
                  "p-4",
                  viewMode === "list" ? "flex flex-col sm:flex-row sm:items-center gap-4" : "pt-5"
                )}>
                  <div className={cn(
                    "flex items-start justify-between",
                    viewMode === "list" && "sm:w-1/3 min-w-0 shrink-0"
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{resume.name}</h3>
                          {resume.isActive && (
                            <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] px-1.5 py-0 h-4 shrink-0 leading-tight inline-flex items-center">
                              <Check className="mr-0.5 h-2.5 w-2.5" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {resume.fileName}
                        </p>
                      </div>
                    </div>
                    {viewMode === "grid" && <DropdownActions />}
                  </div>

                  {/* Skills */}
                  <div className={cn("flex-1 min-w-0", viewMode === "grid" ? "mt-3" : "mt-0")}>
                    {viewMode === "grid" && (
                      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Skills
                      </p>
                    )}
                    <div className={cn("flex flex-wrap gap-1", viewMode === "list" && "max-h-[22px] overflow-hidden sm:flex-nowrap sm:mask-image-right")}>
                      {resume.techStack.slice(0, viewMode === "list" ? 5 : undefined).map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-[10px] font-normal h-5 px-1.5 whitespace-nowrap"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {viewMode === "list" && resume.techStack.length > 5 && (
                        <Badge variant="outline" className="text-[10px] font-normal h-5 px-1.5 text-muted-foreground whitespace-nowrap">
                          +{resume.techStack.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={cn(
                    "flex items-center justify-between text-[11px] text-muted-foreground",
                    viewMode === "grid" ? "mt-3 border-t pt-3" : "sm:w-48 shrink-0 justify-end gap-3"
                  )}>
                    <span className="whitespace-nowrap">
                      {viewMode === "grid" ? "Updated " : ""}{new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                    {viewMode === "grid" && (
                      <span className="whitespace-nowrap">{resume.skills.length} skills extracted</span>
                    )}
                    {viewMode === "list" && <DropdownActions />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )})}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload a PDF and AI will extract skills and experience
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Resume Name *</Label>
              <Input 
                placeholder="Full Stack Resume" 
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
              />
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                "rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                dragActive
                  ? "border-violet-500 bg-violet-500/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                file ? "border-violet-500 bg-violet-500/5" : ""
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                  if (!resumeName) {
                    setResumeName(e.dataTransfer.files[0].name.replace(".pdf", ""));
                  }
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!resumeName) {
                      setResumeName(e.target.files[0].name.replace(".pdf", ""));
                    }
                  }
                }}
              />
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Drag & drop your PDF here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {file ? "Click to change file" : "or click to browse"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="set-active" className="text-sm">
                Set as active resume
              </Label>
              <Switch 
                id="set-active" 
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !file || !resumeName}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {uploadMutation.isPending ? "Parsing..." : "Upload & Parse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
