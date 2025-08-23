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
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              Courses
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/pricing" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              Pricing
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/business" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              For Business
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/about" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              About Us
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/blog" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              Blog
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/support" 
              className={cn(navigationMenuTriggerStyle(), "bg-blue-600 text-white hover:bg-blue-700")}
            >
              Support
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};