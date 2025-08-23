import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Home, 
  BarChart3, 
  Award,
  Target,
  FileText,
  User,
  LogIn,
  LogOut
 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Progress", url: "/progress", icon: BarChart3 },
  { title: "Learning Resources", url: "/resources", icon: FileText },
];


// Base course modules in order
const baseCourseModules = [
  { title: "Finance Foundations", url: "/module/foundations" },
  { title: "Capital Markets", url: "/module/capital-markets" },
  { title: "SBA Loan Programs", url: "/module/sba-loans" },
  { title: "Conventional Lending", url: "/module/conventional-loans" },
  { title: "Bridge Financing", url: "/module/bridge-loans" },
  { title: "Alternative Finance", url: "/module/alternative-finance" },
  { title: "Credit Analysis", url: "/module/credit-risk" },
  { title: "Compliance", url: "/module/regulatory-compliance" },
];

// Progressive learning logic - strict sequential unlocking
const getProgressiveModules = () => {
  // In a real app, this would come from user progress data
  // For now, simulating strict sequential progression
  const userProgress = {
    completedModules: [], // No modules completed initially - users start fresh
    currentModule: "Finance Foundations" // Only the first module is available
  };
  
  return baseCourseModules.map((module, index) => {
    const isCompleted = userProgress.completedModules.includes(module.title);
    const isCurrent = module.title === userProgress.currentModule;
    
    if (isCompleted) {
      return { ...module, status: "completed" };
    } else if (isCurrent) {
      return { ...module, status: "available" }; // Available to start
    } else {
      // All other modules are locked until previous ones are completed
      return { ...module, status: "locked" };
    }
  });
};

