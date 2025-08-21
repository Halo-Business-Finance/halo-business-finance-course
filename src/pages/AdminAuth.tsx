import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle,
  Crown,
  Settings
} from "lucide-react";
import { validateEmail, validatePassword, validateName, sanitizeInput, authRateLimiter } from "@/utils/validation";

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [rateLimitWarning, setRateLimitWarning] = useState<string>('');

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
    fullName: "",
    role: "admin" as "admin" | "super_admin"
  });

  // Redirect authenticated users to admin dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

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
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('is_active', true)
          .single();

        if (roleError || !roleData || !['admin', 'super_admin'].includes(roleData.role)) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this area.",
            variant: "destructive"
          });
          return;
        }

        authRateLimiter.reset(clientId);
        
        toast({
          title: "Welcome back, Admin!",
          description: "You have been successfully signed in.",
        });
        
        navigate("/admin/dashboard", { replace: true });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password || !signUpData.confirmPassword || !signUpData.fullName) {
      toast({
        title: "Missing Fields",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    // Check rate limiting
    const clientId = `admin_signup_${signUpData.email}`;
    const rateLimitCheck = authRateLimiter.isAllowed(clientId);
    
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.timeUntilReset || 0) / (1000 * 60));
      setRateLimitWarning(`Too many sign-up attempts. Please try again in ${minutes} minutes.`);
      return;
    }

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
      // Use secure edge function for admin account creation
      const { data, error } = await supabase.functions.invoke('secure-admin-operations', {
        body: {
          operation: 'create_admin_account',
          email: signUpData.email,
          password: signUpData.password,
          fullName: signUpData.fullName,
          role: signUpData.role
        }
      });

      if (error) {
        throw error;
      }

      authRateLimiter.reset(clientId);

      toast({
        title: "Account Created Successfully",
        description: `Admin account created with ${signUpData.role} role. You can now sign in.`,
      });

      // Clear form
      setSignUpData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "admin"
      });
      setPasswordStrength('weak');
      
      // Switch to sign in tab
      setTimeout(() => {
        const signInTab = document.querySelector('[data-value="signin"]') as HTMLElement;
        signInTab?.click();
      }, 500);

    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error?.message?.includes('already registered') || error?.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists';
      } else if (error?.message?.includes('Password')) {
        errorMessage = 'Password does not meet security requirements';
      } else if (error?.message?.includes('privileges') || error?.message?.includes('permissions')) {
        errorMessage = 'Insufficient privileges to create admin accounts';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 to-primary/10">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-destructive to-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Administrative Access Only</p>
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
              Admin Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>
                  Sign in with your administrator credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your admin email"
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
                    {isLoading ? "Signing In..." : "Sign In as Admin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Admin Account</CardTitle>
                <CardDescription>
                  Create a new administrator account
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
                        placeholder="Enter full name"
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
                        placeholder="Enter admin email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Admin Role</Label>
                    <Select
                      value={signUpData.role}
                      onValueChange={(value: "admin" | "super_admin") => 
                        setSignUpData({...signUpData, role: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Super Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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
                    {isLoading ? "Creating Account..." : "Create Admin Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground"
          >
            ← Back to Main Site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;