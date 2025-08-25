import { Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

interface FinPilotHeaderProps {
  title?: string;
  subtitle?: string;
  showCompanyInfo?: boolean;
}

export const FinPilotHeader = ({ 
  title = "FinPilot", 
  subtitle = "Training Platform",
  showCompanyInfo = true 
}: FinPilotHeaderProps) => {
  return (
    <header className="bg-white border-b border-border">
      {/* Top Utility Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-10 text-sm">
            <div className="flex items-center gap-6">
              <a href="/business" className="hover:text-accent transition-colors">For Business</a>
              <a href="/support" className="hover:text-accent transition-colors">Support</a>
              <a href="/about" className="hover:text-accent transition-colors">About</a>
              <a href="/blog" className="hover:text-accent transition-colors">Blog</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">{title}</span>
            </div>
          </NavLink>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
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
              to="/resources" 
              className={({ isActive }) => 
                `text-foreground hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`
              }
            >
              Resources
            </NavLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" asChild>
                <NavLink to="/auth">Login</NavLink>
              </Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <NavLink to="/signup">Get Started</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};