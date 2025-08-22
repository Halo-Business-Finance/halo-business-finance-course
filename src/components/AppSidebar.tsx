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

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Progress", url: "/progress", icon: BarChart3 },
  { title: "Video Library", url: "/videos", icon: BookOpen },
  { title: "Learning Resources", url: "/resources", icon: FileText },
  { title: "My Account", url: "/account", icon: User },
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

// Progressive learning logic - only one module available at a time
const getProgressiveModules = () => {
  // For now, simulating user progress - replace with actual user progress data  
  const completedModules = ["Finance Foundations"]; // Only first module completed
  const currentModule = "Capital Markets"; // Currently working on this module
  
  return baseCourseModules.map((module, index) => {
    if (completedModules.includes(module.title)) {
      return { ...module, status: "completed" };
    } else if (module.title === currentModule) {
      return { ...module, status: "in-progress" };
    } else {
      // All other modules are locked - no exceptions
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
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
    isActiveState ? "bg-black/10 text-black font-medium border-r-2 border-black" : "text-black hover:bg-black/10 hover:text-black";

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
      collapsible="icon"
    >
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup className="pt-8">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({ isActive }) => getNavCls(isActive)}>
                      <item.icon className="h-4 w-4 text-black" />
                      {!collapsed && <span className="text-black">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Course Modules */}
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Target className="h-5 w-5 text-duke-blue" />
                <div className="absolute -inset-1 bg-gradient-duke rounded-full opacity-20 animate-pulse-slow"></div>
              </div>
              {!collapsed && (
                <span className="bg-gradient-duke bg-clip-text text-transparent font-semibold text-base">
                  Course Modules
                </span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-3">
            <SidebarMenu className="space-y-1">
              {courseModules.map((module, index) => {
                const isModuleLocked = module.status === "locked" && !isAdmin;
                return (
                  <SidebarMenuItem key={module.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={module.url} 
                        className={({ isActive }) => `${getNavCls(isActive)} ${
                          isModuleLocked ? "opacity-60 pointer-events-none" : ""
                        } group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gradient-to-r hover:from-black/5 hover:to-black/5`}
                      >
                        <div className="relative z-10 flex items-start w-full py-1">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 mt-0.5
                            ${module.status === "completed" ? "bg-gradient-success text-white shadow-lg" : 
                              module.status === "in-progress" ? "bg-gradient-primary text-white shadow-lg animate-pulse-extra-slow" :
                              module.status === "available" ? "bg-gradient-to-br from-muted to-muted-foreground/20 text-white" :
                              "bg-muted/50 text-muted-foreground"}
                          `}>
                            {module.status === "completed" ? "✓" : 
                             module.status === "in-progress" ? "●" : 
                             isModuleLocked ? "🔒" : index + 1}
                          </div>
                        
                        {!collapsed && (
                          <div className="flex-1 ml-3 min-w-0">
                            <span className="text-xs font-medium leading-relaxed block text-black break-words">
                              {module.title}
                            </span>
                              {module.status === "in-progress" && (
                                <div className="w-full bg-muted/50 rounded-full h-1 mt-1 overflow-hidden">
                                  <div className="bg-gradient-primary h-1 rounded-full w-[65%] animate-pulse-extra-slow"></div>
                                </div>
                              )}
                          </div>
                         )}
                        </div>
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Authentication */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {!loading && (
                <SidebarMenuItem>
                  {user ? (
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="w-full flex items-center gap-2 text-black hover:bg-black/10 hover:text-black p-2 rounded disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4 text-red-600" />
                        {!collapsed && <span className="text-black">{isLoading ? "Signing Out..." : "Sign Out"}</span>}
                      </button>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={handleSignIn}
                        className="w-full flex items-center gap-2 text-black hover:bg-black/10 hover:text-black p-2 rounded"
                      >
                        <LogIn className="h-4 w-4 text-green-600" />
                        {!collapsed && <span className="text-black">Sign In</span>}
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )}
              {loading && (
                <SidebarMenuItem>
                  <div className="text-xs text-muted-foreground p-2">Loading...</div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}