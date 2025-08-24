import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { title: "About Us", href: "/about" },
    { title: "Courses", href: "/courses" },
    { title: "Pricing", href: "/pricing" },
    { title: "For Business", href: "/business" },
    { title: "Blog", href: "/blog" },
    { title: "Support", href: "/support", icon: MessageCircle },
  ];

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-black hover:bg-black/10 p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 sm:w-80">
          <SheetHeader>
            <SheetTitle className="text-left font-playfair text-lg text-halo-navy">
              Navigation
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};