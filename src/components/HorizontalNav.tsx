import { NavLink } from "react-router-dom";
import { MessageCircle, GraduationCap, DollarSign, Building, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HorizontalNav = () => {
  return (
    <div className="flex items-center justify-center gap-6">
      <NavLink 
        to="/about" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Why FinPilot
        </span>
      </NavLink>
      
      <NavLink 
        to="/courses" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        <span className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Courses
        </span>
      </NavLink>
      
      <NavLink 
        to="/pricing" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        <span className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Pricing
        </span>
      </NavLink>
      
      <NavLink 
        to="/business" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        <span className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Solutions
        </span>
      </NavLink>
      
      <NavLink 
        to="/support" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        <span className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Support
        </span>
      </NavLink>
      
      <div className="flex items-center gap-3 ml-4">
        <Button variant="outline" asChild>
          <NavLink to="/auth">Login</NavLink>
        </Button>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
          <NavLink to="/signup">Get Started</NavLink>
        </Button>
      </div>
    </div>
  );
};