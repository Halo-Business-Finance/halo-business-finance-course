import { NavLink } from "react-router-dom";
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
    <div className="bg-white rounded-lg px-4 py-2">
      <NavigationMenu className="bg-transparent">
      <NavigationMenuList className="bg-transparent">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/courses" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              Courses
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/pricing" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              Pricing
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/business" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              For Business
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/about" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              About Us
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/blog" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              Blog
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/support" 
              className={cn(navigationMenuTriggerStyle(), "!bg-blue-900 text-white hover:!bg-blue-800 shadow-none")}
            >
              Support
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};