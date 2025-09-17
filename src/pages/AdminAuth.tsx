import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { validateEmail, sanitizeInput, authRateLimiter } from "@/utils/validation";
const AdminAuthPage = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  // Redirect authenticated users to admin dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/dashboard', {
        replace: true
      });
    }
  }, [user, loading, navigate]);
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(signInData.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.message,
        variant: "destructive"
      });
      return;
    }
    setStep('password');
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitWarning('');
    const clientId = `admin_signin_${signInData.email}`;
    const rateLimitCheck = authRateLimiter.isAllowed(clientId);
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.timeUntilReset || 0) / (1000 * 60));
      setRateLimitWarning(`Too many sign-in attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    if (!signInData.password) {
      toast({
        title: "Password Required",
        description: "Please enter your password.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(signInData.email);
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: signInData.password
      });
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      if (data.user) {
        // Check if user has any admin-level role using secure RPC functions
        const [adminCheck, superAdminCheck, techSupportCheck, instructorCheck] = await Promise.all([supabase.rpc('check_user_has_role', {
          check_role: 'admin'
        }), supabase.rpc('check_user_has_role', {
          check_role: 'super_admin'
        }), supabase.rpc('check_user_has_role', {
          check_role: 'tech_support_admin'
        }), supabase.rpc('check_user_has_role', {
          check_role: 'instructor'
        })]);
        if (adminCheck.error || superAdminCheck.error || techSupportCheck.error || instructorCheck.error) {
          console.error('Error checking admin permissions:', {
            adminError: adminCheck.error,
            superAdminError: superAdminCheck.error,
            techSupportError: techSupportCheck.error,
            instructorError: instructorCheck.error
          });
          await supabase.auth.signOut();
          toast({
            title: "Error",
            description: "Failed to verify admin permissions. Please try again.",
            variant: "destructive"
          });
          return;
        }
        const hasAdminRole = adminCheck.data || superAdminCheck.data || techSupportCheck.data || instructorCheck.data;
        if (!hasAdminRole) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You need administrative, instructor, or tech support privileges to access this area.",
            variant: "destructive"
          });
          return;
        }
        authRateLimiter.reset(clientId);
        toast({
          title: "Welcome back, Admin!",
          description: "You have been successfully signed in."
        });
        navigate("/admin/dashboard", {
          replace: true
        });
      }
    } catch (error) {
      console.error('Admin sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    const emailValidation = validateEmail(forgotPasswordEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.message,
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/admin/login`
      });
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions."
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <Card className="w-full max-w-md bg-navy-800 border-navy-700">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
            <p className="text-white/70">Loading...</p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-800 rounded-lg flex items-center justify-center">
              <Shield className="text-white h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Business Finance Mastery Portal</h1>
          <p className="text-white">Administrative Access Only</p>
        </div>
        
        {rateLimitWarning && <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">{rateLimitWarning}</p>
              </div>
            </CardContent>
          </Card>}

        <Card className="bg-navy-800 border-navy-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {(showForgotPassword || step === 'password') && <Button variant="ghost" size="sm" onClick={() => {
              if (showForgotPassword) {
                setShowForgotPassword(false);
              } else {
                setStep('email');
              }
            }} className="p-0 h-auto text-white hover:bg-navy-700">
                  <ArrowLeft className="h-4 w-4" />
                </Button>}
              <LogIn className="h-5 w-5" />
              {showForgotPassword ? "Reset Password" : step === 'email' ? "Admin Access" : "Enter Password"}
            </CardTitle>
            <CardDescription className="text-white">
              {showForgotPassword ? "Enter your email to receive password reset instructions" : step === 'email' ? "Enter your admin email to continue" : `Signing in as ${signInData.email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? <form onSubmit={handleForgotPassword} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="forgot-email" className="text-white">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input id="forgot-email" type="email" placeholder="Enter your admin email" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} className="pl-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50" required />
                   </div>
                 </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
                </Button>
              </form> : step === 'email' ? <form onSubmit={handleEmailSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signin-email" className="text-white">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input id="signin-email" type="email" placeholder="Enter your admin email" value={signInData.email} onChange={e => setSignInData({
                  ...signInData,
                  email: e.target.value
                })} className="pl-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50" required autoFocus />
                   </div>
                 </div>

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form> : <form onSubmit={handleSignIn} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signin-password" className="text-white">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input id="signin-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={signInData.password} onChange={e => setSignInData({
                  ...signInData,
                  password: e.target.value
                })} className="pl-10 pr-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50" required autoFocus />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/70 hover:text-white">
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In as Admin"}
                </Button>

                 <div className="text-center">
                   <Button variant="link" type="button" onClick={() => {
                setForgotPasswordEmail(signInData.email);
                setShowForgotPassword(true);
              }} className="text-sm text-white hover:text-white/80">
                     Forgot password?
                   </Button>
                 </div>
              </form>}
          </CardContent>
        </Card>

         <div className="text-center space-y-2">
           <p className="text-sm text-white">
             Need to set up initial admin access?
           </p>
           <Button variant="link" onClick={() => navigate('/auth')} className="text-sm text-white hover:text-white/80">
             Create Account & Set Up Admin Access
           </Button>
           <div className="pt-2">
             <Button variant="link" onClick={() => navigate('/')} className="text-white hover:text-white/80">
               ← Back to Main Site
             </Button>
           </div>
         </div>
      </div>
    </div>;
};
export default AdminAuthPage;