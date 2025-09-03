import React from 'react';
import { Clock, User, FileText, Settings, LogIn, UserPlus } from 'lucide-react';

export const CarbonActivityWidget: React.FC = () => {
  // Mock activity data for demonstration
  const recentActivities = [
    {
      id: 1,
      type: 'user_login',
      user: 'Sarah Johnson',
      action: 'logged into the system',
      timestamp: '2 minutes ago',
      icon: LogIn,
      color: 'carbon-success'
    },
    {
      id: 2,
      type: 'user_created',
      user: 'Admin',
      action: 'created new user account',
      timestamp: '5 minutes ago',
      icon: UserPlus,
      color: 'carbon-accent'
    },
    {
      id: 3,
      type: 'settings_updated',
      user: 'Michael Chen',
      action: 'updated security settings',
      timestamp: '12 minutes ago',
      icon: Settings,
      color: 'carbon-warning'
    },
    {
      id: 4,
      type: 'content_created',
      user: 'Emily Davis',
      action: 'published new course content',
      timestamp: '18 minutes ago',
      icon: FileText,
      color: 'carbon-success'
    },
    {
      id: 5,
      type: 'user_login',
      user: 'Robert Wilson',
      action: 'logged into the system',
      timestamp: '25 minutes ago',
      icon: LogIn,
      color: 'carbon-success'
    },
    {
      id: 6,
      type: 'settings_updated',
      user: 'Admin',
      action: 'modified user permissions',
      timestamp: '35 minutes ago',
      icon: Settings,
      color: 'carbon-warning'
    }
  ];

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'user_login': return 'Login';
      case 'user_created': return 'User Created';
      case 'settings_updated': return 'Settings';
      case 'content_created': return 'Content';
      default: return 'Activity';
    }
  };

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-carbon-dashboard border border-carbon-border rounded-sm">
            <Clock className="w-5 h-5 text-carbon-accent" />
          </div>
          <h2 className="text-xl font-medium text-carbon-text">Recent Activity</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-carbon-success rounded-full animate-pulse"></div>
          <span className="text-xs text-carbon-text-secondary">Live</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        {recentActivities.map((activity, index) => (
          <div 
            key={activity.id}
            className="group flex items-start space-x-4 p-3 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent transition-all duration-200 cursor-pointer"
          >
            <div className="p-2 bg-carbon-widget border border-carbon-border rounded-sm">
              <activity.icon className={`w-4 h-4 text-${activity.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-carbon-text truncate">
                  {activity.user}
                </div>
                <div className={`px-2 py-1 text-xs border border-carbon-border text-carbon-text-secondary rounded-sm`}>
                  {getActivityTypeLabel(activity.type)}
                </div>
              </div>
              
              <div className="text-sm text-carbon-text-secondary mb-2">
                {activity.action}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-carbon-text-secondary">
                <Clock className="w-3 h-3" />
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-carbon-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-carbon-text">24</div>
            <div className="text-xs text-carbon-text-secondary">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-carbon-text">156</div>
            <div className="text-xs text-carbon-text-secondary">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-carbon-text">632</div>
            <div className="text-xs text-carbon-text-secondary">This Month</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-carbon-border">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent text-carbon-text-secondary hover:text-carbon-accent transition-colors text-xs">
            View All
          </button>
          <button className="flex-1 px-3 py-2 bg-carbon-accent border border-carbon-accent text-carbon-dashboard hover:bg-carbon-hover transition-colors text-xs">
            Export Log
          </button>
        </div>
      </div>
    </div>
  );
};