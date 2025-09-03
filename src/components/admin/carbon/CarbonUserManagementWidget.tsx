import React, { useState } from 'react';
import { Users, UserCheck, UserX, Crown, MoreHorizontal, Search } from 'lucide-react';
import { SecurePIIDisplay } from '@/components/SecurePIIDisplay';

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

interface CarbonUserManagementWidgetProps {
  userRoles: UserRole[];
  onAssignRole: (userId: string, role: string) => void;
  onRevokeRole: (userId: string) => void;
  loading: boolean;
}

export const CarbonUserManagementWidget: React.FC<CarbonUserManagementWidgetProps> = ({ 
  userRoles, 
  onAssignRole, 
  onRevokeRole, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-carbon-danger border-carbon-danger';
      case 'admin': return 'text-carbon-accent border-carbon-accent';
      case 'tech_support_admin': return 'text-carbon-warning border-carbon-warning';
      default: return 'text-carbon-text-secondary border-carbon-border';
    }
  };

  const filteredUsers = userRoles.filter(user => {
    const matchesSearch = user.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }).slice(0, 8);

  return (
    <div className="bg-carbon-widget border border-carbon-border rounded-none p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-carbon-dashboard border border-carbon-border rounded-sm">
            <Users className="w-5 h-5 text-carbon-accent" />
          </div>
          <h2 className="text-xl font-medium text-carbon-text">User Management</h2>
        </div>
        <div className="text-xs text-carbon-text-secondary bg-carbon-dashboard px-2 py-1 border border-carbon-border">
          {userRoles.length} Total
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-carbon-text-secondary" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-carbon-dashboard border border-carbon-border text-carbon-text placeholder-carbon-text-secondary focus:border-carbon-accent focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex space-x-2">
          {['all', 'super_admin', 'admin', 'tech_support_admin', 'trainee'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 text-xs border transition-colors ${
                selectedRole === role
                  ? 'bg-carbon-accent text-carbon-dashboard border-carbon-accent'
                  : 'bg-carbon-dashboard text-carbon-text-secondary border-carbon-border hover:border-carbon-accent'
              }`}
            >
              {role === 'all' ? 'All Users' : role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-carbon-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((userRole) => (
            <div 
              key={userRole.id} 
              className="group flex items-center justify-between p-4 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent transition-all duration-200"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-8 h-8 bg-carbon-widget border border-carbon-border rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-carbon-text">
                    {userRole.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-carbon-text truncate">
                    <SecurePIIDisplay 
                      value={userRole.profiles?.name || null} 
                      type="name" 
                      showMaskingIndicator={false}
                    />
                  </div>
                  <div className="text-xs text-carbon-text-secondary truncate">
                    <SecurePIIDisplay 
                      value={userRole.profiles?.email || null} 
                      type="email" 
                      showMaskingIndicator={false}
                    />
                  </div>
                </div>
                
                <div className={`px-2 py-1 text-xs border rounded-sm ${getRoleBadgeColor(userRole.role)}`}>
                  {userRole.role.replace('_', ' ')}
                </div>
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAssignRole(userRole.user_id, 'admin')}
                  className="p-1.5 bg-carbon-widget border border-carbon-border hover:border-carbon-success text-carbon-text-secondary hover:text-carbon-success transition-colors"
                  title="Promote to Admin"
                >
                  <UserCheck className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRevokeRole(userRole.user_id)}
                  className="p-1.5 bg-carbon-widget border border-carbon-border hover:border-carbon-danger text-carbon-text-secondary hover:text-carbon-danger transition-colors"
                  title="Revoke Role"
                >
                  <UserX className="w-3 h-3" />
                </button>
                <button className="p-1.5 bg-carbon-widget border border-carbon-border hover:border-carbon-accent text-carbon-text-secondary hover:text-carbon-accent transition-colors">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-carbon-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-carbon-border">
        <div className="flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-carbon-dashboard border border-carbon-border hover:border-carbon-accent text-carbon-text-secondary hover:text-carbon-accent transition-colors text-sm">
            Bulk Actions
          </button>
          <button className="flex-1 px-4 py-2 bg-carbon-accent border border-carbon-accent text-carbon-dashboard hover:bg-carbon-hover transition-colors text-sm">
            Invite User
          </button>
        </div>
      </div>
    </div>
  );
};