import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const HorizontalNav = () => {
  return (
    <div className="hidden lg:block bg-white/95 backdrop-blur-sm px-8 py-2 w-full">
      <div className="flex items-center gap-12 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FinPilot</span>
        </NavLink>

        {/* Navigation Menu */}
        <div className="flex items-center gap-6 flex-nowrap flex-1 justify-center">
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
            Enterprise
          </NavLink>
          <NavLink 
            to="/blog" 
            className={({ isActive }) => 
              `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
            }
          >
            Blog
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
            }
          >
            About
          </NavLink>
          <NavLink 
            to="/support" 
            className={({ isActive }) => 
              `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
            }
          >
            Support
          </NavLink>
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 flex-shrink-0">
          <Button variant="outline" size="sm" asChild className="text-sm">
            <NavLink to="/auth" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Sign In
            </NavLink>
          </Button>
          <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <NavLink to="/signup">Free Trial</NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
};