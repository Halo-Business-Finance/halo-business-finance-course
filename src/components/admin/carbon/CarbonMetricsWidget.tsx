import React from 'react';
import { BarChart3, TrendingUp, Users, Activity, DollarSign, Target } from 'lucide-react';

interface CarbonMetricsWidgetProps {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    securityEvents: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

export const CarbonMetricsWidget: React.FC<CarbonMetricsWidgetProps> = ({ stats }) => {
  // Mock performance data for demonstration
  const performanceMetrics = [
    { label: 'Response Time', value: '125ms', trend: '+5%', color: 'carbon-accent' },
    { label: 'Throughput', value: '1.2k/min', trend: '+12%', color: 'carbon-success' },
    { label: 'Error Rate', value: '0.1%', trend: '-15%', color: 'carbon-success' },
    { label: 'Uptime', value: '99.9%', trend: '0%', color: 'carbon-success' }
  ];

  const chartData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 61 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 42 },
    { day: 'Sun', value: 48 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-carbon-dashboard border border-carbon-border rounded-sm">
            <BarChart3 className="w-5 h-5 text-carbon-accent" />
          </div>
          <h2 className="text-xl font-medium text-carbon-text">Analytics Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <select className="bg-carbon-dashboard border border-carbon-border text-carbon-text text-sm px-3 py-1 focus:border-carbon-accent focus:outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div>
          <h3 className="text-sm font-medium text-carbon-text mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-carbon-dashboard border border-carbon-border">
                <div>
                  <div className="text-sm text-carbon-text-secondary">{metric.label}</div>
                  <div className="text-lg font-semibold text-carbon-text">{metric.value}</div>
                </div>
                <div className={`text-sm font-medium ${
                  metric.trend.startsWith('+') ? 'text-carbon-success' :
                  metric.trend.startsWith('-') ? 'text-carbon-danger' :
                  'text-carbon-text-secondary'
                }`}>
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div>
          <h3 className="text-sm font-medium text-carbon-text mb-4">Activity Trend</h3>
          <div className="p-4 bg-carbon-dashboard border border-carbon-border">
            <div className="flex items-end justify-between h-32 space-x-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-carbon-accent transition-all duration-300 hover:bg-carbon-hover cursor-pointer"
                    style={{ 
                      height: `${(item.value / maxValue) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-carbon-text-secondary mt-2">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 pt-4 border-t border-carbon-border">
        <h3 className="text-sm font-medium text-carbon-text mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-carbon-dashboard border border-carbon-border">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-carbon-accent" />
              <span className="text-xs text-carbon-text-secondary">User Growth</span>
            </div>
            <div className="text-lg font-semibold text-carbon-text">+12%</div>
            <div className="text-xs text-carbon-success">vs last month</div>
          </div>
          
          <div className="p-3 bg-carbon-dashboard border border-carbon-border">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-carbon-warning" />
              <span className="text-xs text-carbon-text-secondary">System Load</span>
            </div>
            <div className="text-lg font-semibold text-carbon-text">68%</div>
            <div className="text-xs text-carbon-text-secondary">optimal range</div>
          </div>
          
          <div className="p-3 bg-carbon-dashboard border border-carbon-border">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-carbon-success" />
              <span className="text-xs text-carbon-text-secondary">SLA Compliance</span>
            </div>
            <div className="text-lg font-semibold text-carbon-text">99.8%</div>
            <div className="text-xs text-carbon-success">exceeding target</div>
          </div>
        </div>
      </div>
    </div>
  );
};