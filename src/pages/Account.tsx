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
import { User, Mail, Phone, MapPin, Calendar, Award, Target, Clock, Edit, Save, X, Bell, Shield, Palette, Globe, Settings } from "lucide-react";

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

  const achievements = [
    { name: "Business Finance Foundations", date: "July 15, 2024", type: "Certificate" },
    { name: "Capital Markets Specialist", date: "July 22, 2024", type: "Certificate" },
    { name: "First Course Completed", date: "July 15, 2024", type: "Badge" },
    { name: "Quick Learner", date: "July 20, 2024", type: "Badge" }
  ];

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

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
        return;
      }

      if (profile) {
        const profileData = {
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
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
      } else {
        // Create a new profile with default values
        const defaultProfile = {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: "",
          location: "",
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
        company: editForm.company
      });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          title: editForm.title,
          location: editForm.location,
          company: editForm.company
        }, {
          onConflict: 'user_id'
        });

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

  const resetForm = () => {
    setEditForm(userInfo);
  };

  const handlePreferencesSubmit = () => {
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingsSubmit = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated successfully.",
    });
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
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {userInfo.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userInfo.name}</CardTitle>
              <CardDescription>{userInfo.title}</CardDescription>
              <Badge variant="secondary" className="mt-2">{userInfo.company}</Badge>
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
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userInfo.location}</span>
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
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Tabs defaultValue="activity" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="goals">Learning Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        Your latest learning activities and progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium">Completed SBA Loan Programs Module 3</p>
                            <p className="text-sm text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <div>
                            <p className="font-medium">Earned Capital Markets Specialist Certificate</p>
                            <p className="text-sm text-muted-foreground">5 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <div>
                            <p className="font-medium">Started SBA Loan Programs Module</p>
                            <p className="text-sm text-muted-foreground">1 week ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Goals
                      </CardTitle>
                      <CardDescription>
                        Track your progress toward learning objectives
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Complete SBA Loan Programs</h3>
                            <span className="text-sm text-muted-foreground">65% Complete</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full w-[65%]"></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Target: End of this month</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Earn 3 Professional Certificates</h3>
                            <span className="text-sm text-muted-foreground">2 of 3 Complete</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full w-[67%]"></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Target: End of next month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements & Certificates
                  </CardTitle>
                  <CardDescription>
                    Your earned certificates and learning milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-accent" />
                          <div>
                            <h3 className="font-medium">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground">Earned on {achievement.date}</p>
                          </div>
                        </div>
                        <Badge variant={achievement.type === "Certificate" ? "completed" : "secondary"}>
                          {achievement.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                      <Select defaultValue="medium">
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;