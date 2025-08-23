import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, CheckCircle, Target, Award, Lock, Star, BookOpen, Calendar, TrendingUp, Zap, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();
  const overallProgress = 15; // More realistic progress
  
  const moduleProgress = [
    { name: "Business Finance Foundations", progress: 65, status: "in-progress", timeSpent: "2h 45m", lessons: 8, completedLessons: 5 },
    { name: "Capital Markets", progress: 0, status: "available", timeSpent: "0m", lessons: 6, completedLessons: 0 },
    { name: "SBA Loan Programs", progress: 0, status: "locked", timeSpent: "0m", lessons: 10, completedLessons: 0 },
    { name: "Conventional Lending", progress: 0, status: "locked", timeSpent: "0m", lessons: 7, completedLessons: 0 },
    { name: "Bridge Financing", progress: 0, status: "locked", timeSpent: "0m", lessons: 5, completedLessons: 0 },
    { name: "Alternative Finance", progress: 0, status: "locked", timeSpent: "0m", lessons: 6, completedLessons: 0 },
    { name: "Credit Analysis", progress: 0, status: "locked", timeSpent: "0m", lessons: 9, completedLessons: 0 },
    { name: "Compliance", progress: 0, status: "locked", timeSpent: "0m", lessons: 8, completedLessons: 0 },
  ];

  const certificates = [
    {
      name: "Business Finance Foundations",
      status: "in-progress",
      description: "Fundamental concepts in business finance and financial analysis",
      progress: 65,
      estimatedTime: "1h remaining"
    },
    {
      name: "Capital Markets Specialist",
      status: "available",
      description: "Advanced understanding of capital markets and investment strategies",
      progress: 0,
      estimatedTime: "3-4 hours"
    },
    {
      name: "SBA Loan Expert",
      status: "locked",
      description: "Comprehensive knowledge of SBA loan programs and application processes",
      progress: 0,
      estimatedTime: "5-6 hours"
    },
    {
      name: "Conventional Lending Specialist",
      status: "locked",
      description: "Traditional lending practices and risk assessment methodologies",
      progress: 0,
      estimatedTime: "4-5 hours"
    },
    {
      name: "Bridge Financing Expert",
      status: "locked",
      description: "Short-term financing solutions and bridge loan structuring",
      progress: 0,
      estimatedTime: "3-4 hours"
    },
    {
      name: "Alternative Finance Specialist",
      status: "locked",
      description: "Non-traditional financing options and innovative funding solutions",
      progress: 0,
      estimatedTime: "4-5 hours"
    },
    {
      name: "Credit Risk Analyst",
      status: "locked",
      description: "Advanced credit analysis and risk management techniques",
      progress: 0,
      estimatedTime: "6-7 hours"
    },
    {
      name: "Regulatory Compliance Expert",
      status: "locked",
      description: "Financial regulations and compliance requirements",
      progress: 0,
      estimatedTime: "5-6 hours"
    }
  ];

  const achievements = [
    { title: "First Steps", description: "Started your learning journey", earned: true },
    { title: "Quick Learner", description: "Complete 3 lessons in one day", earned: false },
    { title: "Consistent", description: "Study for 7 days straight", earned: false },
    { title: "Knowledge Seeker", description: "Complete 5 modules", earned: false },
  ];

  const getProgressStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">In Progress</Badge>;
      case "available":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Ready to Start</Badge>;
      case "locked":
        return <Badge variant="outline" className="opacity-60">Locked</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case "earned":
        return <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><Trophy className="h-3 w-3" />Earned</Badge>;
      case "in-progress":
        return <Badge className="gap-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"><Zap className="h-3 w-3" />In Progress</Badge>;
      case "available":
        return <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"><Star className="h-3 w-3" />Available</Badge>;
      case "locked":
        return <Badge variant="outline" className="gap-1 opacity-60"><Lock className="h-3 w-3" />Locked</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "available":
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Learning Progress</span>
          </div>
          <h1 className="text-4xl font-bold text-black">
            Your Learning Journey
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Track your progress through the comprehensive Halo Business Finance certification program
          </p>
        </div>

        <Tabs defaultValue="progress" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-black">
              Learning Progress
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-black">
              Certificates
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-black">
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-8 animate-fade-in">
            {/* Overall Progress Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  Overall Progress
                </CardTitle>
                <CardDescription className="text-base text-black">
                  You're making great progress on your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">Course Completion</span>
                    <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={overallProgress} className="h-4 bg-muted/50" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-30" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-emerald-500">0</div>
                    <div className="text-sm text-black font-medium">Completed</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-blue-500">1</div>
                    <div className="text-sm text-black font-medium">In Progress</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-amber-500">1</div>
                    <div className="text-sm text-black font-medium">Available</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-gray-500">6</div>
                    <div className="text-sm text-black font-medium">Locked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  Learning Modules
                </CardTitle>
                <CardDescription className="text-black">
                  Master each module to unlock the next one in your learning path
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleProgress.map((module, index) => (
                    <div 
                      key={module.name} 
                      className="group border rounded-xl p-6 space-y-4 hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-gradient-to-r from-background to-background/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${
                              module.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              module.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              module.status === 'available' ? 'bg-amber-100 text-amber-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {module.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : index + 1}
                            </div>
                            {index < moduleProgress.length - 1 && (
                              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-black group-hover:text-primary transition-colors">
                              {module.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-black">
                              {getProgressStatusBadge(module.status)}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {module.timeSpent}
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {module.completedLessons}/{module.lessons} lessons
                              </div>
                            </div>
                          </div>
                        </div>
                        {getStatusIcon(module.status)}
                      </div>
                      
                      {module.status !== "locked" && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-black font-medium">Progress</span>
                            <span className="font-semibold text-primary">{module.progress}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={module.progress} className="h-3 bg-muted/50" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="certificates" className="space-y-8 animate-fade-in">
            {/* Summary Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-50" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  Professional Certifications
                </CardTitle>
                <CardDescription className="text-base text-black">
                  Earn industry-recognized certifications to advance your career
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-emerald-500">0</div>
                    <div className="text-sm text-black font-medium">Earned</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-blue-500">1</div>
                    <div className="text-sm text-black font-medium">In Progress</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-amber-500">1</div>
                    <div className="text-sm text-black font-medium">Available</div>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 hover-scale">
                    <div className="text-3xl font-bold text-gray-500">6</div>
                    <div className="text-sm text-black font-medium">Locked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Grid */}
            <div className="grid gap-6">
              {certificates.map((certificate, index) => (
                <Card 
                  key={certificate.name} 
                  className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    certificate.status === "earned" ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200" :
                    certificate.status === "in-progress" ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200" :
                    certificate.status === "available" ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200" :
                    "bg-gradient-to-r from-background to-muted/20"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            certificate.status === "earned" ? "bg-emerald-100" :
                            certificate.status === "in-progress" ? "bg-blue-100" :
                            certificate.status === "available" ? "bg-amber-100" :
                            "bg-muted"
                          }`}>
                            <Award className={`h-5 w-5 ${
                              certificate.status === "earned" ? "text-emerald-600" :
                              certificate.status === "in-progress" ? "text-blue-600" :
                              certificate.status === "available" ? "text-amber-600" :
                              "text-muted-foreground"
                            }`} />
                          </div>
                          <CardTitle className="text-xl text-black group-hover:text-primary transition-colors">
                            {certificate.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base leading-relaxed text-black">
                          {certificate.description}
                        </CardDescription>
                        {certificate.status !== "locked" && (
                          <div className="flex items-center gap-2 text-sm text-black">
                            <Calendar className="h-4 w-4" />
                            <span>{certificate.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                      {getCertificateStatusBadge(certificate.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {certificate.status === "in-progress" && certificate.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-black font-medium">Progress</span>
                          <span className="font-semibold text-primary">{certificate.progress}%</span>
                        </div>
                        <Progress value={certificate.progress} className="h-2" />
                      </div>
                    )}
                    
                    {certificate.status === "available" && (
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                        onClick={() => navigate("/dashboard")}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Start Learning Path
                      </Button>
                    )}

                    {certificate.status === "in-progress" && (
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full border-primary/20 hover:bg-primary/5" 
                        onClick={() => navigate("/dashboard")}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    )}

                    {certificate.status === "locked" && (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm text-black leading-relaxed">
                          Complete prerequisite modules to unlock this certification and advance your expertise
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-8 animate-fade-in">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-50" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Gift className="h-6 w-6 text-accent" />
                  </div>
                  Achievements & Milestones
                </CardTitle>
                <CardDescription className="text-base text-black">
                  Unlock achievements as you progress through your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={achievement.title}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        achievement.earned 
                          ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                          : "bg-muted/30 border-border/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-3 rounded-full ${
                        achievement.earned ? "bg-emerald-100" : "bg-muted"
                      }`}>
                        <Trophy className={`h-5 w-5 ${
                          achievement.earned ? "text-emerald-600" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.earned ? "text-emerald-900" : "text-black"
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-black">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProgressPage;