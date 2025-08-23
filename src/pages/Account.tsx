import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Calendar, Award, Target, Clock, Edit, Save, X, Bell, Shield, Palette, Globe, Settings, CreditCard } from "lucide-react";
import { LiveLearningStats } from "@/components/LiveLearningStats";
import { AvatarUpload } from "@/components/AvatarUpload";

// Phone number formatting utility
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  
  // Format as (xxx) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};

// Phone input handler that formats as user types
const handlePhoneInput = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Format progressively
  if (limitedDigits.length >= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  } else if (limitedDigits.length >= 3) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else if (limitedDigits.length > 0) {
    return `(${limitedDigits}`;
  }
  
  return "";
};
import { supabase } from "@/integrations/supabase/client";

const AccountPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    city: "",
    state: "",
    joinDate: "",
    title: "",
    company: "",
    avatar: "/placeholder.svg"
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'est',
    dateFormat: 'mdy',
    fontSize: 'medium',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    reducedMotion: false,
    courseProgress: true,
    newCourses: true,
    webinarReminders: true,
    weeklyProgress: false,
    marketingCommunications: false
  });

  const [editForm, setEditForm] = useState(userInfo);


  const learningStats = {
    totalHours: "7.5",
    completedModules: 2,
    inProgressModules: 1,
    averageScore: 94
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Apply font size to body when preferences change
  useEffect(() => {
    document.body.className = document.body.className.replace(/font-(small|medium|large)/g, '');
    document.body.classList.add(`font-${preferences.fontSize}`);
  }, [preferences.fontSize]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your profile.",
          variant: "destructive"
        });
        return;
      }

      // Use the new secure function instead of direct table access
      const { data: profiles, error } = await supabase.rpc('get_user_profile');

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
        return;
      }

      // The function returns an array, get the first profile
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (profile) {
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
        
        const preferencesData = {
          theme: profile.theme || 'light',
          language: profile.language || 'en',
          timezone: profile.timezone || 'est',
          dateFormat: profile.date_format || 'mdy',
          fontSize: profile.font_size || 'medium',
          emailNotifications: profile.email_notifications ?? true,
          pushNotifications: profile.push_notifications ?? false,
          marketingEmails: profile.marketing_emails ?? false,
          reducedMotion: profile.reduced_motion ?? false,
          courseProgress: profile.course_progress ?? true,
          newCourses: profile.new_courses ?? true,
          webinarReminders: profile.webinar_reminders ?? true,
          weeklyProgress: profile.weekly_progress ?? false,
          marketingCommunications: profile.marketing_communications ?? false
        };
        
        setUserInfo(profileData);
        setEditForm(profileData);
        setPreferences(preferencesData);
      } else {
        // Create a new profile with default values
        const defaultProfile = {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: "",
          location: "",
          city: "",
          state: "",
          joinDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          title: "",
          company: "",
          avatar: "/placeholder.svg"
        };
        setUserInfo(defaultProfile);
        setEditForm(defaultProfile);
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log('Saving profile with data:', {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        title: editForm.title,
        location: editForm.location,
        city: editForm.city,
        state: editForm.state,
        company: editForm.company
      });

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

      console.log('Profile saved successfully, updating UI');
      setUserInfo({ ...editForm });
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success!",
        description: "Your profile has been successfully updated.",
      });
      
      // Reload the profile data to ensure UI consistency
      await loadProfile();
      
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
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          marketing_emails: preferences.marketingEmails,
          course_progress: preferences.courseProgress,
          new_courses: preferences.newCourses,
          webinar_reminders: preferences.webinarReminders,
          weekly_progress: preferences.weeklyProgress,
          marketing_communications: preferences.marketingCommunications
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AvatarUpload
                  currentAvatar={userInfo.avatar}
                  userInitials={userInfo.name.split(' ').map(n => n[0]).join('')}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>
              <CardTitle>{userInfo.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhoneNumber(userInfo.phone)}</span>
              </div>
              {userInfo.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>{userInfo.company}</span>
                </div>
              )}
              {userInfo.title && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{userInfo.title}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {userInfo.city || userInfo.state ? 
                    `${userInfo.city}${userInfo.city && userInfo.state ? ', ' : ''}${userInfo.state}` : 
                    'No location set'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {userInfo.joinDate}</span>
              </div>
            </CardContent>
          </Card>

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
        <div className="lg:col-span-2">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-transparent border-none p-0 h-auto gap-2 mb-2">
              <TabsTrigger value="account" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
                Privacy
              </TabsTrigger>
              <TabsTrigger value="preferences" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="billing" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
                Billing
              </TabsTrigger>
            </TabsList>



            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={editForm.name.split(' ')[0] || ''} 
                          onChange={(e) => {
                            const lastName = editForm.name.split(' ').slice(1).join(' ');
                            handleInputChange('name', `${e.target.value} ${lastName}`.trim());
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={editForm.name.split(' ').slice(1).join(' ') || ''} 
                          onChange={(e) => {
                            const firstName = editForm.name.split(' ')[0] || '';
                            handleInputChange('name', `${firstName} ${e.target.value}`.trim());
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={editForm.phone} 
                        onChange={(e) => {
                          const formattedPhone = handlePhoneInput(e.target.value);
                          handleInputChange('phone', formattedPhone);
                        }}
                        placeholder="(xxx) XXX-XXXX"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input 
                          id="company" 
                          value={editForm.company} 
                          onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input 
                          id="title" 
                          value={editForm.title} 
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={editForm.city} 
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          value={editForm.state} 
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Enter state"
                        />
                      </div>
                    </div>
                    <Button onClick={handleEditSubmit}>Save Changes</Button>
                  </CardContent>
                </Card>

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
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
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
                        checked={preferences.courseProgress}
                        onCheckedChange={(checked) => handlePreferenceChange('courseProgress', checked)}
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
                        checked={preferences.newCourses}
                        onCheckedChange={(checked) => handlePreferenceChange('newCourses', checked)}
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
                        checked={preferences.webinarReminders}
                        onCheckedChange={(checked) => handlePreferenceChange('webinarReminders', checked)}
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
                        checked={preferences.weeklyProgress}
                        onCheckedChange={(checked) => handlePreferenceChange('weeklyProgress', checked)}
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
                        checked={preferences.marketingCommunications}
                        onCheckedChange={(checked) => handlePreferenceChange('marketingCommunications', checked)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleNotificationSettingsSubmit}>Save Notification Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Data
                  </CardTitle>
                  <CardDescription>
                    Control your privacy settings and data preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow other learners to see your profile and achievements
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Learning Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Share anonymous learning data to improve the platform
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Activity Tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          Track your learning activities for progress reports
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Data Management</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleDownloadData}
                      >
                        Download My Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleRequestDataDeletion}
                      >
                        Request Data Deletion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
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

            <TabsContent value="billing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription>
                      Manage your payment methods and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/26</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                      <Button variant="outline">
                        Update Billing Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Your current subscription plan and billing cycle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Professional Plan</h3>
                        <p className="text-sm text-muted-foreground">Full access to all courses and features</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$49.99/month</p>
                        <p className="text-sm text-muted-foreground">Next billing: Jan 15, 2025</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Change Plan
                      </Button>
                      <Button variant="outline">
                        Cancel Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View and download your past invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: "Dec 15, 2024", amount: "$49.99", status: "Paid", invoice: "INV-2024-12-001" },
                        { date: "Nov 15, 2024", amount: "$49.99", status: "Paid", invoice: "INV-2024-11-001" },
                        { date: "Oct 15, 2024", amount: "$49.99", status: "Paid", invoice: "INV-2024-10-001" },
                      ].map((bill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{bill.invoice}</p>
                              <p className="text-sm text-muted-foreground">{bill.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">{bill.amount}</span>
                            <Badge variant={bill.status === "Paid" ? "default" : "secondary"}>
                              {bill.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View All Billing History
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Settings</CardTitle>
                    <CardDescription>
                      Configure your billing preferences and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Receipts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email receipts for all payments
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified before your subscription renews
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Failed Payment Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive alerts if a payment fails
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="pt-4">
                      <Button>Save Billing Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;