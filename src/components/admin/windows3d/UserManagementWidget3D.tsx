import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Crown, GraduationCap, Wrench } from "lucide-react";
import { SecurePIIDisplay } from "@/components/SecurePIIDisplay";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
    phone: string;
    title: string;
    company: string;
  } | null;
}

interface UserManagementWidget3DProps {
  userRoles: UserRole[];
  onAssignRole: (userId: string, role: string) => void;
  onRevokeRole: (userId: string) => void;
  loading: boolean;
}

export const UserManagementWidget3D: React.FC<UserManagementWidget3DProps> = ({ 
  userRoles, 
  onAssignRole, 
  onRevokeRole, 
  loading 
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      case 'tech_support_admin': return 'outline';
      default: return 'outline';
    }
  };

  const displayedUsers = userRoles.slice(0, 5);

  return (
    <div className="w-full h-full">
      <Card className="h-full border-border/50 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : displayedUsers.length > 0 ? (
            displayedUsers.map((userRole) => (
              <div key={userRole.id} className="p-3 bg-white/70 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    <SecurePIIDisplay 
                      value={userRole.profiles?.name || null} 
                      type="name" 
                      showMaskingIndicator={false}
                    />
                  </div>
                  <Badge variant={getRoleBadgeVariant(userRole.role)}>{userRole.role}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => onAssignRole(userRole.user_id, 'admin')} className="h-6 w-6 p-0">
                    <UserCheck className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onRevokeRole(userRole.user_id)} className="h-6 w-6 p-0">
                    <UserX className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};