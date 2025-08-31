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
  LogOut,
  Lock
 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseSelection } from "@/contexts/CourseSelectionContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  { title: "My Course", url: "/my-course", icon: BarChart3 },
  { title: "Learning Resources", url: "/resources", icon: FileText },
  { title: "My Account", url: "/my-account", icon: User },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { selectedCourse } = useCourseSelection();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseModules, setSelectedCourseModules] = useState([]);

  // Fetch modules for the selected course
  useEffect(() => {
    if (user && selectedCourse) {
      fetchSelectedCourseModules();
    } else {
      setSelectedCourseModules([]);
    }
  }, [user, selectedCourse]);

  const fetchSelectedCourseModules = async () => {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .like("module_id", `${selectedCourse.id}%`)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      setSelectedCourseModules(data || []);
    } catch (error) {
      console.error('Error fetching selected course modules:', error);
      setSelectedCourseModules([]);
    }
  };

  // Function to handle navigation and close sidebar on mobile
  const handleNavigation = (url: string, canAccess: boolean = true) => {
    if (!canAccess) {
      toast({
        title: "Module Locked",
        description: "Complete the previous module to unlock this one!",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Close sidebar on mobile/tablet after navigation
    if (isMobile) {
      toggleSidebar();
    }
    navigate(url);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Close sidebar before signing out on mobile
      if (isMobile) {
        toggleSidebar();
      }
      // The signOut function now handles the redirect automatically
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    // Close sidebar before navigating on mobile
    if (isMobile) {
      toggleSidebar();
    }
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
        return (
          <Badge variant="outline" className="text-xs px-2 py-0.5 opacity-60 flex items-center gap-1 hover:opacity-80 transition-opacity">
            <Lock size={12} className="text-halo-orange animate-pulse" />
          </Badge>
        );
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
      variant="inset"
      className="bg-white border-gray-200 border-r-2 border-gray-300"
    >
      <SidebarContent className="bg-white">
        {/* Welcome Message */}
        {user && !collapsed && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="text-gray-900">
              <div className="text-sm font-medium text-gray-600">Welcome back,</div>
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-gray-900">
                  {user.user_metadata?.full_name?.split(' ')[0] || 
                   user.user_metadata?.name?.split(' ')[0] || 
                   user.email?.split('@')[0] || 'User'}!
                </div>
                <button 
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md disabled:opacity-50 transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-halo-orange" />
                  {!collapsed && <span className="text-xs text-gray-700">{isLoading ? "..." : "Sign Out"}</span>}
                </button>
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
                     <button 
                       onClick={() => handleNavigation(item.url)}
                       className={`w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 p-3 rounded-lg transition-all duration-200`}
                     >
                        <item.icon className="h-5 w-5 text-halo-orange" />
                        {!collapsed && <span className="text-gray-700 text-sm font-medium">{item.title}</span>}
                     </button>
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

        {/* Selected Course Modules */}
        {selectedCourseModules.length > 0 && (
          <SidebarGroup className="pt-2">
            <SidebarGroupLabel className="pb-3 mb-2">
              {!collapsed && (
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 tracking-wide">
                    {selectedCourse?.title || 'Course Modules'}
                  </span>
                </div>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3">
              <SidebarMenu className="space-y-3">
                {selectedCourseModules.map((module: any, index) => {
                  const isModuleLocked = module.is_locked;
                  const canAccess = !isModuleLocked || isAdmin;
                  const moduleUrl = `/module/${module.module_id}`;
                  
                  return (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton asChild>
                           <button 
                            onClick={() => handleNavigation(moduleUrl, canAccess)}
                               className={`
                                 w-full text-left
                                 ${isModuleLocked ? "opacity-50" : ""} 
                                 ${!canAccess ? "cursor-not-allowed" : ""}
                               group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ease-out
                                text-gray-700 hover:bg-gray-100 hover:text-gray-900
                              `}
                         >
                           <div className="relative z-10 flex items-center w-full gap-4">
                             {/* Status Indicator */}
                             <div className="relative flex-shrink-0">
                                 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold bg-halo-orange text-white shadow-md transition-all duration-300 ease-out">
                                  {isModuleLocked ? (
                                    <Lock size={18} className="text-white" />
                                  ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                  )}
                                </div>
                             </div>
                           
                             {!collapsed && (
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between">
                                      <h3 className="text-sm font-medium text-gray-900 leading-tight truncate transition-colors">
                                        {module.title}
                                      </h3>
                                    
                                     {/* Status Badge */}
                                     <div className="ml-2 flex-shrink-0">
                                       {!isModuleLocked && (
                                         <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
                                       )}
                                     </div>
                                  </div>
                                  
                                  {/* Subtle description for available modules */}
                                  {!isModuleLocked && (
                                     <p className="text-sm text-gray-600 mt-1 transition-opacity duration-300">
                                       Ready to start
                                     </p>
                                  )}
                               </div>
                             )}
                           </div>
                            
                            {/* Active state indicator */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-primary to-primary/60 rounded-r-full opacity-0 transition-opacity duration-300 data-[active=true]:opacity-100"></div>
                         </button>
                       </SidebarMenuButton>
                     </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Show message when no course is selected */}
        {selectedCourseModules.length === 0 && user && !collapsed && (
          <SidebarGroup className="pt-2">
            <SidebarGroupContent>
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-500">
                  {selectedCourse 
                    ? 'No modules available for this course'
                    : 'Select a course from the dashboard to see modules here'
                  }
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Authentication - Only show if not logged in */}
        {!user && (
          <SidebarGroup className="-mt-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {!loading && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                       <button 
                         onClick={handleSignIn}
                         className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 p-3 rounded-lg transition-all duration-200"
                       >
                          <LogIn className="h-5 w-5 text-halo-orange" />
                          {!collapsed && <span className="text-gray-700 text-sm font-medium">Sign In</span>}
                       </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                 {loading && (
                   <SidebarMenuItem>
                      <div className="text-xs text-gray-500 p-2">Loading...</div>
                     </SidebarMenuItem>
                 )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}