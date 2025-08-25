import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HorizontalNav = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 px-6 py-3">
      <div className="flex items-center justify-center gap-8">
        <NavLink 
          to="/about" 
          className={({ isActive }) => 
            `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
          }
        >
          Why FinPilot
        </NavLink>
        
        <NavLink 
          to="/courses" 
          className={({ isActive }) => 
            `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
          }
        >
          Courses
        </NavLink>
        
        <NavLink 
          to="/pricing" 
          className={({ isActive }) => 
            `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
          }
        >
          Pricing
        </NavLink>
        
        <NavLink 
          to="/business" 
          className={({ isActive }) => 
            `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
          }
        >
          Solutions
        </NavLink>
        
        <NavLink 
          to="/support" 
          className={({ isActive }) => 
            `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
          }
        >
          Support
        </NavLink>
        
        <div className="flex items-center gap-3 ml-6 pl-6 border-l border-gray-200">
          <Button variant="outline" size="sm" asChild className="text-sm">
            <NavLink to="/auth">Login</NavLink>
          </Button>
          <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <NavLink to="/signup">Get Started</NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
};