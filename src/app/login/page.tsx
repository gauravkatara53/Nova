"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Globe, GitBranch } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password: "demo", callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[40%] h-[80%] w-[60%] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[10%] h-[80%] w-[60%] rounded-full bg-gradient-to-br from-blue-600/10 to-cyan-600/10 blur-3xl" />
        <div className="absolute left-[40%] top-[20%] h-[40%] w-[30%] rounded-full bg-gradient-to-br from-purple-600/5 to-pink-600/5 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="mb-2 flex h-16 items-center justify-center overflow-hidden"
          >
            <Image src="/logo-full-light.png" alt="Nova Logo" width={200} height={64} className="object-contain block dark:hidden" />
            <Image src="/logo-full-dark.png" alt="Nova Logo" width={200} height={64} className="object-contain hidden dark:block" />
          </motion.div>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Job Application CRM
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage your job search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-10"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Globe className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-10"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email login */}
            <form onSubmit={handleCredentialsLogin} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  defaultValue="demo"
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                className="h-10 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Demo mode: Enter any email to get started
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