const courseModules = getProgressiveModules();

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/'); // Redirect to homepage after successful sign out
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };
  
  const getNavCls = (isActiveState: boolean) =>
    isActiveState ? "bg-halo-orange text-white font-medium border-r-2 border-halo-orange" : "text-white hover:bg-white/10 hover:text-white";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="relative">
            <Badge variant="completed" className="text-xs px-2 py-0.5 bg-gradient-success text-white shadow-lg">
              ✓
            </Badge>
            <div className="absolute -inset-0.5 bg-gradient-success rounded opacity-20 animate-pulse"></div>
          </div>
        );
      case "in-progress":
        return (
          <div className="relative">
            <Badge variant="progress" className="text-xs px-2 py-0.5 bg-gradient-primary text-white shadow-lg animate-pulse">
              ●
            </Badge>
            <div className="absolute -inset-0.5 bg-gradient-primary rounded opacity-30 animate-pulse"></div>
          </div>
        );
      case "locked":
        return <Badge variant="outline" className="text-xs px-2 py-0.5 opacity-60">🔒</Badge>;
      default:
        return (
          <Badge variant="success" className="text-xs px-2 py-0.5 bg-gradient-to-r from-accent/80 to-accent text-white shadow-md hover:shadow-lg transition-shadow duration-300">
            ○
          </Badge>
        );
    }
  };

  return (
    <Sidebar
      className="bg-navy-900 border-navy-800"
      collapsible="icon"
      variant="inset"
    >
      <SidebarContent>
        {/* Welcome Message */}
        {user && !collapsed && (
          <div className="px-4 py-4 border-b border-navy-700/50 bg-navy-800/50">
            <div className="text-white">
              <div className="text-xs font-medium text-white/80">Welcome back,</div>
              <div className="text-sm font-semibold text-halo-orange">
                {user.user_metadata?.full_name?.split(' ')[0] || 
                 user.user_metadata?.name?.split(' ')[0] || 
                 user.email?.split('@')[0] || 'User'}!
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup className="pt-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                     <NavLink to={item.url} end className={({ isActive }) => getNavCls(isActive)}>
                       <item.icon className="h-4 w-4 text-white" />
                       {!collapsed && <span className="text-white text-sm">{item.title}</span>}
                     </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="px-4 py-2">
          <Separator className="bg-gradient-to-r from-border/50 to-transparent" />
        </div>

        {/* Course Modules */}
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel className="pb-3 mb-2">
            {!collapsed && (
              <div className="flex-1">
                <span className="text-sm font-semibold text-white tracking-wide">
                  Course Modules
                </span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu className="space-y-1">
              {courseModules.map((module, index) => {
                const isModuleLocked = module.status === "locked";
                const canAccess = !isModuleLocked || isAdmin;
                return (
                  <SidebarMenuItem key={module.title}>
                    <SidebarMenuButton asChild>
                       <NavLink 
                         to={canAccess ? module.url : "#"}
                         onClick={(e) => {
                           if (!canAccess) {
                             e.preventDefault();
                             toast({
                               title: "🔒 Module Locked",
                               description: "Complete the previous module to unlock this one!",
                               variant: "destructive",
                               duration: 3000,
                             });
                           }
                         }}
                          className={({ isActive }) => `
                            ${getNavCls(isActive)} 
                            ${isModuleLocked ? "opacity-50" : ""} 
                            ${!canAccess ? "cursor-not-allowed" : ""}
                            group relative overflow-hidden rounded-xl p-3 transition-all duration-500 ease-out
                            hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]
                            border border-transparent hover:border-primary/20
                            backdrop-blur-sm
                          `}
                       >
                        <div className="relative z-10 flex items-center w-full gap-3">
                          {/* Status Indicator */}
                          <div className="relative flex-shrink-0">
                            <div className={`
                              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold 
                              transition-all duration-500 ease-out
                              ${module.status === "completed" 
                                ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-400/25 ring-2 ring-green-400/20" 
                                : module.status === "in-progress" 
                                  ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-400/25 ring-2 ring-blue-400/20 animate-pulse" 
                                  : module.status === "available" 
                                    ? "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20" 
                                    : "bg-gradient-to-br from-muted to-muted-foreground/30 text-muted-foreground/60 ring-1 ring-border"}
                              group-hover:scale-110 group-hover:rotate-3
                            `}>
                              {module.status === "completed" ? (
                                <div className="animate-bounce">✓</div>
                              ) : module.status === "in-progress" ? (
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              ) : isModuleLocked ? (
                                "🔒"
                              ) : (
                                <span className="font-bold">{index + 1}</span>
                              )}
                            </div>
                            
                            {/* Animated ring for active states */}
                            {(module.status === "completed" || module.status === "in-progress") && (
                              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
                            )}
                          </div>
                        
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-xs font-medium text-white leading-tight truncate group-hover:text-white transition-colors">
                                   {module.title}
                                 </h3>
                                
                                {/* Status Badge */}
                                <div className="ml-2 flex-shrink-0">
                                  {module.status === "completed" && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50"></div>
                                  )}
                                  {module.status === "in-progress" && (
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-sm shadow-blue-400/50"></div>
                                  )}
                                  {module.status === "available" && (
                                    <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Progress Bar for in-progress modules */}
                              {module.status === "in-progress" && (
                                <div className="mt-2 w-full bg-muted/30 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                       style={{ width: "65%" }}></div>
                                </div>
                              )}
                              
                              {/* Subtle description for available modules */}
                                 {module.status === "available" && !isModuleLocked && (
                                 <p className="text-xs text-white/70 mt-1 transition-opacity duration-300">
                                   Ready to start
                                 </p>
                               )}
                            </div>
                          )}
                        </div>
                        
                         {/* Elegant hover effect - removed background color */}
                        
                        {/* Active state indicator */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-r-full opacity-0 transition-opacity duration-300 data-[active=true]:opacity-100"></div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Authentication */}
        <SidebarGroup className="-mt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {!loading && (
                <SidebarMenuItem>
                  {user ? (
                    <SidebarMenuButton asChild>
                       <button 
                         onClick={handleSignOut}
                         disabled={isLoading}
                         className="w-full flex items-center gap-2 text-white hover:bg-white/10 hover:text-white p-2 rounded disabled:opacity-50"
                       >
                         <LogOut className="h-4 w-4 text-halo-orange" />
                         {!collapsed && <span className="text-white text-sm">{isLoading ? "Signing Out..." : "Sign Out"}</span>}
                       </button>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                       <button 
                         onClick={handleSignIn}
                         className="w-full flex items-center gap-2 text-white hover:bg-white/10 hover:text-white p-2 rounded"
                       >
                         <LogIn className="h-4 w-4 text-halo-orange" />
                         {!collapsed && <span className="text-white text-sm">Sign In</span>}
                       </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )}
              {loading && (
                <SidebarMenuItem>
                   <div className="text-xs text-white/70 p-2">Loading...</div>
                 </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}