import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, NavLink, Navigate, Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Building2, LogIn, Play, MessageCircle, Bell, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseSelectionProvider } from "@/contexts/CourseSelectionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { NotificationBell } from "@/components/NotificationBell";
import { LiveChatSupport } from "@/components/LiveChatSupport";
import { createTestNotifications } from "@/utils/createTestNotifications";
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataSecurity from "./pages/DataSecurity";
import SignUp from "./pages/SignUp";
import { HorizontalNav } from "./components/HorizontalNav";
import { MobileNav } from "./components/MobileNav";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const HeaderContent = ({ isChatOpen, setIsChatOpen }: { isChatOpen: boolean; setIsChatOpen: (open: boolean) => void }) => {
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
    <header className="sticky top-0 h-[80px] flex flex-col border-b bg-background z-50 px-2 md:px-4">
      <div className="flex-1 flex items-center justify-between gap-2 md:gap-4 min-h-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {user && <SidebarTrigger className="text-foreground hover:bg-muted h-[80px] w-12 flex-shrink-0" />}
          
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goBack}
                className="h-8 w-8 p-0 text-foreground hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goForward}
                className="h-8 w-8 p-0 text-foreground hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {user && (
          <div className="flex-1 flex items-center justify-center">
            <NavLink to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm md:text-base">FP</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground truncate">FinPilot</span>
            </NavLink>
          </div>
        )}

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
          <div className="flex items-start gap-1 sm:gap-2 md:gap-3 text-xs md:text-sm text-foreground text-right flex-shrink-0 pt-1 pr-1">
            <NotificationBell />
            <div className="text-xs min-w-0 flex-shrink-0">
              <div className="hidden sm:block whitespace-nowrap">{currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</div>
              <div className="sm:hidden whitespace-nowrap">{currentTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}</div>
              <div className="whitespace-nowrap">{currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      {user && <AppSidebar onOpenSupport={() => setIsChatOpen(true)} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderContent isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

        <main className="flex-1 relative z-10 bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-course" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            {/* Redirect old progress and certificates routes to my-course page */}
            <Route path="/progress" element={<Navigate to="/my-course" replace />} />
            <Route path="/certificates" element={<Navigate to="/my-course" replace />} />
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
            <Route path="/course-catalog" element={<Courses />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/enterprise" element={<Business />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/support" element={<Support />} />
           <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/data-security" element={<DataSecurity />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Live Chat Support */}
      <LiveChatSupport isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
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
          <CourseSelectionProvider>
            <SidebarProvider defaultOpen={true} open={undefined}>
              <AppContent />
            </SidebarProvider>
          </CourseSelectionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;