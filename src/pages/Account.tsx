import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Calendar, Award, Target, Clock, Edit, Bell, Shield, Palette, Globe, Settings, CreditCard, MessageCircle, HelpCircle, Download, Trophy, X, Save } from "lucide-react";
import { LiveLearningStats } from "@/components/LiveLearningStats";
import { AvatarUpload } from "@/components/AvatarUpload";
import { SEOHead } from "@/components/SEOHead";
import { SecurityPrivacyManager } from "@/components/SecurityPrivacyManager";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { UserPreferences, NotificationPreferences, UserProfile } from "@/types";

// Phone number formatting utility
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
};

// Phone input handler
const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>): string => {
  return formatPhoneNumber(e.target.value);
};

const AccountPage = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'account';
  
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    updatePreferences,
    updateNotificationSettings
  } = useUserProfile();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const [editForm, setEditForm] = useState<any>({});
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'est',
    dateFormat: 'mdy',
    fontSize: 'medium',
    reducedMotion: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    courseProgress: true,
    newCourses: true,
    webinarReminders: true,
    weeklyProgress: false,
    marketingCommunications: false
  });


  const handleTabChange = (tab: string): void => {
    navigate(`/my-account?tab=${tab}`);
  };

  const learningStats = {
    totalHours: "7.5",
    completedModules: 2,
    inProgressModules: 1,
    averageScore: 94
  };

  // Sync local state with profile data
  useEffect(() => {
    if (profile) {
      // Set user info for display
      const profileData = {
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        city: profile.city || "",
        state: profile.state || "",
        joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : "",
        title: profile.title || "",
        company: profile.company || "",
        avatar: profile.avatar_url || "/placeholder.svg"
      };
      
      setUserInfo(profileData);
      setEditForm(profileData);

      setPreferences({
        theme: (profile.theme as 'light' | 'dark') || 'light',
        language: profile.language || 'en',
        timezone: profile.timezone || 'est',
        dateFormat: profile.date_format || 'mdy',
        fontSize: (profile.font_size as 'small' | 'medium' | 'large') || 'medium',
        reducedMotion: profile.reduced_motion || false
      });

      setNotificationSettings({
        emailNotifications: profile.email_notifications ?? true,
        pushNotifications: profile.push_notifications ?? false,
        marketingEmails: profile.marketing_emails ?? false,
        courseProgress: profile.course_progress ?? true,
        newCourses: profile.new_courses ?? true,
        webinarReminders: profile.webinar_reminders ?? true,
        weeklyProgress: profile.weekly_progress ?? false,
        marketingCommunications: profile.marketing_communications ?? false
      });
    }
  }, [profile]);

  // Apply font size using CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--user-font-size', fontSizeMap[preferences.fontSize] || '16px');
  }, [preferences.fontSize]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your profile.",
          variant: "destructive"
        });
        return;
      }


      // Update profile through secure RLS-protected direct update
      // Since we're updating our own profile, this will go through the "Users can update own profile only" policy
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          title: editForm.title,
          location: editForm.location,
          city: editForm.city,
          state: editForm.state,
          company: editForm.company
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile changes.",
          variant: "destructive"
        });
        return;
      }

      
      setUserInfo({ ...editForm });
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success!",
        description: "Your profile has been successfully updated.",
      });
      
      // Reload the profile data to ensure UI consistency
      // Use the hook's refetch instead of loadProfile
      
    } catch (error) {
      console.error('Error in handleEditSubmit:', error);
      toast({
        title: "Error", 
        description: "Failed to save profile changes.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setUserInfo(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
    setEditForm(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
  };

  const resetForm = () => {
    setEditForm(userInfo);
  };

  const handlePreferencesSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your preferences.",
          variant: "destructive"
        });
        return;
      }

      // Update preferences through secure RLS-protected direct update
      const { error } = await supabase
        .from('profiles')
        .update({
          theme: preferences.theme,
          language: preferences.language,
          timezone: preferences.timezone,
          date_format: preferences.dateFormat,
          font_size: preferences.fontSize,
          reduced_motion: preferences.reducedMotion
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save preferences.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error in handlePreferencesSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive"
      });
    }
  };

  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingsSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your notification settings.",
          variant: "destructive"
        });
        return;
      }

      // Update notification settings through secure RLS-protected direct update
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: notificationSettings.emailNotifications,
          push_notifications: notificationSettings.pushNotifications,
          marketing_emails: notificationSettings.marketingEmails,
          course_progress: notificationSettings.courseProgress,
          new_courses: notificationSettings.newCourses,
          webinar_reminders: notificationSettings.webinarReminders,
          weekly_progress: notificationSettings.weeklyProgress,
          marketing_communications: notificationSettings.marketingCommunications
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving notification settings:', error);
        toast({
          title: "Error",
          description: "Failed to save notification settings.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error in handleNotificationSettingsSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadData = () => {
    toast({
      title: "Data Export Initiated",
      description: "Your data download will be prepared and sent to your email address within 24 hours.",
    });
  };

  const handleRequestDataDeletion = () => {
    toast({
      title: "Data Deletion Request Submitted",
      description: "Your request has been submitted. Our team will contact you within 48 hours to process this request.",
      variant: "destructive"
    });
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <div className="text-lg mt-2">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-destructive">Failed to load profile</div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <SEOHead 
        title="My Account - FinPilot Academy"
        description="Manage your account settings, learning preferences, privacy options, and billing information at FinPilot Academy."
        keywords="account management, user settings, learning preferences, privacy, billing"
      />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-1">Manage your profile and account settings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="account">My Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
      {/* Profile Info - Account Information Widget moved higher */}
      <Card className="mb-4 max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">My Account Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col items-center space-y-2 order-2 md:order-1">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="self-end mb-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="border-gray-800/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className="border-gray-800/20"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                          placeholder="(555) 123-4567"
                          className="border-gray-800/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Your job title"
                          className="border-gray-800/20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={editForm.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your company name"
                        className="border-gray-800/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={editForm.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Your city"
                          className="border-gray-800/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={editForm.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Your state"
                          className="border-gray-800/20"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          setIsEditDialogOpen(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <AvatarUpload
                currentAvatar={userInfo.avatar}
                userInitials={userInfo.name.split(' ').map(n => n[0]).join('')}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <div className="text-center">
                <h3 className="text-base font-semibold">{userInfo.name}</h3>
                <p className="text-xs text-muted-foreground">{userInfo.title}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs truncate">{userInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">{formatPhoneNumber(userInfo.phone) || 'No phone number'}</span>
              </div>
              {userInfo.company && (
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs truncate">{userInfo.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">
                  {userInfo.city || userInfo.state ? 
                    `${userInfo.city}${userInfo.city && userInfo.state ? ', ' : ''}${userInfo.state}` : 
                    'No location set'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">Joined {userInfo.joinDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Learning Stats */}
        <div className="lg:col-span-1 space-y-6">

          {/* Learning Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{learningStats.totalHours}</div>
                  <div className="text-xs text-muted-foreground">Hours Studied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{learningStats.completedModules}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{learningStats.inProgressModules}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{learningStats.averageScore}%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">              
          {/* Change Password Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Shield className="h-4 w-4 mr-2" />
                {showPasswordForm ? 'Close Window' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Password & Security Form - Only show when button is clicked */}
          {showPasswordForm && (
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="border-gray-800/20 text-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="border-gray-800/20 text-black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="border-gray-800/20 text-black" />
                </div>
                
                {/* Password Requirements */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Password Requirements:</h4>
                  <ul className="text-xs text-black space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      Contains at least one uppercase letter (A-Z)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      Contains at least one lowercase letter (a-z)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      Contains at least one number (0-9)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      Contains at least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
                
                <Button className="bg-blue-800 hover:bg-blue-900 text-white">Change Password</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Progress Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you complete modules or earn certificates
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.courseProgress}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, courseProgress: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Course Announcements</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new courses and modules
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newCourses}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newCourses: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webinar Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders before live webinars and events
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.webinarReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, webinarReminders: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Progress Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your learning progress
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyProgress}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyProgress: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive information about Halo services and updates
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.marketingCommunications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingCommunications: checked }))}
                    />
                  </div>
                </div>
                <Button onClick={handleNotificationSettingsSubmit}>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <SecurityPrivacyManager />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Display Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={preferences.theme} 
                      onValueChange={(value) => handlePreferenceChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select 
                      value={preferences.fontSize} 
                      onValueChange={(value) => handlePreferenceChange('fontSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduce Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.reducedMotion}
                      onCheckedChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>
                    Set your language and regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={preferences.language} 
                      onValueChange={(value) => handlePreferenceChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select 
                      value={preferences.timezone} 
                      onValueChange={(value) => handlePreferenceChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={preferences.dateFormat} 
                      onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handlePreferencesSubmit}>Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Coming Soon</p>
                  <p className="text-muted-foreground">
                    Billing and subscription management features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default AccountPage;