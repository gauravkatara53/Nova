"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Sparkles,
  FileText,
  Upload,
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Code,
  Zap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getResumes } from "@/actions/resumes";
import { checkEligibility } from "@/actions/eligibility";
import { toast } from "sonner";
import { type EligibilityResult } from "@/lib/validators";

function getFitColor(category: string) {
  switch (category) {
    case "Excellent Fit": return "text-emerald-500";
    case "Good Fit": return "text-blue-500";
    case "Maybe": return "text-yellow-500";
    default: return "text-red-500";
  }
}

export default function EligibilityPage() {
  const [jdText, setJdText] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const { data: resumes = [], isLoading: isLoadingResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: getResumes,
  });

  // Set default active resume if available
  if (!selectedResumeId && resumes.length > 0) {
    const active = resumes.find(r => r.isActive);
    if (active) setSelectedResumeId(active.id);
    else setSelectedResumeId(resumes[0].id);
  }

  const checkMutation = useMutation({
    mutationFn: () => checkEligibility(selectedResumeId, jdText),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete");
    },
    onError: (error) => {
      console.error(`error`);
      toast.error("Failed to analyze resume");
    }
  });

  const handleAnalyze = () => {
    if (!selectedResumeId) {
      console.error(`error`);
      toast.error("Please select a resume");
      return;
    }
    checkMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Eligibility Checker"
        description="Check how well your resume matches a job description"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                rows={12}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="resize-none"
              />
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-3.5 w-3.5" />
                  Upload JD PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Select Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedResumeId} onValueChange={(val) => setSelectedResumeId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingResumes ? "Loading resumes..." : "Select a resume"} />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map(resume => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name} {resume.isActive && "(Active)"}
                    </SelectItem>
                  ))}
                  {resumes.length === 0 && (
                    <SelectItem value="none" disabled>No resumes found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={!jdText || !selectedResumeId || checkMutation.isPending}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            size="lg"
          >
            {checkMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Match
              </>
            )}
          </Button>
        </div>

        {/* Results section */}
        <div className="space-y-4">
          {!result ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div>
                <Target className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  Paste a job description and click Analyze
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  AI will compare your resume and provide detailed analysis
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Overall Score */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Overall Match</p>
                      <p className="text-3xl font-bold">{result.overallMatch}%</p>
                    </div>
                    <Badge className={cn("text-sm px-3 py-1", getFitColor(result.fitCategory))}>
                      {result.fitCategory}
                    </Badge>
                  </div>
                  <Progress value={result.overallMatch} className="h-2" />
                </CardContent>
              </Card>

              {/* Score grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">ATS Score</p>
                    <p className="text-xl font-bold">{result.atsScore}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Interview Chance</p>
                    <p className="text-xl font-bold">{result.estimatedInterviewChance}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Resume Pass</p>
                    <p className="text-xl font-bold">{result.estimatedResumePassRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Probability</p>
                    <p className="text-xl font-bold">{result.probability}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Strong & Missing Skills */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs text-green-500">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Strong Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {result.strongSkills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] bg-green-500/5 text-green-500 border-green-500/20">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs text-red-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {result.missingSkills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] bg-red-500/5 text-red-500 border-red-500/20">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Eligibility Details */}
              {(result.batchEligibility || result.experienceRequired || result.branchAndCourse || result.cgpa || result.isEligible !== undefined) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs">
                      <Target className="h-3.5 w-3.5" />
                      Eligibility Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.isEligible !== undefined && (
                      <div className="flex flex-col p-2.5 bg-muted/50 rounded-md border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Status</span>
                        <Badge className={cn("w-fit text-xs border-transparent", result.isEligible ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-600 hover:bg-red-500/25")} variant="outline">
                          {result.isEligible ? "Eligible" : "Not Eligible"}
                        </Badge>
                      </div>
                    )}
                    {result.batchEligibility && (
                      <div className="flex flex-col p-2.5 bg-muted/50 rounded-md border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Batch Eligibility</span>
                        <span className="text-xs font-medium">{result.batchEligibility}</span>
                      </div>
                    )}
                    {result.branchAndCourse && (
                      <div className="flex flex-col p-2.5 bg-muted/50 rounded-md border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Branch & Course</span>
                        <span className="text-xs font-medium">{result.branchAndCourse}</span>
                      </div>
                    )}
                    {result.cgpa && (
                      <div className="flex flex-col p-2.5 bg-muted/50 rounded-md border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">CGPA Required</span>
                        <span className="text-xs font-medium">{result.cgpa}</span>
                      </div>
                    )}
                    {result.experienceRequired && (
                      <div className="flex flex-col p-2.5 bg-muted/50 rounded-md border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Experience Required</span>
                        <span className="text-xs font-medium">{result.experienceRequired}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Gap Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.gapAnalysis}</p>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Zap className="h-3.5 w-3.5" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Courses & Projects */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs">
                      <BookOpen className="h-3.5 w-3.5" />
                      Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.coursesToLearn.map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{c}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs">
                      <Code className="h-3.5 w-3.5" />
                      Projects to Build
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.projectsToBuild.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{p}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
