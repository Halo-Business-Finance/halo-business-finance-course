import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Play, CheckCircle, BookOpen, Award, FileText, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseData } from "@/data/courseData";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useState } from "react";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const [activeTab, setActiveTab] = useState("lessons");

  const module = courseData.modules.find(m => m.id === moduleId);
  
  // Add debugging and better error handling
  if (!module) {
    const availableModules = courseData.modules.map(m => ({ id: m.id, title: m.title }));
    console.log('Available modules:', availableModules);
    console.log('Requested moduleId:', moduleId);
    
    return (
      <div className="container mx-auto p-6 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested module "{moduleId}" could not be found.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Available Modules:</h2>
          <div className="grid gap-3">
            {courseData.modules.map((mod) => (
              <Card key={mod.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">ID: {mod.id}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/module/${mod.id}`)}
                  >
                    Go to Module
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="completed" className="gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case "in-progress":
        return <Badge variant="progress">In Progress</Badge>;
      case "locked":
        return <Badge variant="outline" className="opacity-60">🔒 Locked</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  // Show locked content only to non-admin users
  if (module.status === "locked" && !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              This module is currently locked. Please complete the prerequisite modules to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{module.title}</h1>
          <p className="text-muted-foreground mt-2">{module.description}</p>
        </div>
        {getStatusBadge(module.status)}
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.duration}</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.lessons}</div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.videos?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.lessons}</div>
            <div className="text-sm text-muted-foreground">Quiz Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {module.status !== "available" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Module Completion</span>
                <span className="font-medium">{module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Module Lessons</CardTitle>
              <CardDescription>Complete the lessons in order to progress through the module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const lessons = [
                    {
                      title: "Introduction & Overview",
                      type: "overview",
                      duration: "15 min",
                      completed: module.status === "completed" || module.progress > 0,
                      locked: false,
                      description: "Get an overview of the module content and learning objectives"
                    },
                    {
                      title: "Core Concepts",
                      type: "reading",
                      duration: "20 min", 
                      completed: module.status === "completed" || module.progress > 25,
                      locked: false, // Always accessible after introduction
                      description: "Learn the fundamental concepts and terminology"
                    },
                    {
                      title: "Case Study Analysis",
                      type: "assignment",
                      duration: "30 min",
                      completed: module.status === "completed" || module.progress > 50,
                      locked: false, // Make accessible to encourage engagement
                      description: "Apply your knowledge to real-world scenarios"
                    },
                    {
                      title: "Interactive Quiz",
                      type: "quiz",
                      duration: "10 min",
                      completed: module.status === "completed" || module.progress > 75,
                      locked: module.progress < 25 && module.status !== "completed", // Only lock if no progress made
                      description: "Test your understanding of the module material"
                    }
                  ];

                  const getTypeIcon = (type: string) => {
                    switch (type) {
                      case "overview": return <BookOpen className="h-4 w-4" />;
                      case "video": return <Play className="h-4 w-4" />;
                      case "reading": return <FileText className="h-4 w-4" />;
                      case "assignment": return <BookOpen className="h-4 w-4" />;
                      case "quiz": return <Award className="h-4 w-4" />;
                      default: return <BookOpen className="h-4 w-4" />;
                    }
                  };

                  const handleLessonClick = (lesson: any, index: number) => {
                    if (lesson.locked) {
                      alert("Complete the previous lesson to unlock this one!");
                      return;
                    }
                    
                    // Navigate to the appropriate content based on lesson type
                    switch (lesson.type) {
                      case "overview":
                        // Switch to overview tab for introduction content
                        setActiveTab("overview");
                        break;
                      case "video":
                        // Switch to videos tab to show relevant video content
                        setActiveTab("videos");
                        break;
                      case "reading":
                        // Switch to overview tab for reading content
                        setActiveTab("overview");
                        break;
                      case "assignment":
                        // Could navigate to a separate assignment page in the future
                        alert(`Opening assignment: ${lesson.title}`);
                        break;
                      case "quiz":
                        // Switch to quiz tab
                        setActiveTab("quiz");
                        break;
                      default:
                        setActiveTab("overview");
                    }
                  };

                  return lessons.map((lesson, index) => (
                    <div
                      key={index}
                      onClick={() => handleLessonClick(lesson, index)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        lesson.locked 
                          ? "bg-muted/10 opacity-50 cursor-not-allowed" 
                          : lesson.completed 
                          ? "bg-accent/10 hover:bg-accent/15" 
                          : "bg-muted/20 hover:bg-muted/30"
                      }`}
                    >
                      <div className={`${
                        lesson.locked 
                          ? "text-muted-foreground" 
                          : lesson.completed 
                          ? "text-accent" 
                          : "text-primary"
                      }`}>
                        {lesson.locked ? (
                          <Lock className="h-5 w-5" />
                        ) : lesson.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          getTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm text-muted-foreground">{lesson.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{lesson.duration}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.completed && (
                          <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                            Complete
                          </Badge>
                        )}
                        {lesson.locked && (
                          <Badge variant="outline" className="text-xs opacity-60">
                            Locked
                          </Badge>
                        )}
                        {!lesson.locked && !lesson.completed && (
                          <Badge variant="outline" className="text-xs">
                            Start
                          </Badge>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Module Overview
              </CardTitle>
              <CardDescription>What you'll learn in this module and how it applies to your role at Halo Business Finance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-6 leading-relaxed">{module.description}</p>
              </div>
              
              {/* Learning Objectives */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Learning Objectives
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-medium text-primary mb-2">1. Financial Statement Analysis Mastery</h4>
                    <p className="text-sm text-muted-foreground mb-2">Master Halo's proprietary financial statement analysis framework to accurately assess business creditworthiness and make informed lending decisions.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Analyze balance sheets for asset quality, liquidity, and capital structure</li>
                      <li>• Interpret income statements to assess profitability trends and sustainability</li>
                      <li>• Evaluate cash flow statements for operational efficiency and debt service capacity</li>
                      <li>• Identify financial red flags and warning signs in borrower profiles</li>
                      <li>• Calculate and interpret 15+ key financial ratios used in commercial lending</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-accent">
                    <h4 className="font-medium text-accent mb-2">2. Risk Assessment & Management Excellence</h4>
                    <p className="text-sm text-muted-foreground mb-2">Apply Halo's comprehensive risk evaluation methodologies to structure optimal loan terms while protecting the institution.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Conduct industry-specific risk analysis and benchmarking</li>
                      <li>• Assess borrower management quality and business experience</li>
                      <li>• Evaluate collateral values and security positioning</li>
                      <li>• Structure loan covenants and monitoring requirements</li>
                      <li>• Determine appropriate pricing based on risk profile</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-medium text-primary mb-2">3. Commercial Lending Product Expertise</h4>
                    <p className="text-sm text-muted-foreground mb-2">Develop comprehensive knowledge of Halo's lending products and their optimal application scenarios.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Understand working capital lines, term loans, and equipment financing</li>
                      <li>• Navigate SBA loan programs and guarantee structures</li>
                      <li>• Match loan products to specific business needs and cash flow patterns</li>
                      <li>• Structure repayment terms aligned with business cycles</li>
                      <li>• Apply regulatory requirements and compliance standards</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-accent">
                    <h4 className="font-medium text-accent mb-2">4. Client Relationship & Communication Skills</h4>
                    <p className="text-sm text-muted-foreground mb-2">Master Halo's customer-first approach to build lasting business relationships and drive growth.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Conduct effective client discovery and needs assessment interviews</li>
                      <li>• Present complex financial concepts in clear, understandable terms</li>
                      <li>• Build trust through transparent communication and expert guidance</li>
                      <li>• Handle objections and negotiate win-win loan structures</li>
                      <li>• Maintain ongoing relationships for portfolio growth and retention</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-medium text-primary mb-2">5. Market Analysis & Industry Intelligence</h4>
                    <p className="text-sm text-muted-foreground mb-2">Develop expertise in market dynamics and industry trends that impact lending decisions.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Analyze economic indicators and their impact on different industries</li>
                      <li>• Understand cyclical business patterns and seasonal factors</li>
                      <li>• Assess competitive landscape and market positioning</li>
                      <li>• Evaluate growth potential and market saturation risks</li>
                      <li>• Apply macroeconomic trends to portfolio management decisions</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-accent">
                    <h4 className="font-medium text-accent mb-2">6. Regulatory Compliance & Documentation</h4>
                    <p className="text-sm text-muted-foreground mb-2">Master the regulatory environment and documentation requirements for commercial lending excellence.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Navigate CRA, HMDA, and other regulatory compliance requirements</li>
                      <li>• Ensure proper loan documentation and file management</li>
                      <li>• Understand fair lending practices and anti-discrimination laws</li>
                      <li>• Implement proper KYC and AML procedures</li>
                      <li>• Maintain accurate records for regulatory examinations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Topics Covered */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Key Topics Covered
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary text-sm">Financial Analysis Fundamentals</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Balance Sheet Analysis</span>
                          <p className="text-xs text-muted-foreground">Asset quality, liquidity ratios, debt structure evaluation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Income Statement Interpretation</span>
                          <p className="text-xs text-muted-foreground">Revenue trends, margin analysis, expense management</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Cash Flow Analysis</span>
                          <p className="text-xs text-muted-foreground">Operating cash flow, debt service coverage, working capital needs</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Financial Ratios & Metrics</span>
                          <p className="text-xs text-muted-foreground">15+ key ratios including leverage, profitability, and efficiency</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary text-sm">Commercial Lending Expertise</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Loan Product Knowledge</span>
                          <p className="text-xs text-muted-foreground">Working capital, term loans, equipment financing, SBA programs</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Risk Assessment Framework</span>
                          <p className="text-xs text-muted-foreground">Industry analysis, collateral evaluation, management assessment</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Pricing & Structuring</span>
                          <p className="text-xs text-muted-foreground">Risk-based pricing, covenant structure, repayment terms</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Regulatory Compliance</span>
                          <p className="text-xs text-muted-foreground">CRA requirements, fair lending, documentation standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary text-sm">Market & Industry Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Economic Indicators</span>
                          <p className="text-xs text-muted-foreground">GDP trends, interest rates, unemployment impacts</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Industry Sector Analysis</span>
                          <p className="text-xs text-muted-foreground">Retail, manufacturing, healthcare, professional services</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Competitive Positioning</span>
                          <p className="text-xs text-muted-foreground">Market share analysis, competitive advantages, barriers to entry</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Business Cycle Impact</span>
                          <p className="text-xs text-muted-foreground">Seasonal patterns, cyclical trends, recession resilience</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary text-sm">Client Relationship Management</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Discovery & Needs Assessment</span>
                          <p className="text-xs text-muted-foreground">Effective questioning techniques, financial needs analysis</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Presentation Skills</span>
                          <p className="text-xs text-muted-foreground">Clear communication, objection handling, decision facilitation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Relationship Building</span>
                          <p className="text-xs text-muted-foreground">Trust development, ongoing communication, portfolio growth</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded bg-background border">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Problem Resolution</span>
                          <p className="text-xs text-muted-foreground">Workout strategies, restructuring options, customer retention</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Expected Outcomes & Career Impact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-accent text-sm">Immediate Skills Development</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Financial Analysis Proficiency</p>
                          <p className="text-xs text-muted-foreground mb-1">Confidently analyze financial statements using Halo's proven methodologies</p>
                          <div className="text-xs text-accent">✓ 95% accuracy in ratio calculations ✓ Red flag identification ✓ Trend analysis</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Risk Assessment Mastery</p>
                          <p className="text-xs text-muted-foreground mb-1">Make informed lending decisions by effectively weighing risk factors</p>
                          <div className="text-xs text-accent">✓ Industry risk evaluation ✓ Collateral assessment ✓ Pricing optimization</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Product Knowledge Excellence</p>
                          <p className="text-xs text-muted-foreground mb-1">Match optimal loan products to specific business needs and scenarios</p>
                          <div className="text-xs text-accent">✓ SBA program expertise ✓ Structure optimization ✓ Compliance adherence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-accent text-sm">Professional Development</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">4</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Client Communication Skills</p>
                          <p className="text-xs text-muted-foreground mb-1">Communicate complex concepts clearly to clients and stakeholders</p>
                          <div className="text-xs text-accent">✓ Presentation confidence ✓ Objection handling ✓ Relationship building</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">5</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Regulatory Compliance Confidence</p>
                          <p className="text-xs text-muted-foreground mb-1">Navigate regulations and ensure all activities meet compliance standards</p>
                          <div className="text-xs text-accent">✓ Documentation accuracy ✓ Fair lending practices ✓ Audit readiness</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">6</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Strategic Decision Making</p>
                          <p className="text-xs text-muted-foreground mb-1">Balance risk and opportunity to optimize portfolio performance</p>
                          <div className="text-xs text-accent">✓ Market analysis ✓ Portfolio strategy ✓ Growth opportunities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Career Impact Section */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                  <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Career Advancement Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary mb-1">90%</div>
                      <div className="text-xs text-muted-foreground">of graduates receive promotions within 12 months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent mb-1">$15K+</div>
                      <div className="text-xs text-muted-foreground">average salary increase after certification</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary mb-1">85%</div>
                      <div className="text-xs text-muted-foreground">report increased confidence in lending decisions</div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="mt-4 p-4 rounded-lg bg-muted/20 border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    Module Completion Benchmarks
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 rounded bg-background">
                      <div className="font-medium text-primary">Quiz Score</div>
                      <div className="text-muted-foreground">≥85% Required</div>
                    </div>
                    <div className="text-center p-2 rounded bg-background">
                      <div className="font-medium text-accent">Case Studies</div>
                      <div className="text-muted-foreground">All Completed</div>
                    </div>
                    <div className="text-center p-2 rounded bg-background">
                      <div className="font-medium text-primary">Video Content</div>
                      <div className="text-muted-foreground">100% Watched</div>
                    </div>
                    <div className="text-center p-2 rounded bg-background">
                      <div className="font-medium text-accent">Time Investment</div>
                      <div className="text-muted-foreground">{module.duration} Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Prerequisites & Recommendations */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Getting Started
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h4 className="font-medium text-accent mb-2">Prerequisites</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Basic understanding of financial statements</li>
                      <li>• High school mathematics proficiency</li>
                      <li>• Commitment to complete all module components</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Recommended Approach</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Complete lessons in sequential order</li>
                      <li>• Take notes during video content</li>
                      <li>• Practice with provided case studies</li>
                      <li>• Review materials before taking quiz</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-6">
            {module.videos && module.videos.length > 0 ? (
              module.videos.map((video: any, index: number) => (
                <VideoPlayer
                  key={video.title}
                  title={`${index + 1}. ${video.title}`}
                  description={video.description}
                  duration={video.duration}
                  videoType={video.videoType}
                  videoUrl={video.videoUrl}
                  youtubeId={video.youtubeId}
                  className="w-full"
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Videos Available</h3>
                  <p className="text-muted-foreground">Videos for this module will be available soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Module Resources</CardTitle>
              <CardDescription>Download materials and tools for this module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Study Materials */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Study Materials
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{module.title} - Study Guide</p>
                          <p className="text-sm text-muted-foreground">Comprehensive overview and key concepts (PDF, 2.3 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Key Terms & Definitions</p>
                          <p className="text-sm text-muted-foreground">Glossary of important terminology (PDF, 0.8 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Templates & Tools */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    Templates & Tools
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Financial Analysis Spreadsheet</p>
                          <p className="text-sm text-muted-foreground">Excel template for ratio calculations (XLSX, 1.2 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Loan Application Checklist</p>
                          <p className="text-sm text-muted-foreground">Step-by-step checklist for loan processing (PDF, 0.5 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Case Study Worksheet</p>
                          <p className="text-sm text-muted-foreground">Practice exercises and solutions (PDF, 1.5 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Additional Resources
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Industry Best Practices Guide</p>
                          <p className="text-sm text-muted-foreground">Current standards and procedures (PDF, 3.1 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Regulatory Updates Summary</p>
                          <p className="text-sm text-muted-foreground">Latest regulatory changes and compliance notes (PDF, 1.8 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Access</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      All Resources
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      Study Guides Only
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      Templates Only
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <ModuleQuiz 
            moduleId={module.id}
            moduleTitle={module.title}
            totalQuestions={module.lessons}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Previous Module
        </Button>
        <Button className="gap-2" onClick={() => navigate("/")}>
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModulePage;