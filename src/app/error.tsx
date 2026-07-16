"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console as requested by the user
    console.error("Application crashed with error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-lg border-red-500/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-base mt-2">
            An unexpected error occurred and the application could not continue.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mt-4 rounded-md bg-muted p-4 border overflow-hidden">
            <p className="text-sm font-medium text-destructive mb-1 font-mono">Error Details:</p>
            <p className="text-xs text-muted-foreground font-mono break-all line-clamp-4">
              {error.message || "Unknown error occurred"}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/" className="w-full block">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
