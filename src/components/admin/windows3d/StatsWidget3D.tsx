import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, AlertTriangle, Activity } from "lucide-react";

interface StatsWidget3DProps {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    securityEvents: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

export const StatsWidget3D: React.FC<StatsWidget3DProps> = ({ stats }) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Total Users */}
        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active platform users
            </p>
          </CardContent>
        </Card>

        {/* Active Admins */}
        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Active Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats.activeAdmins}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Online administrators
            </p>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {stats.securityEvents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-8 h-8 ${getHealthColor(stats.systemHealth)} rounded-lg flex items-center justify-center`}>
                <Activity className="h-4 w-4 text-white" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={getHealthBadgeVariant(stats.systemHealth)}
              className="text-sm font-semibold capitalize"
            >
              {stats.systemHealth}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Overall system status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};