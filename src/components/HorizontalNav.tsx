import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const HorizontalNav = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 px-4 py-2">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FinPilot</span>
        </NavLink>

        {/* Navigation Menu */}
        <div className="flex items-center gap-6">
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
            to="/resources" 
            className={({ isActive }) => 
              `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
            }
          >
            Resources
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
            to="/support" 
            className={({ isActive }) => 
              `text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm ${isActive ? 'text-blue-600' : ''}`
            }
          >
            Support
          </NavLink>
          
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            <Button variant="outline" size="sm" asChild className="text-sm">
              <NavLink to="/auth">Login</NavLink>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <NavLink to="/signup">Get Started</NavLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};