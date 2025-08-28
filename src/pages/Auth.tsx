import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft } from "lucide-react";
import { validateEmail, sanitizeInput, authRateLimiter } from "@/utils/validation";
import { logger } from "@/utils/secureLogging";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
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

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl');
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
    
    // Clear any previous rate limit warnings
    setRateLimitWarning('');
    
    // Check rate limiting
    const clientId = `signin_${signInData.email}`;
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: signInData.password,
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
        // Reset rate limiter on successful login
        authRateLimiter.reset(clientId);
        
        // Log successful authentication
        try {
          await supabase.rpc('log_successful_auth', {
            auth_type: 'email_password_basic',
            user_email: sanitizedEmail
          });
        } catch (logError) {
          console.warn('Failed to log successful auth:', logError);
        }
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        
        // Check for redirect URL
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectUrl');
          navigate(redirectUrl, { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
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
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/dashboard`
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
        description: "Please check your email for password reset instructions.",
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <Card className="w-full max-w-md bg-navy-800 border-navy-700">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
            <p className="text-white/70">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Master Business Finance & Commercial Lending</h1>
        </div>
        
        {rateLimitWarning && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">{rateLimitWarning}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-navy-800 border-navy-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {(showForgotPassword || step === 'password') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (showForgotPassword) {
                      setShowForgotPassword(false);
                    } else {
                      setStep('email');
                    }
                  }}
                  className="p-0 h-auto text-white hover:bg-navy-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {showForgotPassword ? "Reset Password" : step === 'email' ? "Welcome Back" : "Enter Password"}
            </CardTitle>
            <CardDescription className="text-white/70">
              {showForgotPassword 
                ? "Enter your email to receive password reset instructions"
                : step === 'email' ? "Enter your email to continue" : `Signing in as ${signInData.email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="forgot-email" className="text-white">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input
                       id="forgot-email"
                       type="email"
                       placeholder="Enter your email"
                       value={forgotPasswordEmail}
                       onChange={(e) => setForgotPasswordEmail(e.target.value)}
                       className="pl-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50"
                       required
                     />
                   </div>
                 </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
                </Button>
              </form>
            ) : step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signin-email" className="text-white">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input
                       id="signin-email"
                       type="email"
                       placeholder="Enter your email"
                       value={signInData.email}
                       onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                       className="pl-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50"
                       required
                       autoFocus
                     />
                   </div>
                 </div>

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signin-password" className="text-white">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                     <Input
                       id="signin-password"
                       type={showPassword ? "text" : "password"}
                       placeholder="Enter your password"
                       value={signInData.password}
                       onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                       className="pl-10 pr-10 bg-navy-700 border-navy-600 text-white placeholder:text-white/50"
                       required
                       autoFocus
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-3 text-white/70 hover:text-white"
                     >
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                
                 <div className="text-center">
                   <Button
                     variant="link"
                     type="button"
                     onClick={() => {
                       setForgotPasswordEmail(signInData.email);
                       setShowForgotPassword(true);
                     }}
                     className="text-sm text-white hover:text-white/80"
                   >
                     Forgot password?
                   </Button>
                 </div>
                
                 <Button 
                   type="button" 
                   variant="outline" 
                   className="w-full bg-navy-700 border-navy-600 text-white hover:bg-navy-600"
                   onClick={async () => {
                     const { error } = await supabase.auth.resend({
                       type: 'signup',
                       email: signInData.email,
                       options: {
                         emailRedirectTo: `${window.location.origin}/dashboard`
                       }
                     });
                     
                     if (error) {
                       toast({
                         title: "Error",
                         description: error.message,
                         variant: "destructive"
                       });
                     } else {
                       toast({
                         title: "Confirmation Email Sent",
                         description: "Please check your email for a new confirmation link.",
                       });
                     }
                   }}
                 >
                   Resend Confirmation Email
                 </Button>
              </form>
            )}
          </CardContent>
        </Card>

         <div className="text-center">
           <Button
             variant="ghost"
             onClick={() => navigate("/")}
             className="text-white hover:text-white/80 hover:bg-navy-800"
           >
             ← Back to Home
           </Button>
         </div>
      </div>
    </div>
  );
};

export default AuthPage;