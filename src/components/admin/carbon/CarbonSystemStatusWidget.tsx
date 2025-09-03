import React from 'react';
import { Database, Shield, Activity, Wifi, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface CarbonSystemStatusWidgetProps {
  systemStatus: {
    database: 'online' | 'offline' | 'degraded';
    authentication: 'active' | 'inactive' | 'error';
    securityMonitoring: 'enabled' | 'disabled' | 'partial';
    realTimeUpdates: 'connected' | 'disconnected' | 'reconnecting';
  };
}

export const CarbonSystemStatusWidget: React.FC<CarbonSystemStatusWidgetProps> = ({ systemStatus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'enabled':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-carbon-success" />;
      case 'degraded':
      case 'inactive':
      case 'partial':
      case 'reconnecting':
        return <AlertCircle className="w-4 h-4 text-carbon-warning" />;
      default:
        return <XCircle className="w-4 h-4 text-carbon-danger" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'enabled':
      case 'connected':
        return 'text-carbon-success';
      case 'degraded':
      case 'inactive':
      case 'partial':
      case 'reconnecting':
        return 'text-carbon-warning';
      default:
        return 'text-carbon-danger';
    }
  };

  const statusItems = [
    {
      label: 'Database',
      status: systemStatus.database,
      icon: Database,
      description: 'PostgreSQL cluster'
    },
    {
      label: 'Authentication',
      status: systemStatus.authentication,
      icon: Shield,
      description: 'Supabase Auth'
    },
    {
      label: 'Security Monitor',
      status: systemStatus.securityMonitoring,
      icon: Activity,
      description: 'Real-time protection'
    },
    {
      label: 'Live Updates',
      status: systemStatus.realTimeUpdates,
      icon: Wifi,
      description: 'WebSocket connection'
    }
  ];

  const overallHealth = Object.values(systemStatus).every(status => 
    ['online', 'active', 'enabled', 'connected'].includes(status)
  ) ? 'healthy' : Object.values(systemStatus).some(status => 
    ['offline', 'error', 'disabled', 'disconnected'].includes(status)
  ) ? 'critical' : 'warning';

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-carbon-text">System Status</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-sm border ${
          overallHealth === 'healthy' ? 'border-carbon-success text-carbon-success' :
          overallHealth === 'critical' ? 'border-carbon-danger text-carbon-danger' :
          'border-carbon-warning text-carbon-warning'
        }`}>
          {getStatusIcon(overallHealth === 'healthy' ? 'online' : overallHealth === 'critical' ? 'offline' : 'degraded')}
          <span className="text-sm font-medium capitalize">{overallHealth}</span>
        </div>
      </div>

      <div className="space-y-4">
        {statusItems.map((item, index) => (
          <div 
            key={index}
            className="group flex items-center justify-between p-4 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-carbon-widget border border-carbon-border rounded-sm">
                <item.icon className="w-4 h-4 text-carbon-text-secondary" />
              </div>
              <div>
                <div className="text-sm font-medium text-carbon-text">{item.label}</div>
                <div className="text-xs text-carbon-text-secondary">{item.description}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(item.status)}
              <span className={`text-sm font-medium capitalize ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* System Uptime */}
      <div className="mt-6 p-4 bg-carbon-dashboard border border-carbon-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-carbon-text-secondary">System Uptime</span>
          <span className="text-sm font-medium text-carbon-success">99.9%</span>
        </div>
        <div className="mt-2 w-full bg-carbon-widget rounded-full h-1">
          <div className="bg-carbon-success h-1 rounded-full" style={{ width: '99.9%' }}></div>
        </div>
      </div>
    </div>
  );
};