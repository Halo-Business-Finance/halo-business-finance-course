import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, NavLink, Navigate, Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Building2, LogIn, Play, MessageCircle, Bell } from "lucide-react";
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
import Article from "./pages/Article";
import Support from "./pages/Support";
import SignUp from "./pages/SignUp";
import { HorizontalNav } from "./components/HorizontalNav";
import { MobileNav } from "./components/MobileNav";
import { AccountTabs } from "./components/AccountTabs";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const HeaderContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    <header className="sticky top-0 h-14 md:h-16 lg:h-20 xl:h-24 flex flex-col border-b bg-white z-50 px-2 md:px-4">
      <div className="flex-1 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          {!user && (
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <span className="font-aptos font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-blue-900 whitespace-nowrap">
                  <span className="hidden sm:inline">FinPilot</span>
                  <span className="sm:hidden">FinPilot</span>
                </span>
              </Link>
            </div>
          )}
          
          {user && <SidebarTrigger className="text-black hover:bg-black/10 hover:text-black" />}
          
          {user && (
            <div className="hidden md:flex items-center gap-2">
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
        </div>

        {!user && (
          <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto">
            <div className="hidden lg:block w-full">
              <HorizontalNav />
            </div>
            <div className="lg:hidden">
              <MobileNav />
            </div>
          </div>
        )}
        
        {user && (
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-black text-right">
            <Bell className="h-4 w-4 text-yellow-500" />
            <div className="hidden sm:block">
              <div>{currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</div>
              <div className="text-xs">{currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</div>
            </div>
            <div className="sm:hidden text-xs">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Account tabs positioned on the divider line - shown on all pages when logged in */}
      {user && (
        <div className="flex justify-center -mb-px">
          <AccountTabs 
            activeTab={location.pathname === '/my-account' ? (new URLSearchParams(location.search).get('tab') || 'account') : ''}
            onTabChange={(tab) => navigate(`/my-account?tab=${tab}`)}
          />
        </div>
      )}
    </header>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      {user && <AppSidebar />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderContent />

        <main className="flex-1 relative z-10 bg-white">
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
            <Route path="/my-account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            {/* Redirect old account route to my-account page */}
            <Route path="/account" element={<Navigate to="/my-account" replace />} />
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignUp />
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
            <Route path="/article/:id" element={<Article />} />
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
        <ScrollToTop />
        <AuthProvider>
          <SidebarProvider defaultOpen={true} open={undefined}>
            <SecurityMonitor />
            <AppContent />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;