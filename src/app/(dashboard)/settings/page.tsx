"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/config/constants";
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your preferences and configuration"
      />

      <div className="max-w-2xl space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
            <CardDescription>Basic application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="defaultFollowUp">Default Follow-up Days</Label>
              <Input
                id="defaultFollowUp"
                type="number"
                defaultValue={4}
                min={1}
                max={30}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Number of days after sending before follow-up reminder
              </p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="emailSig">Email Signature</Label>
              <Textarea
                id="emailSig"
                placeholder="Best regards,&#10;Your Name&#10;your@email.com"
                rows={4}
                defaultValue={"Best regards,\nJohn Doe\njohn@example.com\nhttps://linkedin.com/in/johndoe"}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Configuration</CardTitle>
            <CardDescription>Configure AI model and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>AI Model</Label>
              <Select defaultValue="gpt-4o-mini">
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the AI model for generating emails, analysis, and chat
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-generate follow-up emails</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically draft follow-up emails when due
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>AI Resume Parsing</Label>
                <p className="text-xs text-muted-foreground">
                  Auto-extract skills when uploading resumes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button variant="default" size="sm" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Follow-up Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified about upcoming follow-ups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Interview Reminders</Label>
                <p className="text-xs text-muted-foreground">Reminder 24 hours before interviews</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Reminders</Label>
                <p className="text-xs text-muted-foreground">Send email for important reminders</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
            <CardDescription>Export, import, or delete your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => toast.success("Export started")}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </div>
            <Separator />
            <div>
              <Button variant="destructive" className="gap-2" size="sm">
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <Button
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            onClick={() => toast.success("Settings saved")}
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
