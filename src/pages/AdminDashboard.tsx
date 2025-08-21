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
  BookOpen
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { InstructorForm } from "@/components/InstructorForm";
import { VideoManager } from "@/components/admin/VideoManager";
import { ArticleManager } from "@/components/admin/ArticleManager";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import { ResourceManager } from "@/components/admin/ResourceManager";
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
  systemHealth: 'good' | 'warning' | 'critical';
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
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAdmins: 0,
    securityEvents: 0,
    systemHealth: 'good'
  });
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showInstructorForm, setShowInstructorForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load ALL users from profiles table and their roles (if any)
      let userRolesData = [];
      
      try {
        // Fetch all profiles and their associated roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (
              id,
              role,
              is_active,
              created_at,
              updated_at
            )
          `)
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Transform the data to match the UI expectations
        userRolesData = profiles?.flatMap(profile => {
          if (profile.user_roles && profile.user_roles.length > 0) {
            // User has roles - create an entry for each role
            return profile.user_roles.map(role => ({
              id: role.id,
              user_id: profile.user_id,
              role: role.role,
              is_active: role.is_active,
              created_at: role.created_at,
              updated_at: role.updated_at,
              profiles: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                title: profile.title,
                company: profile.company,
                city: profile.city,
                state: profile.state,
                join_date: profile.join_date
              }
            }));
          } else {
            // User has no roles - show as "no role"
            return [{
              id: `no-role-${profile.user_id}`,
              user_id: profile.user_id,
              role: 'No Role Assigned',
              is_active: false,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              profiles: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                title: profile.title,
                company: profile.company,
                city: profile.city,
                state: profile.state,
                join_date: profile.join_date
              }
            }];
          }
        }) || [];

        console.log('Loaded all users with their roles:', userRolesData);
        console.log('Total profiles found:', profiles?.length);
        console.log('Total role entries created:', userRolesData.length);
      } catch (directError) {
        console.warn('Failed to load all users with roles:', directError);
        
        // Fallback: Load profiles and roles separately
        const [profilesResponse, rolesResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('user_roles')
            .select('*')
        ]);

        if (profilesResponse.error) throw profilesResponse.error;
        if (rolesResponse.error) throw rolesResponse.error;

        const profiles = profilesResponse.data || [];
        const roles = rolesResponse.data || [];
        const rolesMap = new Map();
        
        // Group roles by user_id
        roles.forEach(role => {
          if (!rolesMap.has(role.user_id)) {
            rolesMap.set(role.user_id, []);
          }
          rolesMap.get(role.user_id).push(role);
        });

        // Create user role data for all profiles
        userRolesData = profiles.flatMap(profile => {
          const userRoles = rolesMap.get(profile.user_id) || [];
          
          if (userRoles.length > 0) {
            return userRoles.map(role => ({
              ...role,
              profiles: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                title: profile.title,
                company: profile.company,
                city: profile.city,
                state: profile.state,
                join_date: profile.join_date
              }
            }));
          } else {
            return [{
              id: `no-role-${profile.user_id}`,
              user_id: profile.user_id,
              role: 'No Role Assigned',
              is_active: false,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              profiles: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                title: profile.title,
                company: profile.company,
                city: profile.city,
                state: profile.state,
                join_date: profile.join_date
              }
            }];
          }
        });

        console.log('Loaded users with manual fallback logic:', userRolesData);
      }

      // Fetch other data in parallel
      const [
        { data: eventsData, error: eventsError },
        { data: instructorsData, error: instructorsError }
      ] = await Promise.all([
        supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('instructors')
          .select('*')
          .order('display_order', { ascending: true })
      ]);

      if (eventsError) throw eventsError;
      if (instructorsError) throw instructorsError;

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
        systemHealth: recentEvents > 10 ? 'critical' : recentEvents > 5 ? 'warning' : 'good'
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'super_admin' | 'manager' | 'agent' | 'viewer' | 'loan_processor' | 'underwriter' | 'funder' | 'closer' | 'tech' | 'loan_originator') => {
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

      toast({
        title: "Success",
        description: "User deleted successfully."
      });

      // Reload data to reflect changes
      await loadDashboardData();
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

      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      });
      
      loadDashboardData();
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

      toast({
        title: "Success",
        description: `Instructor ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      loadDashboardData();
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
    loadDashboardData();
  };

  const handleInstructorFormCancel = () => {
    setShowInstructorForm(false);
    setEditingInstructor(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
                stats.systemHealth === 'good' ? 'default' : 
                stats.systemHealth === 'warning' ? 'secondary' : 'destructive'
              }>
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
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
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
              <CardTitle>User Roles Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions. Use carefully as role changes affect system access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-mono text-sm">
                        {userRole.user_id.slice(0, 8)}...
                        {userRole.profiles && (
                          <div className="text-xs text-muted-foreground">
                            {userRole.profiles.name || 'No name'}
                          </div>
                        )}
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

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor system security events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.event_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {event.user_id ? `${event.user_id.slice(0, 8)}...` : 'System'}
                      </TableCell>
                      <TableCell>
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                        console.log('Clicking User Management button');
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
                        console.log('Clicking Authentication Providers button');
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
                        console.log('Clicking URL Configuration button');
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
                        console.log('Clicking System Logs button');
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
                        console.log('Clicking Database Tables button');
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
                        console.log('Clicking Project Settings button');
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