import { NavLink } from "react-router-dom";
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
        Why FinPilot
      </NavLink>
      
      <NavLink 
        to="/courses" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        Courses
      </NavLink>
      
      <NavLink 
        to="/pricing" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        Pricing
      </NavLink>
      
      <NavLink 
        to="/business" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        Solutions
      </NavLink>
      
      <NavLink 
        to="/support" 
        className={({ isActive }) => 
          `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
        }
      >
        Support
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