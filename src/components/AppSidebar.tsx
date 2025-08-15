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
    isActiveState ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="completed" className="ml-auto text-xs">✓</Badge>;
      case "in-progress":
        return <Badge variant="progress" className="ml-auto text-xs">●</Badge>;
      case "locked":
        return <Badge variant="outline" className="ml-auto text-xs">🔒</Badge>;
      default:
        return <Badge variant="success" className="ml-auto text-xs">○</Badge>;
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
              <Target className="h-4 w-4" />
              {!collapsed && "Course Modules"}
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
                      }`}
                    >
                      <span className="text-xs w-6 text-center">{index + 1}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-xs">{module.title}</span>
                          {getStatusBadge(module.status)}
                        </>
                      )}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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