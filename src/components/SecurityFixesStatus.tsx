import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, AlertTriangle } from "lucide-react";

export const SecurityFixesStatus = () => {
  const fixes = [
    {
      category: "Rate Limiting",
      status: "fixed",
      description: "Resolved conflicting RLS policies on rate limiting tables",
      priority: "high"
    },
    {
      category: "CMS Content Access", 
      status: "fixed",
      description: "Secured global CMS content to require authentication",
      priority: "medium"
    },
    {
      category: "Enhanced Monitoring",
      status: "implemented", 
      description: "Added rate limit bypass detection and admin access logging",
      priority: "low"
    },
    {
      category: "Console Logging",
      status: "in-progress",
      description: "Replacing console.log statements with secure logging",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fixed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "implemented": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium": return <Shield className="h-4 w-4 text-yellow-500" />;
      case "low": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Fixes Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fixes.map((fix, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50">
            <div className="flex items-center gap-3">
              {getPriorityIcon(fix.priority)}
              <div>
                <h4 className="font-medium text-sm">{fix.category}</h4>
                <p className="text-xs text-muted-foreground">{fix.description}</p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(fix.status)}>
              {fix.status.replace("-", " ").toUpperCase()}
            </Badge>
          </div>
        ))}
        <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✅ Critical security vulnerabilities have been resolved
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Rate limiting and authentication controls are now properly secured
          </p>
        </div>
      </CardContent>
    </Card>
  );
};