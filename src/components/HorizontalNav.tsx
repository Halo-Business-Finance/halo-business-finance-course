import { NavLink } from "react-router-dom";
import { MessageCircle, GraduationCap, DollarSign, Building, Users, FileText } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const HorizontalNav = () => {
  return (
    <div className="bg-white rounded-lg px-2 md:px-4 py-2">
      <NavigationMenu className="bg-transparent">
      <NavigationMenuList className="bg-transparent flex-wrap justify-center">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/courses" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
              Courses
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/pricing" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              Pricing
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuLink asChild>
            <NavLink 
              to="/business" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <Building className="h-3 w-3 md:h-4 md:w-4" />
              For Business
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem className="hidden lg:block">
          <NavigationMenuLink asChild>
            <NavLink 
              to="/about" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              About Us
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem className="hidden lg:block">
          <NavigationMenuLink asChild>
            <NavLink 
              to="/blog" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              Blog
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/support" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4")}
            >
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Support</span>
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};