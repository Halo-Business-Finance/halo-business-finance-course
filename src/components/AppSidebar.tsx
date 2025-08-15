import { NavLink } from "react-router-dom";
import { 
  BookOpen, 
  Home, 
  BarChart3, 
  User, 
  Settings, 
  Award,
  Target,
  FileText
} from "lucide-react";

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

const courseModules = [
  { title: "Business Finance Foundations", url: "/module/foundations", status: "completed" },
  { title: "Capital Markets", url: "/module/capital-markets", status: "completed" },
  { title: "SBA Loan Programs", url: "/module/sba-loans", status: "in-progress" },
  { title: "Conventional Lending", url: "/module/conventional-loans", status: "available" },
  { title: "Bridge Financing", url: "/module/bridge-loans", status: "locked" },
  { title: "Alternative Finance", url: "/module/alternative-finance", status: "locked" },
  { title: "Credit Analysis", url: "/module/credit-risk", status: "locked" },
  { title: "Compliance", url: "/module/regulatory-compliance", status: "locked" },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
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
              {courseModules.map((module, index) => (
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
                        
                        {!collapsed && (
                          <>
                            <div className="flex-1 ml-3">
                              <span className="text-xs font-medium leading-tight block text-black">
                                {module.title}
                              </span>
                              {module.status === "in-progress" && (
                                <div className="w-full bg-muted/50 rounded-full h-1 mt-1 overflow-hidden">
                                  <div className="bg-gradient-primary h-1 rounded-full w-[65%] animate-pulse"></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-2">
                              {getStatusBadge(module.status)}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
      </SidebarContent>
    </Sidebar>
  );
}