import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CarbonStatsWidgetProps {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    securityEvents: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

export const CarbonStatsWidget: React.FC<CarbonStatsWidgetProps> = ({ stats }) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-carbon-success';
      case 'good': return 'text-carbon-accent';
      case 'warning': return 'text-carbon-warning';
      case 'critical': return 'text-carbon-danger';
      default: return 'text-carbon-text-secondary';
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      trend: '+12%',
      trendDirection: 'up' as const,
      description: 'Active platform users'
    },
    {
      title: 'Active Admins',
      value: stats.activeAdmins.toString(),
      trend: '+2',
      trendDirection: 'up' as const,
      description: 'Online administrators'
    },
    {
      title: 'Security Events',
      value: stats.securityEvents.toString(),
      trend: stats.securityEvents > 5 ? '-8%' : '0%',
      trendDirection: stats.securityEvents > 5 ? 'down' as const : 'neutral' as const,
      description: 'Last 24 hours'
    },
    {
      title: 'System Health',
      value: stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1),
      trend: 'Stable',
      trendDirection: stats.systemHealth === 'excellent' || stats.systemHealth === 'good' ? 'up' as const : 'down' as const,
      description: 'Overall system status',
      customColor: getHealthColor(stats.systemHealth)
    }
  ];

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-carbon-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-carbon-danger" />;
      default: return <Minus className="w-4 h-4 text-carbon-text-secondary" />;
    }
  };

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-carbon-text">Key Metrics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-carbon-accent rounded-full animate-pulse"></div>
          <span className="text-sm text-carbon-text-secondary">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="group cursor-pointer transition-all duration-200 hover:bg-carbon-hover border border-carbon-border hover:border-carbon-accent p-5 rounded-none"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-carbon-text-secondary mb-1">
                  {stat.title}
                </h3>
                <div className={`text-2xl font-semibold ${stat.customColor || 'text-carbon-text'}`}>
                  {stat.value}
                </div>
              </div>
              {getTrendIcon(stat.trendDirection)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-carbon-text-secondary">
                {stat.description}
              </span>
              <span className={`text-xs font-medium ${
                stat.trendDirection === 'up' ? 'text-carbon-success' : 
                stat.trendDirection === 'down' ? 'text-carbon-danger' : 
                'text-carbon-text-secondary'
              }`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};