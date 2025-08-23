import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, NavLink, Navigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { SecurityMonitor } from "@/components/SecurityMonitor";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import VideoLibrary from "./pages/VideoLibrary";
import Resources from "./pages/Resources";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import ModulePage from "./pages/ModulePage";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import Pricing from "./pages/Pricing";
import Business from "./pages/Business";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Support from "./pages/Support";
import { HorizontalNav } from "./components/HorizontalNav";

const queryClient = new QueryClient();

const HeaderContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  // Show header for both logged in and logged out users

  // Extract first name from email or user metadata
  const getFirstName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 h-24 flex items-center border-b bg-white z-50 px-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold text-lg text-blue-600">Halo Business Finance</span>
      </div>
      
      {user && <SidebarTrigger className="text-black hover:bg-black/10 hover:text-black" />}
      
      {user && (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="h-8 w-8 p-0 text-black hover:bg-black/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goForward}
            className="h-8 w-8 p-0 text-black hover:bg-black/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center">
        <HorizontalNav />
      </div>
      
      <div className="flex items-center mr-4 gap-4">
        {user ? (
          <p className="text-sm text-black">
            Welcome back, {getFirstName()}! • {formatDateTime(currentTime)}
          </p>
        ) : (
          <>
            <Link to="/auth">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      {user && <AppSidebar />}
      
      <div className="flex-1 flex flex-col">
        <HeaderContent />

        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            {/* Redirect old certificates route to progress page */}
            <Route path="/certificates" element={<Navigate to="/progress" replace />} />
            <Route path="/videos" element={<VideoLibrary />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={
              <ProtectedRoute requireAuth={false}>
                <AdminAuth />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/module/:moduleId" element={<ModulePage />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/business" element={<Business />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/support" element={<Support />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider defaultOpen={true}>
            <SecurityMonitor />
            <AppContent />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;