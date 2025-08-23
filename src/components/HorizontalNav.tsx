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
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/courses" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              Courses
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/pricing" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              Pricing
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/business" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              For Business
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/about" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              About Us
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/blog" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              Blog
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/support" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700 shadow-none")}
            >
              Support
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};