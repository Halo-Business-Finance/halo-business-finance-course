import { useState } from "react";
import { NavLink } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, X, MessageCircle, Lock, ArrowRight } from "lucide-react";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { title: "About Us", href: "/about" },
    { title: "Course Catalog", href: "/course-catalog" },
    { title: "Pricing", href: "/pricing" },
    { title: "Enterprise Solutions", href: "/enterprise" },
    { title: "Blog", href: "/blog" },
    { title: "Support", href: "/support", icon: MessageCircle },
  ];

  return (
    <div className="lg:hidden w-full">
      {/* Mobile Header with Logo and Menu Button */}
      <div className="flex items-center justify-between w-full px-4 py-4 gap-2">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">FP</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-900 truncate">FinPilot</span>
        </NavLink>

        {/* Action Buttons and Menu */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Sign In/Signup buttons - visible on tablet */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="outline" size="sm" asChild className="text-xs bg-halo-navy hover:bg-halo-navy/90 text-white border-halo-navy px-2 py-1">
              <NavLink to="/auth" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Sign In
              </NavLink>
            </Button>
            <Button size="sm" asChild className="bg-halo-navy hover:bg-halo-navy/90 text-white text-xs px-2 py-1">
              <NavLink to="/signup" className="flex items-center gap-1">
                Start Free Trial
                <ArrowRight className="h-3 w-3" />
              </NavLink>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-black hover:bg-black/10 p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-4/5 md:w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">FP</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">FinPilot</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2 animate-fade-in">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        }`
                      }
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  );
                })}
                
                {/* Mobile Sign In/Signup buttons in menu */}
                <div className="sm:hidden pt-4 mt-4 border-t border-border space-y-2">
                  <NavLink
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-halo-navy text-white hover:bg-halo-navy/90"
                  >
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Sign In</span>
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-halo-navy text-white hover:bg-halo-navy/90"
                  >
                    <span className="font-medium">Start Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                  </NavLink>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};