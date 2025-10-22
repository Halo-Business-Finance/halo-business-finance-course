// Admin Dashboard with User Management - Updated
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { SecurityEventManager } from "@/components/SecurityEventManager";
import { SecurityFixCenter } from "@/components/SecurityFixCenter";
import { VideoManager } from "@/components/admin/VideoManager";
import { ArticleManager } from "@/components/admin/ArticleManager";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import { ResourceManager } from "@/components/admin/ResourceManager";
import CMSManager from "@/components/admin/CMSManager";
import { TraineeProgressView } from "@/components/admin/TraineeProgressView";
import { CourseManager } from "@/components/admin/CourseManager";
import { validateEmail, validatePassword, validateName, sanitizeInput } from "@/utils/validation";
import { authRateLimiter } from "@/utils/validation";
import { SecurePIIDisplay } from "@/components/SecurePIIDisplay";
import { SecurityStatusIndicator } from "@/components/SecurityStatusIndicator";
import { SecurityComplianceStatus } from "@/components/SecurityComplianceStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
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
interface SystemStatus {
  database: 'online' | 'offline' | 'degraded';
  authentication: 'active' | 'inactive' | 'error';
  securityMonitoring: 'enabled' | 'disabled' | 'partial';
  realTimeUpdates: 'connected' | 'disconnected' | 'reconnecting';
}

