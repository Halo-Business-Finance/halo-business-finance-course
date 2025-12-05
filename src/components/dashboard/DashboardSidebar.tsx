import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  User,
  Flame,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProgressRing } from "./ProgressRing";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface DashboardSidebarProps {
  overallProgress?: number;
  currentStreak?: number;
  className?: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "Courses", href: "/courses" },
  { icon: Trophy, label: "Achievements", href: "/achievements" },
  { icon: BarChart3, label: "Progress", href: "/progress" },
];

const secondaryNavItems: NavItem[] = [
  { icon: User, label: "Profile", href: "/account" },
  { icon: Settings, label: "Settings", href: "/account" },
  { icon: HelpCircle, label: "Support", href: "/support" },
];

export function DashboardSidebar({ 
  overallProgress = 0, 
  currentStreak = 0,
  className 
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (href: string) => location.pathname === href;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Progress section */}
      <div className="px-4 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <ProgressRing progress={overallProgress} size={64} strokeWidth={6} />
          <div>
            <p className="text-sm font-medium text-foreground">Overall Progress</p>
            <p className="text-xs text-muted-foreground mt-0.5">Keep learning!</p>
          </div>
        </div>
        
        {/* Streak indicator */}
        <div className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-orange-500/10">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-foreground">{currentStreak} day streak</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Button
              key={item.label}
              variant={active ? "secondary" : "ghost"}
              onClick={() => {
                navigate(item.href);
                if (isMobile) setMobileOpen(false);
              }}
              className={cn(
                "w-full justify-start h-11 px-3",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
        
        <Separator className="my-4" />
        
        <p className="text-xs font-medium text-muted-foreground px-3 mb-2">Quick Access</p>
        
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => {
                navigate(item.href);
                if (isMobile) setMobileOpen(false);
              }}
              className="w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground"
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Keyboard shortcuts</p>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd>
            <span>Quick search</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Menu Button - Fixed position */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-card shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-sm">
                    FP
                  </div>
                  <span className="font-semibold text-foreground">FinPilot</span>
                </div>
              </div>
              <SidebarContent isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-sm">
                FP
              </div>
              <span className="font-semibold text-foreground">FinPilot</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expanded content */}
        {!collapsed && <SidebarContent />}

        {/* Collapsed content */}
        {collapsed && (
          <>
            <div className="flex flex-col items-center py-4 border-b border-border gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <ProgressRing progress={overallProgress} size={40} strokeWidth={4} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{Math.round(overallProgress)}% Complete</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{currentStreak} day streak</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => navigate(item.href)}
                        className={cn(
                          "w-full h-11 mb-1",
                          active && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              <Separator className="my-4" />
              
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(item.href)}
                        className="w-full h-10 mb-1"
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </>
        )}
      </aside>
    </TooltipProvider>
  );
}
