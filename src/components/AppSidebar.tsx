import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Home, 
  BarChart3, 
  User, 
  Settings, 
  Award,
  Target,
  FileText,
  LogIn,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  { title: "Dashboard", url: "/", icon: Home },
  { title: "My Progress", url: "/progress", icon: BarChart3 },
  { title: "Certificates", url: "/certificates", icon: Award },
  { title: "Video Library", url: "/videos", icon: BookOpen },
  { title: "Resources", url: "/resources", icon: FileText },
];

const courseModules: Array<{title: string, url: string, status: string}> = [];

const accountItems = [
  { title: "Account", url: "/account", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
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
        {/* Brand */}
        <div className="h-16 p-4 border-b flex items-center">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Halo Learning</p>
                <p className="text-xs text-muted-foreground">Finance Training</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Target className="h-4 w-4 text-black" />
                <div className="absolute -inset-1 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
              </div>
              {!collapsed && (
                <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                  Course Modules
                </span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {courseModules.length > 0 ? (
                courseModules.map((module, index) => (
                  <SidebarMenuItem key={module.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={module.url} 
                        className={({ isActive }) => `${getNavCls(isActive)} ${
                          module.status === "locked" ? "opacity-60 pointer-events-none" : ""
                        } group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:bg-gradient-to-r hover:from-black/5 hover:to-black/5`}
                      >
                        <div className="relative z-10 flex items-center w-full">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${module.status === "completed" ? "bg-gradient-success text-white shadow-lg" : 
                              module.status === "in-progress" ? "bg-gradient-primary text-white shadow-lg animate-pulse" :
                              module.status === "available" ? "bg-gradient-to-br from-muted to-muted-foreground/20 text-black" :
                              "bg-muted/50 text-muted-foreground"}
                          `}>
                            {module.status === "completed" ? "✓" : 
                             module.status === "in-progress" ? "●" : 
                             module.status === "locked" ? "🔒" : index + 1}
                          </div>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate transition-colors duration-200">
                              {module.title}
                            </p>
                          </div>
                          
                          {!collapsed && module.status === "completed" && (
                            <Badge variant="success" className="ml-2 text-xs px-2 py-0.5 bg-gradient-success">
                              Done
                            </Badge>
                          )}
                          
                          {!collapsed && module.status === "in-progress" && (
                            <Badge variant="default" className="ml-2 text-xs px-2 py-0.5 bg-gradient-primary">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-3 py-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  {!collapsed && (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">No modules yet</p>
                      <p className="text-xs text-muted-foreground/70">Content coming soon</p>
                    </>
                  )}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({ isActive }) => getNavCls(isActive)}>
                      <item.icon className="h-4 w-4 text-black" />
                      {!collapsed && <span className="text-black">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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