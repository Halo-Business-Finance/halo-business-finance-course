// Admin Dashboard with User Management - Updated
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

import { SecurityDashboard } from "@/components/SecurityDashboard";
import { SecurityMonitoringDashboard } from "@/components/SecurityMonitoringDashboard";
import { SecurityMonitoringWidget } from "@/components/SecurityMonitoringWidget";
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
  const { user } = useAuth();
  const { userRole, isAdmin, isLoading: roleLoading } = useAdminRole();
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
    realTimeUpdates: 'disconnected'
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
    loadDashboardData();
    
    // Set up real-time subscriptions for live admin dashboard with retry logic
    const setupRealtimeSubscriptions = () => {
      // Remove any existing channel first
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      
      console.log('Setting up realtime subscriptions...');
      setSystemStatus(prev => ({ ...prev, realTimeUpdates: 'reconnecting' }));
      
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
            console.log('Security event received:', payload);
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
            console.log('Profile event received:', payload);
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
            console.log('User role event received:', payload);
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
          console.log('Realtime subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setSystemStatus(prev => ({ ...prev, realTimeUpdates: 'connected' }));
            console.log('✅ Realtime connection established successfully');
            toast({
              title: "Live Dashboard",
              description: "Real-time monitoring is now active",
            });
          } else if (status === 'CHANNEL_ERROR') {
            setSystemStatus(prev => ({ ...prev, realTimeUpdates: 'disconnected' }));
            console.error('❌ Realtime channel error');
            toast({
              title: "Connection Error",
              description: "Real-time updates disconnected",
              variant: "destructive"
            });
            // Retry connection after 5 seconds
            setTimeout(() => {
              console.log('Retrying realtime connection...');
              setupRealtimeSubscriptions();
            }, 5000);
          } else if (status === 'CLOSED') {
            setSystemStatus(prev => ({ ...prev, realTimeUpdates: 'disconnected' }));
            console.warn('⚠️ Realtime channel closed');
            // Retry connection after 3 seconds
            setTimeout(() => {
              console.log('Reconnecting after channel close...');
              setupRealtimeSubscriptions();
            }, 3000);
          } else {
            // Any other status means connecting/reconnecting
            setSystemStatus(prev => ({ ...prev, realTimeUpdates: 'reconnecting' }));
            console.log(`🔄 Realtime status: ${status}`);
          }
        });
        
      setRealtimeChannel(channel);
    };

    setupRealtimeSubscriptions();
    
    // Cleanup function
    return () => {
      if (realtimeChannel) {
        console.log('Cleaning up realtime channel');
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize active admin count
      let activeAdminsCount = 0;
      
      // Load user roles using the new secure database function with PII protection
      let userRolesData = [];
      
      try {
        // Use the working secure admin profiles function  
        const { data: profilesWithRoles, error: profilesError } = await supabase.rpc('get_secure_admin_profiles');

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
          console.log('Active admins found:', activeAdminsCount, activeAdminsFromProfiles.map(p => ({ name: p.name, role: p.role })));
          
          // Group by user_id to consolidate users with multiple roles
          const userMap = new Map();
          
          profilesWithRoles.forEach((item: any) => {
            const userId = item.user_id;
            
            if (userMap.has(userId)) {
              // User already exists, keep the highest priority role
              const existing = userMap.get(userId);
              const rolePriority = { 'super_admin': 1, 'admin': 2, 'tech_support_admin': 3, 'instructor': 4, 'trainee': 5 };
              const currentPriority = rolePriority[item.role as keyof typeof rolePriority] || 999;
              const existingPriority = rolePriority[existing.role as keyof typeof rolePriority] || 999;
              
              if (currentPriority < existingPriority) {
                // Replace with higher priority role
                userMap.set(userId, {
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
                });
              }
            } else {
              // New user
              userMap.set(userId, {
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
              });
            }
          });
          
          // Convert map to array
          userRolesData = Array.from(userMap.values());
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
          // Focus on detecting real threats only
          eventsData = eventsData?.filter(event => 
            event.severity !== 'low' && 
            event.event_type !== 'developer_tools_detected' &&
            event.event_type !== 'profile_self_access' &&
            event.event_type !== 'session_validation'
          ) || [];
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
    const newStatus: SystemStatus = {
      database: 'online',
      authentication: 'active', 
      securityMonitoring: 'enabled',
      realTimeUpdates: 'disconnected'
    };

    try {
      // Test database connectivity using a simpler query that doesn't trigger RLS
      const { error: dbTest } = await supabase.rpc('check_current_user_admin_status');
      if (dbTest) {
        console.error('Database connectivity test failed:', dbTest);
        newStatus.database = 'offline';
      }

      // Test authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        newStatus.authentication = 'inactive';
      }

      // Test real-time status more accurately
      if (realtimeChannel) {
        const channelState = realtimeChannel.state;
        console.log('Channel state during status check:', channelState);
        // Supabase channel states: 'closed', 'errored', 'joined', 'joining', 'leaving'
        // But we should also check if we have an active subscription
        if (channelState === 'joined' || systemStatus.realTimeUpdates === 'connected') {
          newStatus.realTimeUpdates = 'connected';
        } else if (channelState === 'joining') {
          newStatus.realTimeUpdates = 'reconnecting';
        } else if (channelState === 'closed' || channelState === 'errored') {
          newStatus.realTimeUpdates = 'disconnected';
        } else {
          // Preserve current status if channel exists and we're not sure
          newStatus.realTimeUpdates = systemStatus.realTimeUpdates || 'reconnecting';
        }
      } else {
        newStatus.realTimeUpdates = 'disconnected';
      }

      // Check security monitoring by testing admin access
      try {
        // Use the admin status check and properly type the response
        const { data: adminCheck } = await supabase.rpc('check_current_user_admin_status');
        if (adminCheck && typeof adminCheck === 'object' && 'is_admin' in adminCheck && adminCheck.is_admin) {
          newStatus.securityMonitoring = 'enabled';
        } else {
          newStatus.securityMonitoring = 'partial';
        }
      } catch (securityError) {
        console.warn('Security monitoring check failed:', securityError);
        newStatus.securityMonitoring = 'disabled';
      }

    } catch (error) {
      console.error('System status check failed:', error);
      newStatus.database = 'offline';
      newStatus.authentication = 'error';
    }

    setSystemStatus(newStatus);
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
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(rawPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: passwordValidation.message || "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        variant: "destructive",
      });
      return;
    }

    // Validate name
    const nameValidation = validateName(sanitizedFullName);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.message || "Please enter a valid full name.",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check
    if (!authRateLimiter.isAllowed(`create_user_${user?.id}`)) {
      toast({
        title: "Rate Limited",
        description: "Too many user creation attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingUser(true);

      // Create user account using Edge Function for enhanced security
      const { data: createData, error: createError } = await supabase.functions.invoke('secure-admin-operations', {
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
        description: `User ${sanitizedFullName} has been created with ${newUserData.role} role.`,
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
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setDeletingUser(userId);

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { 
          userId: userId,
          reason: 'User deletion via admin dashboard'
        }
      });

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User has been permanently deleted from the system.",
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


  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'tech_support_admin':
        return 'secondary';
      case 'instructor':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Loading state with modern design
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied state with modern design
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md shadow-elegant border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
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
      </div>
    );
  }

  // Database access error state
  if (hasAccessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="max-w-md shadow-elegant border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Database Access Issue</CardTitle>
            <CardDescription>
              Unable to load admin data due to permission restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              This may indicate that your admin privileges are not properly configured.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Corporate Header */}
        <div className="border-b border-border/20 pb-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Enterprise-grade system administration and monitoring
                  </p>
                  <div className="mt-3">
                    <Badge variant="outline" className="flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm border-primary/20 text-base">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      <Activity className="h-5 w-5" />
                      Live Monitoring
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <SecurityStatusIndicator level="secure" message="Admin Access" size="sm" />
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground mb-2">{stats.totalUsers}</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <p className="text-sm text-accent font-semibold">+12% from last month</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500 bg-gradient-to-br from-card to-card/80 border-border/50">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Active Admins</CardTitle>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
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
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
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
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground capitalize mb-2">{stats.systemHealth}</div>
                <Badge variant={getHealthBadgeVariant(stats.systemHealth)} className="text-sm">
                  {stats.systemHealth === 'excellent' && '🟢'}
                  {stats.systemHealth === 'good' && '🟡'}
                  {stats.systemHealth === 'warning' && '🟠'}
                  {stats.systemHealth === 'critical' && '🔴'}
                  {' '}{stats.systemHealth}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modern Tabs Interface */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-border/20 shadow-sm">
            <TabsList className="grid w-full grid-cols-7 bg-transparent gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="trainee-progress" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Courses</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="cms" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-elegant transition-all duration-300 rounded-xl">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">CMS</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-border/50">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-6 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {securityEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                          <span className="text-sm font-medium">{event.event_type}</span>
                          <Badge variant={event.severity === 'critical' ? 'destructive' : 'default'} className="shadow-sm">
                            {event.severity}
                          </Badge>
                        </div>
                      ))}
                      {securityEvents.length === 0 && (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Activity className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">No recent security events</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      User Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        userRoles.reduce((acc, role) => {
                          acc[role.role] = (acc[role.role] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                          <span className="text-sm font-medium capitalize">{role.replace('_', ' ')}</span>
                          <Badge variant="outline" className="shadow-sm font-semibold">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                        <span className="text-sm font-medium">Database</span>
                        <Badge 
                          variant={systemStatus.database === 'online' ? 'default' : systemStatus.database === 'degraded' ? 'secondary' : 'destructive'} 
                          className="shadow-sm capitalize"
                        >
                          {systemStatus.database === 'online' && '🟢'} 
                          {systemStatus.database === 'degraded' && '🟡'} 
                          {systemStatus.database === 'offline' && '🔴'} 
                          {systemStatus.database}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                        <span className="text-sm font-medium">Authentication</span>
                        <Badge 
                          variant={systemStatus.authentication === 'active' ? 'default' : 'destructive'} 
                          className="shadow-sm capitalize"
                        >
                          {systemStatus.authentication === 'active' && '🟢'} 
                          {systemStatus.authentication === 'inactive' && '🟡'} 
                          {systemStatus.authentication === 'error' && '🔴'} 
                          {systemStatus.authentication}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                        <span className="text-sm font-medium">Security Monitoring</span>
                        <Badge 
                          variant={systemStatus.securityMonitoring === 'enabled' ? 'default' : systemStatus.securityMonitoring === 'partial' ? 'secondary' : 'destructive'} 
                          className="shadow-sm capitalize"
                        >
                          {systemStatus.securityMonitoring === 'enabled' && '🟢'} 
                          {systemStatus.securityMonitoring === 'partial' && '🟡'} 
                          {systemStatus.securityMonitoring === 'disabled' && '🔴'} 
                          {systemStatus.securityMonitoring}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                        <span className="text-sm font-medium">Real-time Updates</span>
                        <Badge 
                          variant={systemStatus.realTimeUpdates === 'connected' ? 'default' : systemStatus.realTimeUpdates === 'reconnecting' ? 'secondary' : 'destructive'} 
                          className="shadow-sm capitalize"
                        >
                          {systemStatus.realTimeUpdates === 'connected' && '🟢'} 
                          {systemStatus.realTimeUpdates === 'reconnecting' && '🟡'} 
                          {systemStatus.realTimeUpdates === 'disconnected' && '🔴'} 
                          {systemStatus.realTimeUpdates}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/50 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-card to-card/80 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      User Management
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Manage user accounts, roles, and permissions with enterprise-grade security
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="shadow-sm hover:shadow-md transition-all duration-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-border/50 shadow-elegant">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Create New User</DialogTitle>
                        <DialogDescription className="text-base">
                          Create a new user account with initial role assignment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
                          <input
                            id="email"
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({...newUserData, email: sanitizeInput(e.target.value)})}
                            className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
                            placeholder="user@example.com"
                            maxLength={100}
                            autoComplete="off"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="password" className="text-sm font-semibold">Password</label>
                          <input
                            id="password"
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                            className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
                            placeholder="Strong password"
                            minLength={8}
                            maxLength={128}
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="fullName" className="text-sm font-semibold">Full Name</label>
                           <input
                            id="fullName"
                            type="text"
                            value={newUserData.fullName}
                            onChange={(e) => setNewUserData({...newUserData, fullName: sanitizeInput(e.target.value)})}
                            className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
                            placeholder="John Doe"
                            maxLength={50}
                            autoComplete="off"
                           />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="role" className="text-sm font-semibold">Initial Role</label>
                          <select
                            id="role"
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                            className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
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
                      <div className="flex justify-end gap-3">
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
              <CardContent className="p-0">
                {!loading && userRoles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="min-w-[150px] font-semibold">User</TableHead>
                          <TableHead className="min-w-[200px] font-semibold">Email</TableHead>
                          <TableHead className="min-w-[100px] font-semibold">Role</TableHead>
                          <TableHead className="min-w-[80px] font-semibold">Status</TableHead>
                          <TableHead className="min-w-[100px] font-semibold">Joined</TableHead>
                          <TableHead className="min-w-[300px] font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                     {userRoles.map((userRole) => (
                       <TableRow key={userRole.id} className="border-border/30 hover:bg-muted/30 transition-colors duration-200">
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <SecurePIIDisplay 
                                value={userRole.profiles?.name || null} 
                                type="name" 
                                showMaskingIndicator={true}
                              />
                              <span className="font-mono text-xs text-muted-foreground">
                                {userRole.user_id.slice(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <SecurePIIDisplay 
                              value={userRole.profiles?.email || null} 
                              type="email" 
                              showMaskingIndicator={true}
                            />
                          </TableCell>
                         <TableCell className="py-4">
                           <Badge variant={getRoleBadgeVariant(userRole.role)} className="shadow-sm">
                             {userRole.role}
                           </Badge>
                         </TableCell>
                         <TableCell className="py-4">
                           <Badge variant={userRole.is_active ? "default" : "secondary"} className="shadow-sm">
                             {userRole.is_active ? "Active" : "Inactive"}
                           </Badge>
                         </TableCell>
                         <TableCell className="py-4">
                           {new Date(userRole.created_at).toLocaleDateString()}
                         </TableCell>
                         <TableCell className="min-w-[300px] py-4">
                           <div className="flex flex-wrap items-center gap-2">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => assignRole(userRole.user_id, 'trainee')}
                               disabled={userRole.role === 'trainee'}
                               title="Assign Trainee Role"
                               className="min-w-[36px] hover:shadow-sm transition-all duration-200"
                             >
                               <GraduationCap className="h-3 w-3" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => assignRole(userRole.user_id, 'tech_support_admin')}
                               disabled={userRole.role === 'tech_support_admin'}
                               title="Assign Tech Support Admin Role"
                               className="min-w-[36px] hover:shadow-sm transition-all duration-200"
                             >
                               <Wrench className="h-3 w-3" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => assignRole(userRole.user_id, 'admin')}
                               disabled={userRole.role === 'admin'}
                               title="Assign Admin Role"
                               className="min-w-[36px] hover:shadow-sm transition-all duration-200"
                             >
                               <UserCheck className="h-3 w-3" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => assignRole(userRole.user_id, 'super_admin')}
                               disabled={userRole.role === 'super_admin'}
                               title="Assign Super Admin Role"
                               className="min-w-[36px] hover:shadow-sm transition-all duration-200"
                             >
                               <Crown className="h-3 w-3" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => revokeRole(userRole.user_id)}
                               disabled={!userRole.is_active}
                               title="Revoke Role"
                               className="min-w-[36px] hover:shadow-sm transition-all duration-200"
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
                                   className="hover:bg-destructive hover:text-destructive-foreground min-w-[36px] hover:shadow-sm transition-all duration-200"
                                 >
                                   {deletingUser === userRole.user_id ? (
                                     <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                                   ) : (
                                     <Trash2 className="h-3 w-3" />
                                   )}
                                 </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-border/50 shadow-elegant">
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
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">No users found.</p>
                  </div>
                )}
              </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <SecurityComplianceStatus />
                  <SecurityFixCenter />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SecurityDashboard />
                    <SecurityMonitoringDashboard />
                  </div>
                  <SecurityMonitoringWidget />
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
    </div>
  );
};

export default AdminDashboard;
