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
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              Courses
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/pricing" 
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              Pricing
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/business" 
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              For Business
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/about" 
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              About Us
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/blog" 
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              Blog
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink 
              to="/support" 
              className={cn(navigationMenuTriggerStyle(), "text-foreground hover:text-foreground/80")}
            >
              Support
            </NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};