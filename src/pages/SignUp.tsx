import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, Building, Phone, MapPin } from "lucide-react";
import { validateEmail, validatePassword, validateName, sanitizeInput } from "@/utils/validation";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    company: "",
    phone: "",
    city: "",
    state: ""
  });

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const truncated = numbers.substring(0, 10);
    
    // Apply formatting
    if (truncated.length >= 6) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
    } else if (truncated.length >= 3) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
    } else if (truncated.length > 0) {
      return `(${truncated}`;
    }
    return '';
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(signUpData.email),
        fullName: sanitizeInput(signUpData.fullName),
        company: sanitizeInput(signUpData.company),
        phone: signUpData.phone.replace(/\D/g, ''), // Store only numbers
        city: sanitizeInput(signUpData.city),
        state: sanitizeInput(signUpData.state),
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword
      };

      // Validation
      const emailValidation = validateEmail(sanitizedData.email);
      const passwordValidation = validatePassword(sanitizedData.password);
      const nameValidation = validateName(sanitizedData.fullName);

      if (!emailValidation.isValid) {
        toast({
          title: "Invalid Email",
          description: emailValidation.message,
          variant: "destructive",
        });
        return;
      }

      if (!passwordValidation.isValid) {
        toast({
          title: "Invalid Password",
          description: passwordValidation.message,
          variant: "destructive",
        });
        return;
      }

      if (!nameValidation.isValid) {
        toast({
          title: "Invalid Name",
          description: nameValidation.message,
          variant: "destructive",
        });
        return;
      }

      // Validate phone number if provided
      if (sanitizedData.phone && sanitizedData.phone.length !== 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be 10 digits",
          variant: "destructive",
        });
        return;
      }

      if (sanitizedData.password !== sanitizedData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // Validate terms acceptance
      if (!termsAccepted) {
        toast({
          title: "Terms Required",
          description: "You must accept the Terms and Conditions and subscription terms to create an account",
          variant: "destructive",
        });
        return;
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: sanitizedData.fullName,
            company: sanitizedData.company,
            phone: sanitizedData.phone,
            city: sanitizedData.city,
            state: sanitizedData.state,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user && !data.session) {
        // Log successful registration
        try {
          await supabase.rpc('log_successful_auth', {
            auth_type: 'registration_basic',
            user_email: sanitizedData.email
          });
        } catch (logError) {
          console.warn('Failed to log successful registration:', logError);
        }
        
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email for a confirmation link. You can now sign in to your account.",
          duration: 6000,
        });
        // Redirect to sign-in page
        navigate('/auth');
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to Halo Business Finance! You can now sign in to your account.",
        });
        // Redirect to sign-in page
        navigate('/auth');
      }

    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthPercentage = () => {
    switch (passwordStrength) {
      case 'weak': return 25;
      case 'medium': return 60;
      case 'strong': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-black hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-blue-900">Get Started</h1>
          <p className="text-black mt-2">Create your account and start your 3-day free trial</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2 text-black">
              <UserPlus className="h-5 w-5" />
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-black">
              Join Halo Business Finance Training Platform
            </CardDescription>
            
            {/* Subscription Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black mb-2">3-Day Free Trial</h3>
                <p className="text-sm text-black mb-3">
                  Get full access to all courses and materials - completely free for 3 days
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-black">What's Included:</h4>
                  <ul className="text-black space-y-1">
                    <li>• Full access to all course materials</li>
                    <li>• Interactive lessons and assessments</li>
                    <li>• Student community access</li>
                    <li>• Progress tracking tools</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-black">Pricing & Guarantee:</h4>
                  <ul className="text-black space-y-1">
                    <li>• <strong>$49/month</strong> after trial ends</li>
                    <li>• Cancel anytime during trial</li>
                    <li>• 30-day money-back guarantee</li>
                    <li>• Email reminder before trial expires</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-blue-200 pt-3 mt-3">
                <p className="text-xs text-black text-center">
                  <strong>How it works:</strong> Your 3-day free trial begins when you create your account. 
                  We'll send you a reminder email before it ends. If you don't cancel before the trial expires, 
                  your subscription will automatically begin at $49/month. You can cancel easily in your account settings 
                  at any time. If you're not satisfied within the first 30 days of paid subscription, 
                  contact our support team for a full refund.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Name (Optional)
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Enter your company name"
                  value={signUpData.company}
                  onChange={(e) => setSignUpData({...signUpData, company: e.target.value})}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({...signUpData, phone: formatPhoneNumber(e.target.value)})}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={signUpData.city}
                    onChange={(e) => setSignUpData({...signUpData, city: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    State
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Enter your state"
                    value={signUpData.state}
                    onChange={(e) => setSignUpData({...signUpData, state: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => {
                      setSignUpData({...signUpData, password: e.target.value});
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    required
                    disabled={isLoading}
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
                      <Shield className="h-4 w-4" />
                      <span className="text-sm text-black">Password strength: {passwordStrength}</span>
                    </div>
                    <Progress 
                      value={getPasswordStrengthPercentage()} 
                      className={`h-2 ${getPasswordStrengthColor()}`}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                    required
                    disabled={isLoading}
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

              {/* Terms and Conditions Acceptance */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                     <Label 
                       htmlFor="terms" 
                       className="text-sm leading-5 cursor-pointer text-black"
                     >
                       I have read and agree to the{" "}
                       <Link
                         to="/terms"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-800 underline font-medium"
                       >
                         FinPilot Terms and Conditions
                       </Link>
                       {", "}
                       <Link
                         to="/privacy"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-800 underline font-medium"
                       >
                         Privacy Policy
                       </Link>
                       {", and the 3-day free trial and monthly subscription terms outlined above."}
                     </Label>
                  </div>
                </div>
                <p className="text-xs text-black ml-6">
                  By creating an account, you agree to our terms of service and acknowledge that you have read our privacy policy.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !termsAccepted}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-black">
                Already have an account?{" "}
                <Link to="/auth" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;