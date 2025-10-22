import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SecurePIIDisplay } from "@/components/SecurePIIDisplay";
import { Search, Filter, UserPlus, MoreVertical, Shield, User, Trash2, ArrowUpDown } from "lucide-react";
import { sanitizeInput } from "@/utils/validation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

interface UserManagementProps {
  userRoles: UserRole[];
  currentUserRole: string | null;
  currentUserId?: string;
  loading: boolean;
  onAssignRole: (userId: string, role: string) => Promise<void>;
  onRevokeRole: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onCreateUser: (userData: any) => Promise<void>;
  deletingUser: string | null;
  creatingUser: boolean;
}

export function UserManagement({
  userRoles,
  currentUserRole,
  currentUserId,
  loading,
  onAssignRole,
  onRevokeRole,
  onDeleteUser,
  onCreateUser,
  deletingUser,
  creatingUser
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'trainee'
  });

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...userRoles];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.profiles?.name?.toLowerCase().includes(query) ||
        user.profiles?.email?.toLowerCase().includes(query) ||
        user.user_id.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => 
        statusFilter === "active" ? user.is_active : !user.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case "name":
          aVal = a.profiles?.name || "";
          bVal = b.profiles?.name || "";
          break;
        case "email":
          aVal = a.profiles?.email || "";
          bVal = b.profiles?.email || "";
          break;
        case "role":
          aVal = a.role;
          bVal = b.role;
          break;
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [userRoles, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Role badge styling
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "admin":
        return "secondary";
      case "tech_support_admin":
        return "outline";
      default:
        return "outline";
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.user_id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle individual selection
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Stats
  const stats = {
    total: userRoles.length,
    active: userRoles.filter(u => u.is_active).length,
    admins: userRoles.filter(u => ["admin", "super_admin", "tech_support_admin"].includes(u.role)).length,
    trainees: userRoles.filter(u => u.role === "trainee").length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                <p className="text-3xl font-bold mt-1">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trainees</p>
                <p className="text-3xl font-bold mt-1">{stats.trainees}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-elegant">
        <CardHeader className="bg-gradient-to-r from-card to-card/80 border-b border-border/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow-md transition-all">
                  <UserPlus className="w-4 h-4 mr-2" />
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
                    <Input 
                      id="email" 
                      type="email" 
                      value={newUserData.email}
                      onChange={e => setNewUserData({ ...newUserData, email: sanitizeInput(e.target.value) })}
                      placeholder="user@example.com"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="password" className="text-sm font-semibold">Password</label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newUserData.password}
                      onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                      placeholder="Strong password"
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="fullName" className="text-sm font-semibold">Full Name</label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      value={newUserData.fullName}
                      onChange={e => setNewUserData({ ...newUserData, fullName: sanitizeInput(e.target.value) })}
                      placeholder="John Doe"
                      maxLength={50}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="role" className="text-sm font-semibold">Initial Role</label>
                    <Select value={newUserData.role} onValueChange={role => setNewUserData({ ...newUserData, role })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainee">Trainee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="tech_support_admin">Tech Support Admin</SelectItem>
                        {currentUserRole === 'super_admin' && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={creatingUser}>Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={() => onCreateUser(newUserData)}
                    disabled={creatingUser || !newUserData.email || !newUserData.password}
                  >
                    {creatingUser ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : 'Create User'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tech_support_admin">Tech Support</SelectItem>
                  <SelectItem value="trainee">Trainee</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedUsers(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No users found.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        <button
                          className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
                          onClick={() => toggleSort("name")}
                        >
                          User
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[220px]">
                        <button
                          className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
                          onClick={() => toggleSort("email")}
                        >
                          Email
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[140px]">
                        <button
                          className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
                          onClick={() => toggleSort("role")}
                        >
                          Role
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Status</TableHead>
                      <TableHead className="min-w-[120px]">
                        <button
                          className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
                          onClick={() => toggleSort("created_at")}
                        >
                          Joined
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map(userRoleItem => (
                      <TableRow 
                        key={userRoleItem.id} 
                        className="border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(userRoleItem.user_id)}
                            onCheckedChange={(checked) => handleSelectUser(userRoleItem.user_id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <SecurePIIDisplay 
                            value={userRoleItem.profiles?.name || null} 
                            type="name" 
                            showMaskingIndicator={true} 
                            userRole={currentUserRole || 'user'} 
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <SecurePIIDisplay 
                            value={userRoleItem.profiles?.email || null} 
                            type="email" 
                            showMaskingIndicator={true} 
                            userRole={currentUserRole || 'user'} 
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-medium capitalize">
                            {userRoleItem.role.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${userRoleItem.is_active ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                            <span className="text-sm">
                              {userRoleItem.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">
                          {new Date(userRoleItem.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold px-2 py-1">Assign Role</p>
                                <div className="space-y-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full justify-start"
                                    onClick={() => onAssignRole(userRoleItem.user_id, 'trainee')}
                                    disabled={userRoleItem.role === 'trainee'}
                                  >
                                    Trainee
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full justify-start"
                                    onClick={() => onAssignRole(userRoleItem.user_id, 'tech_support_admin')}
                                    disabled={userRoleItem.role === 'tech_support_admin'}
                                  >
                                    Tech Support Admin
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full justify-start"
                                    onClick={() => onAssignRole(userRoleItem.user_id, 'admin')}
                                    disabled={userRoleItem.role === 'admin'}
                                  >
                                    Admin
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full justify-start"
                                    onClick={() => onAssignRole(userRoleItem.user_id, 'super_admin')}
                                    disabled={userRoleItem.role === 'super_admin'}
                                  >
                                    Super Admin
                                  </Button>
                                </div>
                                <div className="border-t pt-2 space-y-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full justify-start"
                                    onClick={() => onRevokeRole(userRoleItem.user_id)}
                                    disabled={!userRoleItem.is_active}
                                  >
                                    Revoke Role
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                        disabled={userRoleItem.user_id === currentUserId || deletingUser === userRoleItem.user_id}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {deletingUser === userRoleItem.user_id ? 'Deleting...' : 'Delete User'}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="border-border/50 shadow-elegant">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to permanently delete this user? This action cannot be undone.
                                          The user will be completely removed from the system including all their data.
                                          <br /><br />
                                          <strong>User ID:</strong> {userRoleItem.user_id}
                                          <br />
                                          <strong>Role:</strong> {userRoleItem.role}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => onDeleteUser(userRoleItem.user_id)}
                                          className="bg-destructive hover:bg-destructive/90"
                                        >
                                          Delete Permanently
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-border/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
