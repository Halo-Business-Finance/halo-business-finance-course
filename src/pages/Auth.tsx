import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { validateEmail, validatePassword, validateName, sanitizeInput, authRateLimiter } from "@/utils/validation";
import { logger } from "@/utils/secureLogging";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [rateLimitWarning, setRateLimitWarning] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
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

    // Validate inputs
    const emailValidation = validateEmail(signInData.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.message,
        variant: "destructive"
      });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous rate limit warnings
    setRateLimitWarning('');
    
    // Check rate limiting
    const clientId = `signup_${signUpData.email}`;
    const rateLimitCheck = authRateLimiter.isAllowed(clientId);
    
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.timeUntilReset || 0) / (1000 * 60));
      setRateLimitWarning(`Too many sign-up attempts. Please try again in ${minutes} minutes.`);
      return;
    }

    // Validate all inputs
    const nameValidation = validateName(signUpData.fullName);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid Name",
        description: nameValidation.message,
        variant: "destructive"
      });
      return;
    }

    const emailValidation = validateEmail(signUpData.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.message,
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(signUpData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.message,
        variant: "destructive"
      });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedName = sanitizeInput(signUpData.fullName);
      const sanitizedEmail = sanitizeInput(signUpData.email);
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      logger.debug('Attempting signup', { sanitizedEmail }, { component: 'Auth', action: 'signup' });
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedName,
          }
        }
      });

      logger.debug('Signup response received', { 
        userCreated: !!data.user, 
        confirmationSent: data.user?.email_confirmed_at === null 
      }, { component: 'Auth', action: 'signup' });

      if (error) {
        logger.error('Signup failed', error, { component: 'Auth', action: 'signup', userId: sanitizedEmail });
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        // Reset rate limiter on successful signup
        authRateLimiter.reset(clientId);
        
        if (data.user.email_confirmed_at === null) {
          toast({
            title: "Account Created!",
            description: "Please check your email (including spam folder) for a confirmation link from noreply@mail.app.supabase.io. You can now sign in to your account.",
            duration: 8000,
          });
        } else {
          toast({
            title: "Account Created!",
            description: "You can now sign in to your account.",
          });
        }
        
        // Clear the form
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: ""
        });
        setPasswordStrength('weak');
        
        // Switch to sign-in tab after successful registration
        const signInTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (signInTab) {
          signInTab.click();
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password strength checking
  const handlePasswordChange = (password: string) => {
    setSignUpData({...signUpData, password});
    const validation = validatePassword(password);
    setPasswordStrength(validation.strength || 'weak');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BFM</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Business Finance Mastery</h1>
          <p className="text-muted-foreground">Please sign in or create an account to continue</p>
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

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {showForgotPassword && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForgotPassword(false)}
                      className="p-0 h-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {showForgotPassword ? "Reset Password" : "Welcome Back"}
                </CardTitle>
                <CardDescription>
                  {showForgotPassword 
                    ? "Enter your email to receive password reset instructions"
                    : "Sign in to continue your learning journey"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
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
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm"
                      >
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={async () => {
                        if (!signInData.email) {
                          toast({
                            title: "Email Required",
                            description: "Please enter your email address first.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
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
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join Business Finance Mastery to start your finance education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signUpData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Password Strength:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength === 'strong' ? 'text-green-600' :
                            passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                          </span>
                        </div>
                        <Progress 
                          value={passwordStrength === 'strong' ? 100 : passwordStrength === 'medium' ? 66 : 33} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;