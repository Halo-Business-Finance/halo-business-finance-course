import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Lock, Eye, Activity } from "lucide-react";

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

interface SecurityWidget3DProps {
  securityEvents: SecurityEvent[];
}

export const SecurityWidget3D: React.FC<SecurityWidget3DProps> = ({ securityEvents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'failed_login':
      case 'authentication_failure': return Lock;
      case 'unauthorized_access': return AlertTriangle;
      case 'data_access': return Eye;
      case 'system_breach': return Shield;
      default: return Activity;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const recentEvents = securityEvents.slice(0, 6); // Show first 6 events

  const criticalCount = securityEvents.filter(e => e.severity === 'critical').length;
  const highCount = securityEvents.filter(e => e.severity === 'high').length;
  const mediumCount = securityEvents.filter(e => e.severity === 'medium').length;

  return (
    <div className="w-full h-full">
      <Card className="h-full border-border/50 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Security Monitor
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {highCount} High
              </Badge>
            )}
            {mediumCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {mediumCount} Medium
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 overflow-auto">
          {recentEvents.length > 0 ? (
            <>
              {recentEvents.map((event) => {
                const EventIcon = getEventIcon(event.event_type);
                return (
                  <div 
                    key={event.id}
                    className="p-3 bg-white/70 rounded-lg border border-border/30 hover:bg-white/90 transition-all duration-200 hover:scale-102"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <EventIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatEventType(event.event_type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getSeverityVariant(event.severity)} className="text-xs capitalize">
                        {event.severity}
                      </Badge>
                    </div>
                    
                    {event.details && (
                      <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border">
                        <span className="font-mono">User: {event.user_id.slice(0, 8)}...</span>
                        {event.details.ip_address && (
                          <span className="block font-mono">IP: {event.details.ip_address}</span>
                        )}
                        {event.details.user_agent && (
                          <span className="block truncate">Agent: {event.details.user_agent.slice(0, 40)}...</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {securityEvents.length > 6 && (
                <div className="text-center pt-2">
                  <Badge variant="outline" className="text-xs">
                    +{securityEvents.length - 6} more events
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No security events</p>
              <p className="text-xs">System is secure</p>
            </div>
          )}

          {/* Security Status Summary */}
          <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Security Status</span>
              <div className="flex items-center gap-2">
                {criticalCount === 0 && highCount === 0 ? (
                  <Badge variant="default" className="text-xs">
                    <span>🟢</span> Secure
                  </Badge>
                ) : criticalCount > 0 ? (
                  <Badge variant="destructive" className="text-xs">
                    <span>🔴</span> Alert
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <span>🟡</span> Warning
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityEvents.length} events in last 24h
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};