import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Progress from "./pages/Progress";
import Certificates from "./pages/Certificates";
import VideoLibrary from "./pages/VideoLibrary";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ModulePage from "./pages/ModulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HeaderContent = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return (
    <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 px-4 gap-4">
      <SidebarTrigger className="text-black hover:bg-black/10 hover:text-black" />
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goBack}
          className="h-8 w-8 p-0 text-black hover:bg-black/10 hover:text-black border border-black/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goForward}
          className="h-8 w-8 p-0 text-black hover:bg-black/10 hover:text-black border border-black/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-sm font-medium text-muted-foreground">
          Halo Business Finance Learning Platform
        </h1>
      </div>
    </header>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <HeaderContent />

              <main className="flex-1 relative z-10">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/videos" element={<VideoLibrary />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/module/:moduleId" element={<ModulePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
