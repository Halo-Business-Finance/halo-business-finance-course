import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCheck } from "lucide-react";

export function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const makeCurrentUserAdmin = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('setup_initial_admin');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: data || "Admin role assigned successfully. Please refresh the page.",
      });
      
      // Refresh the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Setup Required</CardTitle>
          <CardDescription>
            You need admin privileges to access the dashboard. Click the button below to assign yourself admin role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={makeCurrentUserAdmin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {loading ? "Setting up..." : "Make Me Admin"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            This is a one-time setup. The page will refresh automatically after assignment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}