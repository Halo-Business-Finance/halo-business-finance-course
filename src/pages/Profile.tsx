import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Award, Target, Clock } from "lucide-react";

const ProfilePage = () => {
  const userInfo = {
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "January 15, 2024",
    title: "Finance Manager",
    company: "Tech Solutions Inc.",
    avatar: "/placeholder.svg"
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
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
                <span>{userInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userInfo.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {userInfo.joinDate}</span>
              </div>
              <Button className="w-full mt-4">Edit Profile</Button>
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
          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="goals">Learning Goals</TabsTrigger>
            </TabsList>

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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;