import React from 'react';
import { CarbonStatsWidget } from './carbon/CarbonStatsWidget';
import { CarbonSystemStatusWidget } from './carbon/CarbonSystemStatusWidget';
import { CarbonUserManagementWidget } from './carbon/CarbonUserManagementWidget';
import { CarbonSecurityWidget } from './carbon/CarbonSecurityWidget';
import { CarbonMetricsWidget } from './carbon/CarbonMetricsWidget';
import { CarbonActivityWidget } from './carbon/CarbonActivityWidget';

interface CarbonDashboardProps {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    securityEvents: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
  systemStatus: {
    database: 'online' | 'offline' | 'degraded';
    authentication: 'active' | 'inactive' | 'error';
    securityMonitoring: 'enabled' | 'disabled' | 'partial';
    realTimeUpdates: 'connected' | 'disconnected' | 'reconnecting';
  };
  userRoles: any[];
  securityEvents: any[];
  onAssignRole: (userId: string, role: string) => void;
  onRevokeRole: (userId: string) => void;
  loading: boolean;
}

export const CarbonDashboard: React.FC<CarbonDashboardProps> = ({
  stats,
  systemStatus,
  userRoles,
  securityEvents,
  onAssignRole,
  onRevokeRole,
  loading
}) => {
  return (
    <div className="min-h-screen bg-carbon-dashboard p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-carbon-text mb-2">
          System Administration
        </h1>
        <p className="text-carbon-text-secondary">
          Monitor and manage your business finance platform
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Row - Key Metrics */}
        <div className="lg:col-span-8">
          <CarbonStatsWidget stats={stats} />
        </div>
        
        <div className="lg:col-span-4">
          <CarbonSystemStatusWidget systemStatus={systemStatus} />
        </div>

        {/* Second Row - Management Widgets */}
        <div className="lg:col-span-6">
          <CarbonUserManagementWidget 
            userRoles={userRoles}
            onAssignRole={onAssignRole}
            onRevokeRole={onRevokeRole}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-6">
          <CarbonSecurityWidget securityEvents={securityEvents} />
        </div>

        {/* Third Row - Analytics */}
        <div className="lg:col-span-8">
          <CarbonMetricsWidget stats={stats} />
        </div>

        <div className="lg:col-span-4">
          <CarbonActivityWidget />
        </div>
      </div>
    </div>
  );
};