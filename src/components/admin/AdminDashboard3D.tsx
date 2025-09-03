import React from 'react';
import { Windows3DContainer } from './Windows3DContainer';
import { StatsWidget3D } from './windows3d/StatsWidget3D';
import { SystemStatusWidget3D } from './windows3d/SystemStatusWidget3D';
import { UserManagementWidget3D } from './windows3d/UserManagementWidget3D';
import { SecurityWidget3D } from './windows3d/SecurityWidget3D';

interface AdminDashboard3DProps {
  stats: any;
  systemStatus: any;
  userRoles: any[];
  securityEvents: any[];
  onAssignRole: (userId: string, role: string) => void;
  onRevokeRole: (userId: string) => void;
  loading: boolean;
}

export const AdminDashboard3D: React.FC<AdminDashboard3DProps> = ({
  stats,
  systemStatus,
  userRoles,
  securityEvents,
  onAssignRole,
  onRevokeRole,
  loading
}) => {
  const windows = [
    {
      id: 'stats',
      title: 'System Statistics',
      position: [-3, 1, 0] as [number, number, number],
      size: [4, 3] as [number, number],
      content: <StatsWidget3D stats={stats} />
    },
    {
      id: 'users',
      title: 'User Management',
      position: [3, 1, 0] as [number, number, number],
      size: [4, 3] as [number, number],
      content: <UserManagementWidget3D userRoles={userRoles} onAssignRole={onAssignRole} onRevokeRole={onRevokeRole} loading={loading} />
    },
    {
      id: 'system',
      title: 'System Status',
      position: [-3, -2, 0] as [number, number, number],
      size: [4, 3] as [number, number],
      content: <SystemStatusWidget3D systemStatus={systemStatus} />
    },
    {
      id: 'security',
      title: 'Security Monitor',
      position: [3, -2, 0] as [number, number, number],
      size: [4, 3] as [number, number],
      content: <SecurityWidget3D securityEvents={securityEvents} />
    }
  ];

  return <Windows3DContainer windows={windows}>{null}</Windows3DContainer>;
};