import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Activity, Clock, Filter } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

interface CarbonSecurityWidgetProps {
  securityEvents: SecurityEvent[];
}

export const CarbonSecurityWidget: React.FC<CarbonSecurityWidgetProps> = ({ securityEvents }) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-carbon-danger border-carbon-danger';
      case 'high': return 'text-carbon-warning border-carbon-warning';
      case 'medium': return 'text-carbon-accent border-carbon-accent';
      case 'low': return 'text-carbon-success border-carbon-success';
      default: return 'text-carbon-text-secondary border-carbon-border';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = securityEvents.filter(event => 
    selectedSeverity === 'all' || event.severity === selectedSeverity
  ).slice(0, 6);

  const criticalCount = securityEvents.filter(e => e.severity === 'critical').length;
  const highCount = securityEvents.filter(e => e.severity === 'high').length;
  const mediumCount = securityEvents.filter(e => e.severity === 'medium').length;

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-carbon-dashboard border border-carbon-border rounded-sm">
            <Shield className="w-5 h-5 text-carbon-danger" />
          </div>
          <h2 className="text-xl font-medium text-carbon-text">Security Monitor</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {criticalCount > 0 && (
            <div className="px-2 py-1 text-xs bg-carbon-danger text-carbon-dashboard border border-carbon-danger">
              {criticalCount} Critical
            </div>
          )}
          {highCount > 0 && (
            <div className="px-2 py-1 text-xs bg-carbon-warning text-carbon-dashboard border border-carbon-warning">
              {highCount} High
            </div>
          )}
        </div>
      </div>

      {/* Severity Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-carbon-text-secondary" />
          <span className="text-sm text-carbon-text-secondary">Filter by severity:</span>
        </div>
        <div className="flex space-x-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(severity)}
              className={`px-3 py-1 text-xs border transition-colors ${
                selectedSeverity === severity
                  ? 'bg-carbon-accent text-carbon-dashboard border-carbon-accent'
                  : 'bg-carbon-dashboard text-carbon-text-secondary border-carbon-border hover:border-carbon-accent'
              }`}
            >
              {severity === 'all' ? 'All Events' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Security Events List */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const EventIcon = getEventIcon(event.event_type);
            return (
              <div 
                key={event.id}
                className="group p-4 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-carbon-widget border border-carbon-border rounded-sm">
                      <EventIcon className="w-4 h-4 text-carbon-text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-carbon-text">
                        {formatEventType(event.event_type)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-carbon-text-secondary">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(event.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 text-xs border rounded-sm ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </div>
                </div>
                
                {event.details && (
                  <div className="mt-2 p-3 bg-carbon-widget border border-carbon-border">
                    <div className="text-xs text-carbon-text-secondary space-y-1">
                      <div>User: {event.user_id.slice(0, 8)}...</div>
                      {event.details.ip_address && (
                        <div>IP: {event.details.ip_address}</div>
                      )}
                      {event.details.user_agent && (
                        <div className="truncate">Agent: {event.details.user_agent.slice(0, 40)}...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-carbon-text-secondary">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No security events</p>
            <p className="text-xs">System is secure</p>
          </div>
        )}

        {securityEvents.length > 6 && (
          <div className="text-center pt-4">
            <button className="px-4 py-2 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent text-carbon-text-secondary hover:text-carbon-accent transition-colors text-sm">
              View All {securityEvents.length} Events
            </button>
          </div>
        )}
      </div>

      {/* Security Status Summary */}
      <div className="mt-6 pt-4 border-t border-carbon-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-carbon-text-secondary">Security Status</span>
          <div className={`flex items-center space-x-2 px-2 py-1 border rounded-sm ${
            criticalCount === 0 && highCount === 0 
              ? 'border-carbon-success text-carbon-success' 
              : criticalCount > 0 
                ? 'border-carbon-danger text-carbon-danger'
                : 'border-carbon-warning text-carbon-warning'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              criticalCount === 0 && highCount === 0 
                ? 'bg-carbon-success' 
                : criticalCount > 0 
                  ? 'bg-carbon-danger animate-pulse'
                  : 'bg-carbon-warning'
            }`}></div>
            <span className="text-xs font-medium">
              {criticalCount === 0 && highCount === 0 ? 'Secure' : criticalCount > 0 ? 'Alert' : 'Warning'}
            </span>
          </div>
        </div>
        <div className="text-xs text-carbon-text-secondary mt-1">
          {securityEvents.length} events in last 24h
        </div>
      </div>
    </div>
  );
};