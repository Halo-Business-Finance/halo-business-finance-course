import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Activity, Wifi } from "lucide-react";

interface SystemStatusWidget3DProps {
  systemStatus: {
    database: 'online' | 'offline' | 'degraded';
    authentication: 'active' | 'inactive' | 'error';
    securityMonitoring: 'enabled' | 'disabled' | 'partial';
    realTimeUpdates: 'connected' | 'disconnected' | 'reconnecting';
  };
}

export const SystemStatusWidget3D: React.FC<SystemStatusWidget3DProps> = ({ systemStatus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'enabled':
      case 'connected':
        return '🟢';
      case 'degraded':
      case 'inactive':
      case 'partial':
      case 'reconnecting':
        return '🟡';
      default:
        return '🔴';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'enabled':
      case 'connected':
        return 'default';
      case 'degraded':
      case 'inactive':
      case 'partial':
      case 'reconnecting':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const statusItems = [
    {
      key: 'database',
      label: 'Database',
      status: systemStatus.database,
      icon: Database,
      color: 'blue'
    },
    {
      key: 'authentication',
      label: 'Authentication',
      status: systemStatus.authentication,
      icon: Shield,
      color: 'green'
    },
    {
      key: 'securityMonitoring',
      label: 'Security Monitoring',
      status: systemStatus.securityMonitoring,
      icon: Activity,
      color: 'purple'
    },
    {
      key: 'realTimeUpdates',
      label: 'Real-time Updates',
      status: systemStatus.realTimeUpdates,
      icon: Wifi,
      color: 'orange'
    }
  ];

  return (
    <div className="w-full h-full">
      <Card className="h-full border-border/50 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusItems.map((item) => (
            <div 
              key={item.key}
              className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-border/30 hover:bg-white/90 transition-all duration-200 hover:scale-102"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-${item.color}-500 rounded-lg flex items-center justify-center`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <Badge 
                variant={getStatusVariant(item.status)} 
                className="shadow-sm capitalize flex items-center gap-1"
              >
                <span>{getStatusIcon(item.status)}</span>
                {item.status}
              </Badge>
            </div>
          ))}
          
          {/* Overall Health Indicator */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Overall Health</span>
              <div className="flex items-center gap-2">
                {Object.values(systemStatus).every(status => 
                  ['online', 'active', 'enabled', 'connected'].includes(status)
                ) ? (
                  <Badge variant="default" className="shadow-sm">
                    <span>🟢</span> Excellent
                  </Badge>
                ) : Object.values(systemStatus).some(status => 
                  ['offline', 'error', 'disabled', 'disconnected'].includes(status)
                ) ? (
                  <Badge variant="destructive" className="shadow-sm">
                    <span>🔴</span> Critical
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shadow-sm">
                    <span>🟡</span> Warning
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};