// Add type definition for the RPC response
interface ActiveAdminWithActivity {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  recent_activity_count: number;
  last_activity: string;
}
const AdminDashboard = () => {
  const {
    user
  } = useAuth();
  const {
    userRole,
    isAdmin,
    isLoading: roleLoading
  } = useAdminRole();
  console.log(`User role in AdminDashboard: ${userRole}, IsAdmin: ${isAdmin}, RoleLoading: ${roleLoading}`);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAdmins: 0,
    securityEvents: 0,
    systemHealth: 'excellent'
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    authentication: 'active',
    securityMonitoring: 'enabled',
    realTimeUpdates: 'reconnecting' // Start with reconnecting, let subscription set to connected
  });
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
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
  const [hasAccessError, setHasAccessError] = useState(false);
  useEffect(() => {
    // Prevent loading if role is still loading or if user doesn't have admin access
    if (roleLoading || !user) {
      return;
    }

    // Only load dashboard data if user is confirmed admin
    if (isAdmin) {
      loadDashboardData();
    } else {
      // If not admin, set loading to false and don't attempt to load admin data
      setLoading(false);
      setHasAccessError(true);
      return;
    }

    // Set up real-time subscriptions for live admin dashboard (only for confirmed admins)
    const setupRealtimeSubscriptions = () => {
      if (!isAdmin || roleLoading) {
        return;
      }

      // Remove any existing channel first
      if (realtimeChannel) {
        console.log('Removing existing realtime channel');
        try {
          supabase.removeChannel(realtimeChannel);
        } catch (error) {
          console.warn('Error removing existing channel:', error);
        }
        setRealtimeChannel(null);
      }
      console.log('Setting up realtime subscriptions...');

      // Debounce dashboard data loading to prevent overwhelming the system
      let loadTimeout: NodeJS.Timeout;
      const debouncedLoadData = () => {
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
          if (isAdmin && !roleLoading) {
            loadDashboardData();
          }
        }, 2000); // Wait 2 seconds before loading data
      };

      // Use a simple channel name with better error handling
      const channel = supabase.channel('admin-dashboard', {
        config: {
          presence: {
            key: `admin-${user?.id}`
          }
        }
      }).on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_events',
        filter: 'severity=in.(critical,high)' // Only listen to critical/high events
      }, payload => {
        console.log('Security event received:', payload);
        toast({
          title: "Security Alert",
          description: `New ${payload.new.severity} security event detected`,
          variant: payload.new.severity === 'critical' ? 'destructive' : 'default'
        });
        debouncedLoadData();
      }).subscribe((status, err) => {
        console.log('Admin dashboard realtime subscription status:', status, err);
        switch (status) {
          case 'SUBSCRIBED':
            setSystemStatus(prev => ({
              ...prev,
              realTimeUpdates: 'connected'
            }));
            console.log('✅ Admin dashboard realtime connection established');
            break;
          case 'CHANNEL_ERROR':
          case 'CLOSED':
            setSystemStatus(prev => ({
              ...prev,
              realTimeUpdates: 'disconnected'
            }));
            console.warn(`⚠️ Admin dashboard realtime ${status.toLowerCase()}`);
            break;
          default:
            if (!err && status !== 'CHANNEL_ERROR' && status !== 'CLOSED') {
              setSystemStatus(prev => ({
                ...prev,
                realTimeUpdates: 'connected'
              }));
            } else {
              setSystemStatus(prev => ({
                ...prev,
                realTimeUpdates: 'disconnected'
              }));
            }
        }
      });
      setRealtimeChannel(channel);

      // Cleanup timeout on unmount
      return () => {
        clearTimeout(loadTimeout);
      };
    };

    // Only setup realtime if user is confirmed admin
    if (isAdmin) {
      setupRealtimeSubscriptions();
    }

    // Cleanup function
    return () => {
      if (realtimeChannel) {
        console.log('Cleaning up admin dashboard realtime channel');
        try {
          supabase.removeChannel(realtimeChannel);
        } catch (error) {
          console.warn('Error cleaning up admin dashboard realtime channel:', error);
        }
        setRealtimeChannel(null);
      }
    };
  }, [user, isAdmin, roleLoading]);
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize active admin count
      let activeAdminsCount = 0;

      // Load user roles using the new secure database function with PII protection
      let userRolesData = [];
      try {
        // Use the working secure admin profiles function  
        const {
          data: profilesWithRoles,
          error: profilesError
        } = await supabase.rpc('get_secure_admin_profiles');
        if (profilesError) {
          console.warn('Secure admin profiles function failed:', profilesError);
          throw profilesError;
        }
        if (profilesWithRoles && profilesWithRoles.length > 0) {
          // Count active admins directly from the get_secure_admin_profiles response
          const activeAdminsFromProfiles = profilesWithRoles.filter((profile: any) => {
            const isAdminRole = ['admin', 'super_admin', 'tech_support_admin'].includes(profile.role);
            console.log(`User ${profile.name} (${profile.user_id}) - Role: ${profile.role}, IsAdmin: ${isAdminRole}`);
            return isAdminRole;
          });
          activeAdminsCount = activeAdminsFromProfiles.length;
          console.log('Active admins found:', activeAdminsCount, activeAdminsFromProfiles.map(p => ({
            name: p.name,
            role: p.role
          })));

          // Group by user_id to consolidate users with multiple roles
          const userMap = new Map();
          profilesWithRoles.forEach((item: any) => {
            const userId = item.user_id;
            if (userMap.has(userId)) {
              // User already exists, keep the highest priority role
              const existing = userMap.get(userId);
              const rolePriority = {
                'super_admin': 1,
                'admin': 2,
                'tech_support_admin': 3,
                'instructor': 4,
                'trainee': 5
              };
              const currentPriority = rolePriority[item.role as keyof typeof rolePriority] || 999;
              const existingPriority = rolePriority[existing.role as keyof typeof rolePriority] || 999;
              if (currentPriority < existingPriority) {
                // Replace with higher priority role
                userMap.set(userId, {
                  id: item.user_id,
                  user_id: item.user_id,
                  role: item.role,
                  is_active: item.role_is_active !== false, // Default to true if undefined
                  created_at: item.role_created_at || item.created_at,
                  updated_at: item.updated_at,
                  profiles: {
                    name: item.name,
                    email: item.email,
                    phone: item.phone,
                    title: item.title,
                    company: item.company
                  }
                });
              }
            } else {
              // New user
              userMap.set(userId, {
                id: item.user_id,
                user_id: item.user_id,
                role: item.role,
                is_active: item.role_is_active !== false, // Default to true if undefined
                created_at: item.role_created_at || item.created_at,
                updated_at: item.updated_at,
                profiles: {
                  name: item.name,
                  email: item.email,
                  phone: item.phone,
                  title: item.title,
                  company: item.company
                }
              });
            }
          });

          // Convert map to array
          userRolesData = Array.from(userMap.values());
        } else {}
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

      // Try to fetch security events, but don't fail if access denied
      let eventsData = [];
      try {
        const {
          data: securityEventsData,
          error: eventsError
        } = await supabase.from('security_events').select('*').order('created_at', {
          ascending: false
        }).limit(10);
        if (eventsError && eventsError.code !== '42501') {
          console.warn('Security events query failed:', eventsError);
        } else if (!eventsError) {
          eventsData = securityEventsData || [];
          // Focus on detecting real threats only
          eventsData = eventsData?.filter(event => event.severity !== 'low' && event.event_type !== 'developer_tools_detected' && event.event_type !== 'profile_self_access' && event.event_type !== 'session_validation') || [];
        }
      } catch (securityError) {
        console.warn('Could not load security events (insufficient permissions):', securityError);
      }
      setUserRoles(userRolesData);
      setSecurityEvents(eventsData || []);

      // Use the active admins count we calculated earlier
      const activeAdmins = activeAdminsCount;

      // Calculate stats from the data
      const totalUsers = new Set(userRolesData.map((role: UserRole) => role.user_id)).size;
      const recentEvents = eventsData?.filter(event => event.created_at && new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0;
      setStats({
        totalUsers,
        activeAdmins,
        securityEvents: recentEvents,
        systemHealth: recentEvents > 10 ? 'critical' : recentEvents > 5 ? 'warning' : recentEvents > 0 ? 'good' : 'excellent'
      });

      // Check system status in real-time
      await checkSystemStatus();

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
  const checkSystemStatus = async () => {
    try {
      // Test database connectivity using a simpler query that doesn't trigger RLS
      const {
        error: dbTest
      } = await supabase.rpc('check_current_user_admin_status');
      if (dbTest) {
        console.error('Database connectivity test failed:', dbTest);
        setSystemStatus(prev => ({
          ...prev,
          database: 'offline'
        }));
      } else {
        setSystemStatus(prev => ({
          ...prev,
          database: 'online'
        }));
      }

      // Test authentication
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        setSystemStatus(prev => ({
          ...prev,
          authentication: 'inactive'
        }));
      } else {
        setSystemStatus(prev => ({
          ...prev,
          authentication: 'active'
        }));
      }

      // Check security monitoring by testing admin access
      try {
        // Use the admin status check and properly type the response
        const {
          data: adminCheck
        } = await supabase.rpc('check_current_user_admin_status');
        if (adminCheck && typeof adminCheck === 'object' && 'is_admin' in adminCheck && adminCheck.is_admin) {
          setSystemStatus(prev => ({
            ...prev,
            securityMonitoring: 'enabled'
          }));
        } else {
          setSystemStatus(prev => ({
            ...prev,
            securityMonitoring: 'partial'
          }));
        }
      } catch (securityError) {
        console.warn('Security monitoring check failed:', securityError);
        setSystemStatus(prev => ({
          ...prev,
          securityMonitoring: 'disabled'
        }));
      }
    } catch (error) {
      console.error('System status check failed:', error);
      setSystemStatus(prev => ({
        ...prev,
        database: 'offline',
        authentication: 'error'
      }));
    }

    // Note: We don't touch realTimeUpdates here - let the subscription callback manage it
  };
  const assignRole = async (userId: string, role: 'admin' | 'super_admin' | 'manager' | 'agent' | 'trainee' | 'tech_support_admin' | 'loan_processor' | 'underwriter' | 'funder' | 'closer' | 'tech' | 'loan_originator') => {
    try {
      setLoading(true);

      // Try secure function first, fallback to direct RPC
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('secure-admin-operations', {
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
        const {
          data,
          error
        } = await supabase.rpc('assign_user_role', {
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
      } else if (error?.message?.includes('@halobusinessfinance.com')) {
        errorMessage = `${error.message}\\n\\nOnly users with @halobusinessfinance.com email addresses can be assigned admin roles.`;
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
        const {
          data,
          error
        } = await supabase.functions.invoke('secure-admin-operations', {
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
        const {
          data,
          error
        } = await supabase.rpc('revoke_user_role', {
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
    // Enhanced input validation and sanitization
    const sanitizedEmail = sanitizeInput(newUserData.email).trim().toLowerCase();
    const sanitizedFullName = sanitizeInput(newUserData.fullName).trim();
    const rawPassword = newUserData.password; // Don't sanitize passwords

    // Validate email format
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.message || "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(rawPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: passwordValidation.message || "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        variant: "destructive"
      });
      return;
    }

    // Validate name
    const nameValidation = validateName(sanitizedFullName);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.message || "Please enter a valid full name.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    if (!authRateLimiter.isAllowed(`create_user_${user?.id}`)) {
      toast({
        title: "Rate Limited",
        description: "Too many user creation attempts. Please wait before trying again.",
        variant: "destructive"
      });
      return;
    }
    try {
      setCreatingUser(true);

      // Create user account using Edge Function for enhanced security
      const {
        data: createData,
        error: createError
      } = await supabase.functions.invoke('secure-admin-operations', {
        body: {
          operation: 'create_user_account',
          email: sanitizedEmail,
          password: rawPassword,
          fullName: sanitizedFullName,
          initialRole: newUserData.role,
          reason: 'User account creation via admin dashboard'
        }
      });
      if (createError) {
        throw createError;
      }
      toast({
        title: "User Created Successfully",
        description: `User ${sanitizedFullName} has been created with ${newUserData.role} role.`
      });

      // Clear form
      setNewUserData({
        email: '',
        password: '',
        fullName: '',
        role: 'trainee'
      });

      // Reload dashboard data
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user account';
      if (error?.message?.includes('already registered')) {
        errorMessage = 'A user with this email address already exists';
      } else if (error?.message?.includes('admin role')) {
        errorMessage = 'Only users with company email addresses can be assigned admin roles';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Error Creating User",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreatingUser(false);
    }
  };
  const deleteUser = async (userId: string) => {
    try {
      setDeletingUser(userId);
      const {
        data,
        error
      } = await supabase.functions.invoke('delete-user', {
        body: {
          userId: userId,
          reason: 'User deletion via admin dashboard'
        }
      });
      if (error) throw error;
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted from the system."
      });

      // Reload the dashboard data
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingUser(null);
    }
  };

  // Loading state with modern design
  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>;
  }

  // Access denied state with modern design
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md shadow-elegant border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Please contact your system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>;
  }

  // Database access error state
  if (hasAccessError) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md shadow-elegant border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              
            </div>
            <CardTitle className="text-destructive">Database Access Issue</CardTitle>
            <CardDescription>
              Unable to load admin data due to permission restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 text-black">
            <p className="text-sm text-muted-foreground">
              This may indicate that your admin privileges are not properly configured.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Corporate Header */}
        <div className="border-b border-border/20 pb-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1 bg-white">
                    Enterprise-grade system administration and monitoring
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-base text-muted-foreground">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <span>Live Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        {!loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground mb-2 bg-white">{stats.totalUsers}</div>
                <p className="text-sm text-accent font-semibold">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Active Admins</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground mb-2">{stats.activeAdmins}</div>
                <p className="text-sm text-muted-foreground">System administrators</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Security Events</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground mb-2">{stats.securityEvents}</div>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">System Health</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground capitalize mb-2">{stats.systemHealth}</div>
                <p className="text-sm text-muted-foreground capitalize">{stats.systemHealth}</p>
              </CardContent>
            </Card>
          </div>}

        {/* Modern Tabs Interface */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-border/20 shadow-sm">
            <TabsList className="grid w-full grid-cols-7 bg-transparent gap-2">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="trainee-progress" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl bg-white">
                <span>Courses</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>Videos</span>
              </TabsTrigger>
              <TabsTrigger value="cms" className="data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <span>CMS</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse border-border/50">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-6 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                  </Card>)}
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {securityEvents.slice(0, 3).map(event => <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                          <span className="text-sm font-medium">{event.event_type}</span>
                          <span className={`text-sm font-medium capitalize ${event.severity === 'critical' ? 'text-destructive' : 'text-foreground'}`}>
                            {event.severity}
                          </span>
                        </div>)}
                      {securityEvents.length === 0 && <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No recent security events</p>
                        </div>}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      User Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(userRoles.reduce((acc, role) => {
                    acc[role.role] = (acc[role.role] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map(([role, count]) => <div key={role} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span className="text-sm font-medium capitalize">{role.replace('_', ' ')}</span>
                          <span className="text-sm font-semibold text-foreground">{count}</span>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm font-medium">Database</span>
                        <span className="text-sm capitalize">
                          {systemStatus.database}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm font-medium">Authentication</span>
                        <span className="text-sm capitalize">
                          {systemStatus.authentication}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm font-medium">Security Monitoring</span>
                        <span className="text-sm capitalize">
                          {systemStatus.securityMonitoring}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium">Real-time Updates</span>
                        <span className="text-sm capitalize">
                          {systemStatus.realTimeUpdates}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement
              userRoles={userRoles}
              currentUserRole={userRole}
              currentUserId={user?.id}
              loading={loading}
              onAssignRole={assignRole}
              onRevokeRole={revokeRole}
              onDeleteUser={deleteUser}
              onCreateUser={createNewUser}
              deletingUser={deletingUser}
              creatingUser={creatingUser}
            />
          </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <SecurityComplianceStatus />
                  <SecurityFixCenter />
                  <SecurityDashboard />
                </TabsContent>

          <TabsContent value="trainee-progress" className="space-y-4">
            <TraineeProgressView />
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <CourseManager />
          </TabsContent>


          <TabsContent value="videos" className="space-y-4">
            <VideoManager />
          </TabsContent>

          <TabsContent value="cms" className="space-y-4">
            <CMSManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default AdminDashboard;