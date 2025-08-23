// Admin Dashboard with User Management
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Database, 
  Settings,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Crown,
  Eye,
  Trash2,
  GraduationCap,
  Edit,
  Plus,
  Video,
  FileText,
  BookOpen,
  Wrench,
  TrendingUp
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { InstructorForm } from "@/components/InstructorForm";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { VideoManager } from "@/components/admin/VideoManager";
import { ArticleManager } from "@/components/admin/ArticleManager";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { TraineeProgressView } from "@/components/admin/TraineeProgressView";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeAdmins: number;
  securityEvents: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface Instructor {
  id: string;
  name: string;
  title: string;
  company: string;
  years_experience: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { userRole, isAdmin, isLoading: roleLoading } = useAdminRole();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAdmins: 0,
    securityEvents: 0,
    systemHealth: 'excellent'
  });
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'trainee'
  });
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [hasAccessError, setHasAccessError] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions for live admin dashboard
    const setupRealtimeSubscriptions = () => {
      
      const channel = supabase
        .channel('admin-dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_events'
          },
          (payload) => {
            
            toast({
              title: "Security Alert",
              description: `New ${payload.new.severity} security event detected`,
              variant: payload.new.severity === 'critical' ? 'destructive' : 'default'
            });
            loadDashboardData(); // Refresh data
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            
            toast({
              title: "New User",
              description: `${payload.new.name} has joined Business Finance Mastery`,
            });
            loadDashboardData(); // Refresh data
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles'
          },
          (payload) => {
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: "Role Assigned",
                description: `New ${payload.new.role} role assigned`,
              });
            }
            loadDashboardData(); // Refresh data
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            toast({
              title: "Live Dashboard",
              description: "Real-time monitoring is now active",
            });
          }
        });
        
      setRealtimeChannel(channel);
    };

    setupRealtimeSubscriptions();
    
    // Cleanup function
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user roles using the secure database function
      let userRolesData = [];
      
      try {
        const { data: profilesWithRoles, error: profilesError } = await supabase.rpc('get_all_user_profiles_with_roles');

        if (profilesError) {
          console.warn('Secure function failed:', profilesError);
          throw profilesError;
        }

        if (profilesWithRoles && profilesWithRoles.length > 0) {
          // Transform the data to match our expected format
          userRolesData = profilesWithRoles.map((item: any) => ({
            id: item.user_id,
            user_id: item.user_id,
            role: item.role,
            is_active: item.role_is_active,
            created_at: item.role_created_at || item.created_at,
            updated_at: item.updated_at,
            profiles: {
              name: item.name,
              email: item.email,
              phone: item.phone,
              title: item.title,
              company: item.company
            }
          }));
        } else {
        }
      } catch (error) {
        console.error('Failed to load user profiles with roles:', error);
        // Fallback to current user only if the secure function fails
        if (user && userRole) {
          userRolesData = [{
            id: user.id,
            user_id: user.id,
            role: userRole,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: {
              name: user.user_metadata?.full_name || 'Admin User',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              title: 'System Administrator',
              company: 'Halo Business Finance'
            }
          }];
        }
      }

      // Fetch instructors data
      const { data: instructorsData, error: instructorsError } = await supabase
        .from('instructors')
        .select('*')
        .order('display_order', { ascending: true });

      if (instructorsError) throw instructorsError;

      // Try to fetch security events, but don't fail if access denied
      let eventsData = [];
      try {
        const { data: securityEventsData, error: eventsError } = await supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (eventsError && eventsError.code !== '42501') {
          console.warn('Security events query failed:', eventsError);
        } else if (!eventsError) {
          eventsData = securityEventsData || [];
        }
      } catch (securityError) {
        console.warn('Could not load security events (insufficient permissions):', securityError);
      }

      setUserRoles(userRolesData);
      setSecurityEvents(eventsData || []);
      setInstructors(instructorsData || []);

      // Calculate stats from the data
      const totalUsers = new Set(userRolesData.map((role: UserRole) => role.user_id)).size;
      const activeAdmins = userRolesData.filter((role: UserRole) => 
        role.is_active && ['admin', 'super_admin'].includes(role.role)
      ).length;
      const recentEvents = eventsData?.filter(event => 
        event.created_at && new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        totalUsers,
        activeAdmins,
        securityEvents: recentEvents,
        systemHealth: recentEvents > 10 ? 'critical' : 
                      recentEvents > 5 ? 'warning' : 
                      recentEvents > 0 ? 'good' : 'excellent'
      });
      
      // Reset access error since we successfully loaded data
      setHasAccessError(false);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Check if it's a permission error
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        setHasAccessError(true);
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'super_admin' | 'manager' | 'agent' | 'trainee' | 'tech_support_admin' | 'loan_processor' | 'underwriter' | 'funder' | 'closer' | 'tech' | 'loan_originator') => {
    try {
      setLoading(true);
      
      // Try secure function first, fallback to direct RPC
      try {
        const { data, error } = await supabase.functions.invoke('secure-admin-operations', {
          body: {
            operation: 'assign_role',
            targetUserId: userId,
            role: role,
            reason: 'Role assignment via admin dashboard'
          }
        });

        if (error) throw error;
      } catch (secureError) {
        console.warn('Secure function unavailable, using direct RPC:', secureError);
        
        // Fallback to direct RPC call
        const { data, error } = await supabase.rpc('assign_user_role', {
          p_target_user_id: userId,
          p_new_role: role,
          p_reason: 'Role assignment via admin dashboard',
          p_mfa_verified: false
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${role} role assigned successfully.`
      });

      // Reload data to reflect changes
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      let errorMessage = 'Failed to assign role';
      
      if (error?.message?.includes('super_admin')) {
        errorMessage = 'Only super admins can assign super admin roles';
      } else if (error?.message?.includes('privileges') || error?.message?.includes('permissions')) {
        errorMessage = 'Insufficient privileges to assign roles';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeRole = async (userId: string) => {
    try {
      setLoading(true);
      
      // Try secure function first, fallback to direct RPC
      try {
        const { data, error } = await supabase.functions.invoke('secure-admin-operations', {
          body: {
            operation: 'revoke_role',
            targetUserId: userId,
            reason: 'Role revocation via admin dashboard'
          }
        });

        if (error) throw error;
      } catch (secureError) {
        console.warn('Secure function unavailable, using direct RPC:', secureError);
        
        // Fallback to direct RPC call
        const { data, error } = await supabase.rpc('revoke_user_role', {
          p_target_user_id: userId,
          p_reason: 'Role revocation via admin dashboard',
          p_mfa_verified: false
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Role revoked successfully."
      });

      // Reload data to reflect changes
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error revoking role:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to revoke role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewUser = async () => {
    if (!newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingUser(true);

      const { data, error } = await supabase.functions.invoke('secure-admin-operations', {
        body: {
          operation: 'createAdminAccount',
          data: {
            email: newUserData.email,
            password: newUserData.password,
            fullName: newUserData.fullName,
            role: newUserData.role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: `User ${newUserData.email} created successfully with ${newUserData.role} role.`,
      });

      // Reset form
      setNewUserData({
        email: '',
        password: '',
        fullName: '',
        role: 'trainee'
      });

      // Refresh data
      await loadDashboardData();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      // Try secure function first, fallback to direct function call
      try {
        const { data, error } = await supabase.functions.invoke('secure-admin-operations', {
          body: {
            operation: 'delete_user',
            targetUserId: userId,
            reason: 'User deletion via admin dashboard'
          }
        });

        if (error) throw error;
      } catch (secureError) {
        console.warn('Secure function unavailable, using direct function:', secureError);
        
        // Fallback to direct function call
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { 
            userId: userId,
            currentUserId: user?.id 
          }
        });

        if (error) throw error;
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete user');
        }
      }

      // Update the userRoles list locally instead of reloading all data
      setUserRoles(prev => prev.filter(role => role.user_id !== userId));

      toast({
        title: "Success",
        description: "User deleted successfully."
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInstructor = async (instructorId: string) => {
    try {
      const { error } = await supabase
        .from('instructors')
        .delete()
        .eq('id', instructorId);

      if (error) throw error;

      // Update the instructors list locally instead of reloading all data
      setInstructors(prev => prev.filter(instructor => instructor.id !== instructorId));

      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete instructor",
        variant: "destructive"
      });
    }
  };

  const toggleInstructorStatus = async (instructorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('instructors')
        .update({ is_active: !isActive })
        .eq('id', instructorId);

      if (error) throw error;

      // Update the instructors list locally instead of reloading all data
      setInstructors(prev => prev.map(instructor => 
        instructor.id === instructorId 
          ? { ...instructor, is_active: !isActive }
          : instructor
      ));

      toast({
        title: "Success",
        description: `Instructor ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update instructor status",
        variant: "destructive"
      });
    }
  };

  const handleInstructorFormSave = () => {
    setShowInstructorForm(false);
    setEditingInstructor(null);
    // Refresh just the instructors data instead of all dashboard data
    const refreshInstructors = async () => {
      try {
        const { data: instructorsData, error } = await supabase
          .from('instructors')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setInstructors(instructorsData || []);
      } catch (error) {
        console.error('Error refreshing instructors:', error);
      }
    };
    refreshInstructors();
  };

  const handleInstructorFormCancel = () => {
    setShowInstructorForm(false);
    setEditingInstructor(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'tech_support_admin': return 'default';
      case 'manager': return 'secondary';
      case 'trainee': return 'secondary';
      case 'user': return 'outline';
      case 'No Role Assigned': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Show admin setup if there's an access error or no admin role
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Only show access denied if user genuinely doesn't have admin privileges
  if (!isAdmin && userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <Badge variant="destructive">Super Admin</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAdmins}</div>
            <p className="text-xs text-muted-foreground">Admin & Super Admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityEvents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={
                stats.systemHealth === 'excellent' ? 'default' :
                stats.systemHealth === 'good' ? 'secondary' : 
                stats.systemHealth === 'warning' ? 'outline' : 'destructive'
              } className={stats.systemHealth === 'excellent' ? 'bg-green-500 hover:bg-green-600' : ''}>
                {stats.systemHealth.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Overall status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="trainee-progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trainee Progress
          </TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="monitoring">Security Monitor</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Tabs defaultValue="modules" className="space-y-4">
            <TabsList>
              <TabsTrigger value="modules">
                <BookOpen className="h-4 w-4 mr-2" />
                Modules
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="articles">
                <FileText className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="resources">
                <FileText className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <ModuleEditor />
            </TabsContent>

            <TabsContent value="videos">
              <VideoManager />
            </TabsContent>

            <TabsContent value="articles">
              <ArticleManager />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Roles Management</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions. Use carefully as role changes affect system access.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with email and password. The user will be assigned the trainee role by default.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input
                          id="email"
                          type="email"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="user@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <input
                          id="password"
                          type="password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          value={newUserData.fullName}
                          onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="role" className="text-sm font-medium">Initial Role</label>
                        <select
                          id="role"
                          value={newUserData.role}
                          onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="trainee">Trainee</option>
                          <option value="admin">Admin</option>
                          <option value="tech_support_admin">Tech Support Admin</option>
                          {(userRole === 'super_admin') && (
                            <option value="super_admin">Super Admin</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" disabled={creatingUser}>Cancel</Button>
                      </DialogClose>
                      <Button onClick={createNewUser} disabled={creatingUser || !newUserData.email || !newUserData.password}>
                        {creatingUser ? (
                          <>
                            <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
                            Creating...
                          </>
                        ) : (
                          'Create User'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>User</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Role</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Created</TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                   {userRoles.map((userRole) => (
                     <TableRow key={userRole.id}>
                       <TableCell>
                         <div className="flex flex-col">
                           <span className="font-medium">
                             {userRole.profiles?.name || 'No name'}
                           </span>
                           <span className="font-mono text-xs text-muted-foreground">
                             {userRole.user_id.slice(0, 8)}...
                           </span>
                         </div>
                       </TableCell>
                       <TableCell>
                         <span className="text-sm">
                           {userRole.profiles?.email || 'No email'}
                         </span>
                       </TableCell>
                       <TableCell>
                         <Badge variant={getRoleBadgeVariant(userRole.role)}>
                           {userRole.role}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Badge variant={userRole.is_active ? "default" : "secondary"}>
                           {userRole.is_active ? "Active" : "Inactive"}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         {new Date(userRole.created_at).toLocaleDateString()}
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(userRole.user_id, 'trainee')}
                            disabled={userRole.role === 'trainee'}
                            title="Assign Trainee Role"
                          >
                            <GraduationCap className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(userRole.user_id, 'tech_support_admin')}
                            disabled={userRole.role === 'tech_support_admin'}
                            title="Assign Tech Support Admin Role"
                          >
                            <Wrench className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(userRole.user_id, 'admin')}
                            disabled={userRole.role === 'admin'}
                            title="Assign Admin Role"
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(userRole.user_id, 'super_admin')}
                            disabled={userRole.role === 'super_admin'}
                            title="Assign Super Admin Role"
                          >
                            <Crown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => revokeRole(userRole.user_id)}
                            disabled={!userRole.is_active}
                            title="Revoke Role"
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={userRole.user_id === user?.id || deletingUser === userRole.user_id}
                                title={userRole.user_id === user?.id ? "Cannot delete your own account" : "Delete User"}
                                className="hover:bg-destructive hover:text-destructive-foreground"
                              >
                                {deletingUser === userRole.user_id ? (
                                  <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete this user? This action cannot be undone.
                                  The user will be completely removed from the system including all their data.
                                  <br /><br />
                                  <strong>User ID:</strong> {userRole.user_id}
                                  <br />
                                  <strong>Role:</strong> {userRole.role}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(userRole.user_id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainee-progress" className="space-y-4">
          <TraineeProgressView />
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          {showInstructorForm ? (
            <InstructorForm
              instructor={editingInstructor || undefined}
              onSave={handleInstructorFormSave}
              onCancel={handleInstructorFormCancel}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Course Instructors
                    </CardTitle>
                    <CardDescription>
                      Manage course instructor information and profiles
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowInstructorForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-${instructor.avatar_color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                              {instructor.avatar_initials}
                            </div>
                            <div>
                              <div className="font-medium">{instructor.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {instructor.title}
                        </TableCell>
                        <TableCell>{instructor.company}</TableCell>
                        <TableCell>{instructor.years_experience}</TableCell>
                        <TableCell>
                          <Badge variant={instructor.is_active ? "default" : "secondary"}>
                            {instructor.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{instructor.display_order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingInstructor(instructor);
                                setShowInstructorForm(true);
                              }}
                              title="Edit Instructor"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleInstructorStatus(instructor.id, instructor.is_active)}
                              title={instructor.is_active ? "Deactivate" : "Activate"}
                            >
                              {instructor.is_active ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <Lock className="h-3 w-3" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-destructive hover:text-destructive-foreground"
                                  title="Delete Instructor"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this instructor? This action cannot be undone.
                                    <br /><br />
                                    <strong>Name:</strong> {instructor.name}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteInstructor(instructor.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>


        <TabsContent value="monitoring" className="space-y-4">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/users', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/users');
                        }
                      }}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/providers', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/providers');
                        }
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Authentication Providers
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/url-configuration', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/auth/url-configuration');
                        }
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      URL Configuration
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security & Database</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/logs/explorer', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/logs/explorer');
                        }
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      System Logs
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/database/tables', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/database/tables');
                        }
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Database Tables
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const opened = window.open('https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/settings/general', '_blank');
                        if (!opened) {
                          alert('Popup blocked! Please allow popups or copy this URL: https://supabase.com/dashboard/project/kagwfntxlgzrcngysmlt/settings/general');
                        }
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Project Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;