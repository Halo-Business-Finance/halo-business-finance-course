import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { captureError } from "@/utils/errorMonitoring";
import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  useEffect(() => {
    // Log error to monitoring service
    captureError(error, { 
      componentStack: 'ErrorBoundary',
      errorBoundary: true 
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {import.meta.env.DEV && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetErrorBoundary} 
              className="flex-1"
              variant="default"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
