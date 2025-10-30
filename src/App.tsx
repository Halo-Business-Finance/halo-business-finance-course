import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, NavLink, Navigate, Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Building2, LogIn, Play, MessageCircle, Bell, HelpCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseSelectionProvider } from "@/contexts/CourseSelectionContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { NotificationBell } from "@/components/NotificationBell";
import { LiveChatSupport } from "@/components/LiveChatSupport";
import { ToolModal } from "@/components/tools/ToolModal";
import { createTestNotifications } from "@/utils/createTestNotifications";
import { lazy, Suspense } from "react";
import { errorMonitor } from "./utils/errorMonitoring";
import { HorizontalNav } from "./components/HorizontalNav";
import { MobileNav } from "./components/MobileNav";
import { ScrollToTop } from "./components/ScrollToTop";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Progress = lazy(() => import("./pages/Progress"));
const VideoLibrary = lazy(() => import("./pages/VideoLibrary"));
const Resources = lazy(() => import("./pages/Resources"));
const Account = lazy(() => import("./pages/Account"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Courses = lazy(() => import("./pages/Courses"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Business = lazy(() => import("./pages/Business"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Article = lazy(() => import("./pages/Article"));
const Support = lazy(() => import("./pages/Support"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const DataSecurity = lazy(() => import("./pages/DataSecurity"));
const SignUp = lazy(() => import("./pages/SignUp"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);
const queryClient = new QueryClient();
const HeaderContent = ({
  isChatOpen,
  setIsChatOpen
}: {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user
  } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calculatorOpen, setCalculatorOpen] = useState(false);
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
  return <header className="sticky top-0 h-[60px] sm:h-[80px] flex flex-col border-b bg-sidebar z-50 px-2 sm:px-4">
      <div className="flex-1 flex items-center justify-between gap-1 sm:gap-2 md:gap-4 min-h-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 rounded-2xl">
          {user && <SidebarTrigger variant="ghost" size="icon" className="-ml-2 sm:-ml-4 h-9 w-9 sm:h-10 sm:w-10 p-0 text-navy-900" />}
          
          {user && <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" onClick={goBack} title="Go back" className="h-8 w-8 p-0 hover:bg-muted text-navy-900">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goForward} className="h-8 w-8 p-0 text-navy-900 hover:bg-muted" title="Go forward">
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>}
        </div>

        {user && <div className="flex-1 flex items-center justify-center min-w-0">
            <NavLink to="/" className="flex items-center gap-3 sm:gap-4 flex-shrink-0 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0 bg-blue-700">
                <span className="text-primary-foreground font-bold text-base sm:text-lg md:text-xl">FP</span>
              </div>
              <span className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground truncate">FinPilot</span>
            </NavLink>
          </div>}

        {!user && <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto min-w-0">
            <div className="hidden lg:block w-full">
              <HorizontalNav />
            </div>
            <div className="lg:hidden w-full">
              <MobileNav />
            </div>
          </div>}
        
        {user && <div className="flex items-start gap-1 sm:gap-2 text-xs text-foreground text-right flex-shrink-0 pt-1 rounded-full py-0">
            <Button 
              variant="ghost" 
              size="sm" 
              title="Loan Calculator" 
              className="relative p-2 h-14 w-14 text-slate-50 py-0 px-0 text-xl mx-0"
              onClick={() => setCalculatorOpen(true)}
            >
              <Calculator className="h-8 w-8 text-navy-900" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Help & Support" 
              className="relative p-2 h-14 w-14 text-slate-50 py-0 px-0 text-xl mx-0"
              onClick={() => setIsChatOpen(true)}
            >
              <HelpCircle className="h-8 w-8 text-navy-900" />
            </Button>
            <NotificationBell />
            <Button 
              variant="ghost" 
              size="sm" 
              title="My Account" 
              className="relative p-2 h-14 w-14 text-slate-50 py-0 px-0 text-xl mx-0"
              onClick={() => navigate('/my-account')}
            >
              <User className="h-8 w-8 text-navy-900" />
            </Button>
          </div>}
      </div>
      
      <ToolModal
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        toolType="loan_calculator"
        toolTitle="Loan Calculator"
      />
    </header>;
};
const AppContent = () => {
  const {
    user,
    loading
  } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  return <div className="min-h-screen flex flex-col w-full">
      <HeaderContent isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
      
      <div className="flex flex-1 min-h-0">
        {user && <AppSidebar onOpenSupport={() => setIsChatOpen(true)} />}
        
        <main className="flex-1 relative z-10 bg-background">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>} />
            <Route path="/my-course" element={<ProtectedRoute>
                <Progress />
              </ProtectedRoute>} />
            {/* Redirect old progress and certificates routes to my-course page */}
            <Route path="/progress" element={<Navigate to="/my-course" replace />} />
            <Route path="/certificates" element={<Navigate to="/my-course" replace />} />
            <Route path="/videos" element={<VideoLibrary />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/my-account" element={<ProtectedRoute>
                <Account />
              </ProtectedRoute>} />
            {/* Redirect old account route to my-account page */}
            <Route path="/account" element={<Navigate to="/my-account" replace />} />
            <Route path="/auth" element={<ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>} />
            <Route path="/signup" element={<ProtectedRoute requireAuth={false}>
                <SignUp />
              </ProtectedRoute>} />
            <Route path="/admin/login" element={<ProtectedRoute requireAuth={false}>
                <AdminAuth />
              </ProtectedRoute>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </AdminProtectedRoute>} />
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
          </Suspense>
        </main>
      </div>

      {/* Live Chat Support */}
      <LiveChatSupport isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>;
};
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <NotesProvider>
            <CourseSelectionProvider>
              <SidebarProvider defaultOpen={true} open={undefined}>
                <AppContent />
              </SidebarProvider>
            </CourseSelectionProvider>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;