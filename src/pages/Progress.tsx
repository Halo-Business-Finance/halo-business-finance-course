import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, CheckCircle, Target, Award, Download, Calendar, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();
  const overallProgress = 0; // Fresh start - no modules completed
  
  const moduleProgress = [
    { name: "Business Finance Foundations", progress: 0, status: "available", timeSpent: "0m" },
    { name: "Capital Markets", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "SBA Loan Programs", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "Conventional Lending", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "Bridge Financing", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "Alternative Finance", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "Credit Analysis", progress: 0, status: "locked", timeSpent: "0m" },
    { name: "Compliance", progress: 0, status: "locked", timeSpent: "0m" },
  ];

  const certificates = [
    {
      name: "Business Finance Foundations",
      status: "available",
      description: "Fundamental concepts in business finance and financial analysis"
    },
    {
      name: "Capital Markets Specialist",
      status: "locked",
      description: "Advanced understanding of capital markets and investment strategies"
    },
    {
      name: "SBA Loan Expert",
      status: "locked",
      description: "Comprehensive knowledge of SBA loan programs and application processes"
    },
    {
      name: "Conventional Lending Specialist",
      status: "locked",
      description: "Traditional lending practices and risk assessment methodologies"
    },
    {
      name: "Bridge Financing Expert",
      status: "locked",
      description: "Short-term financing solutions and bridge loan structuring"
    },
    {
      name: "Alternative Finance Specialist",
      status: "locked",
      description: "Non-traditional financing options and innovative funding solutions"
    },
    {
      name: "Credit Risk Analyst",
      status: "locked",
      description: "Advanced credit analysis and risk management techniques"
    },
    {
      name: "Regulatory Compliance Expert",
      status: "locked",
      description: "Financial regulations and compliance requirements"
    }
  ];

  const getProgressStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="completed">Completed</Badge>;
      case "in-progress":
        return <Badge variant="progress">In Progress</Badge>;
      case "locked":
        return <Badge variant="outline">Locked</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case "earned":
        return <Badge variant="completed" className="gap-1"><CheckCircle className="h-3 w-3" />Earned</Badge>;
      case "in-progress":
        return <Badge variant="progress">In Progress</Badge>;
      case "locked":
        return <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Locked</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-6">
          {/* Overall Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Overall Course Progress
              </CardTitle>
              <CardDescription>
                Track your journey through the Halo Business Finance program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{overallProgress}% Complete</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">0</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">8</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Module Progress</CardTitle>
              <CardDescription>
                Detailed breakdown of your progress in each course module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleProgress.map((module, index) => (
                  <div key={module.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{module.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getProgressStatusBadge(module.status)}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {module.timeSpent}
                            </div>
                          </div>
                        </div>
                      </div>
                      {module.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    
                    {module.status !== "locked" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Certification Summary
              </CardTitle>
              <CardDescription>
                Your progress toward becoming a certified Halo Business Finance professional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-sm text-muted-foreground">Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">1</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">7</div>
                  <div className="text-sm text-muted-foreground">Locked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates List */}
          <div className="grid gap-4">
            {certificates.map((certificate, index) => (
              <Card key={certificate.name} className={certificate.status === "earned" ? "border-accent/20 bg-accent/5" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{certificate.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {certificate.description}
                      </CardDescription>
                    </div>
                    {getCertificateStatusBadge(certificate.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {certificate.status === "available" && (
                    <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
                      Start Learning Path
                    </Button>
                  )}

                  {certificate.status === "locked" && (
                    <p className="text-sm text-muted-foreground">
                      Complete prerequisite modules to unlock this certification
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;