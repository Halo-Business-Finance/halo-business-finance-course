
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EnhancedQuiz } from "@/components/EnhancedQuiz";
import { InteractiveCalculator, InteractiveDragDrop, InteractiveScenario, InteractiveLessonComponents } from "@/components/InteractiveLessonComponents";
import { CheckCircle, Play, FileText, BookOpen, Users2, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    title: string;
    type: string;
    duration: string;
    completed: boolean;
  };
  moduleTitle: string;
}

export const LessonModal = ({ isOpen, onClose, lesson, moduleTitle }: LessonModalProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />;
      case "reading": return <FileText className="h-4 w-4" />;
      case "assignment": return <BookOpen className="h-4 w-4" />;
      case "quiz": return <Users2 className="h-4 w-4" />;
      case "interactive": return <Zap className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const handleComplete = () => {
    setProgress(100);
    toast({
      title: "🎉 Lesson Completed!",
      description: `You've completed "${lesson.title}"`,
      variant: "default",
    });
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const getTopicSpecificContent = (title: string, type: string) => {
    const titleLower = title.toLowerCase();
    
    // Equipment Financing Content
    if (titleLower.includes('equipment') || titleLower.includes('machinery')) {
      return {
        description: "Equipment financing enables businesses to acquire essential machinery, vehicles, and technology without large upfront capital investments.",
        objectives: [
          "Understand equipment financing structures and loan-to-value ratios",
          "Learn to evaluate equipment value and depreciation schedules",
          "Master cash flow analysis for equipment loan approvals",
          "Explore leasing vs. financing options for different scenarios"
        ],
        keyPoints: [
          "Equipment typically serves as collateral, enabling 80-90% financing",
          "Terms usually range from 2-7 years based on equipment useful life",
          "Interest rates are often lower than unsecured business loans",
          "Down payments typically range from 10-20% of equipment value"
        ],
        scenario: {
          title: "Manufacturing Equipment Acquisition",
          description: "A growing manufacturing company needs to purchase a $500,000 CNC machine to expand production capacity. The company has been profitable for 3 years with $2.5M annual revenue.",
          details: [
            "Equipment cost: $500,000 (new CNC machine)",
            "Useful life: 10 years, depreciation schedule available",
            "Company financials: Strong cash flow, 15% net margin",
            "Down payment available: $75,000 (15%)",
            "Projected ROI: Machine will increase capacity by 40%"
          ]
        }
      };
    }
    
    // SBA Lending Content
    if (titleLower.includes('sba') || titleLower.includes('7(a)') || titleLower.includes('504')) {
      return {
        description: "SBA loans provide government-backed financing to help small businesses access capital with favorable terms and lower down payments.",
        objectives: [
          "Understand SBA loan programs and eligibility requirements",
          "Learn the SBA application and approval process",
          "Master SBA guaranty percentages and lender benefits",
          "Explore SBA 7(a), 504, and Express loan differences"
        ],
        keyPoints: [
          "SBA guarantees 50-90% of loan amount, reducing lender risk",
          "Maximum loan amounts vary by program (7(a): $5M, 504: $5.5M)",
          "Interest rates are typically prime + 2.25% to 4.75%",
          "Personal guarantees required for owners with 20%+ ownership"
        ]
      };
    }
    
    // Commercial Real Estate Content
    if (titleLower.includes('real estate') || titleLower.includes('commercial property')) {
      return {
        description: "Commercial real estate financing enables businesses to purchase, refinance, or develop commercial properties for business operations.",
        objectives: [
          "Analyze commercial property values and cash flow projections",
          "Understand debt service coverage ratios and loan-to-value requirements",
          "Learn commercial appraisal and environmental assessment processes",
          "Explore different CRE loan structures and terms"
        ],
        keyPoints: [
          "Typical LTV ratios range from 70-80% for owner-occupied properties",
          "Debt Service Coverage Ratio (DSCR) should be 1.25x or higher",
          "Terms usually 10-25 years with 5-10 year call provisions",
          "Environmental assessments and appraisals are required"
        ]
      };
    }
    
    // Default content for other topics
    return {
      description: `This lesson provides comprehensive coverage of ${title.toLowerCase()}, including practical applications and industry best practices.`,
      objectives: [
        "Understand fundamental concepts and terminology",
        "Learn practical applications and real-world scenarios",
        "Explore industry best practices and compliance requirements",
        "Practice with case studies and examples"
      ],
      keyPoints: [
        "Key regulatory and compliance considerations",
        "Risk assessment and mitigation strategies",
        "Documentation and process requirements",
        "Common challenges and solutions"
      ]
    };
  };

  const renderLessonContent = () => {
    const content = getTopicSpecificContent(lesson.title, lesson.type);
    
    switch (lesson.type) {
      case "video":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed">{content.description}</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">📚 Learning Objectives</h3>
                    <ul className="space-y-2">
                      {content.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">🎯 Key Learning Points</h3>
                    <ul className="space-y-2">
                      {content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-700">
                          <Badge variant="outline" className="text-xs px-2 py-1 border-green-300 bg-green-100 text-green-800">
                            {index + 1}
                          </Badge>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {content.scenario && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">💼 Case Study: {content.scenario.title}</h3>
                      <p className="text-purple-700 mb-3">{content.scenario.description}</p>
                      <ul className="space-y-1">
                        {content.scenario.details.map((detail, index) => (
                          <li key={index} className="text-sm text-purple-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-purple-400 rounded-full" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      💡 Key Takeaways
                    </h4>
                    <p className="text-amber-700 text-sm">
                      Take detailed notes as you progress through this lesson. The concepts covered here will be essential for your practical application and upcoming assessments.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Lesson
                  </Button>
                  <Button variant="outline" onClick={() => setProgress(50)} className="px-6">
                    Take Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "reading":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Reading: {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200 mb-6">
                    <p className="text-base leading-relaxed text-slate-700">{content.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">📖 What You'll Learn</h3>
                      <ul className="space-y-2">
                        {content.objectives.slice(0, 2).map((objective, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-3">🎯 Key Concepts</h3>
                      <ul className="space-y-2">
                        {content.keyPoints.slice(0, 2).map((point, index) => (
                          <li key={index} className="text-sm text-emerald-700 flex items-start gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-4">📚 Detailed Reading Content</h3>
                    <div className="space-y-4 text-indigo-700">
                      <p>This comprehensive reading material provides in-depth coverage of {lesson.title.toLowerCase()}. The content is structured to build your understanding progressively, starting with fundamental concepts and advancing to practical applications.</p>
                      
                      <div className="grid gap-3">
                        <div className="flex items-start gap-3">
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Section 1</Badge>
                          <span className="text-sm">Introduction and Core Principles</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Section 2</Badge>
                          <span className="text-sm">Practical Applications and Examples</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Section 3</Badge>
                          <span className="text-sm">Industry Best Practices and Compliance</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Section 4</Badge>
                          <span className="text-sm">Case Studies and Real-World Scenarios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      ⏱️ Study Tip
                    </h4>
                    <p className="text-amber-700 text-sm">
                      Take your time to review this material thoroughly. Consider taking notes on key concepts as you read, and don't hesitate to revisit sections that seem challenging.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleComplete} className="flex-1">
                    Mark as Read
                  </Button>
                  <Button variant="outline" onClick={() => setProgress(75)} className="px-6">
                    Bookmark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "assignment":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Assignment: {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200 mb-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">📋 Assignment Overview</h3>
                    <p className="text-orange-700">
                      Apply your knowledge of {lesson.title.toLowerCase()} by analyzing a real-world scenario and providing professional recommendations.
                    </p>
                  </div>
                  
                  {content.scenario ? (
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">🏢 Client Scenario: {content.scenario.title}</h4>
                      <p className="text-slate-700 mb-4">{content.scenario.description}</p>
                      
                      <div className="bg-white p-4 rounded-lg border border-slate-300">
                        <h5 className="font-semibold text-slate-800 mb-3">Client Details:</h5>
                        <div className="grid md:grid-cols-2 gap-3">
                          {content.scenario.details.map((detail, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-slate-600">
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {index + 1}
                              </Badge>
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">🏢 Case Study Scenario</h4>
                      <p className="text-slate-700 mb-4">
                        You are working with a client who needs assistance with {lesson.title.toLowerCase()}. Review the following case and provide your professional analysis.
                      </p>
                      
                      <div className="bg-white p-4 rounded-lg border border-slate-300">
                        <h5 className="font-semibold text-slate-800 mb-3">Client Profile:</h5>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li>• Established business, 5+ years of operation</li>
                          <li>• Strong financial performance and growth trajectory</li>
                          <li>• Seeking financing solution for business expansion</li>
                          <li>• Current debt structure and cash flow position stable</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">✅ Your Assignment Tasks</h4>
                    <ol className="space-y-2 text-blue-700">
                      <li className="flex items-start gap-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-1">1</Badge>
                        Analyze the client's current financial position and needs
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-1">2</Badge>
                        Identify the most appropriate financing options
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-1">3</Badge>
                        Provide specific recommendations with rationale
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-1">4</Badge>
                        Address potential risks and mitigation strategies
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      🎯 Success Criteria
                    </h4>
                    <p className="text-green-700 text-sm">
                      Your assignment will be evaluated on analytical depth, practical recommendations, and demonstration of course concepts. Aim for a comprehensive yet concise analysis.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleComplete} className="flex-1">
                    Submit Analysis
                  </Button>
                  <Button variant="outline" onClick={() => setProgress(25)} className="px-6">
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "quiz":
        return (
          <EnhancedQuiz
            moduleId="equipment-financing"
            questions={[
              {
                id: "1",
                type: "multiple-choice" as const,
                question: "What is the typical loan-to-value ratio for equipment financing?",
                options: ["60-70%", "70-80%", "80-90%", "90-100%"],
                correctAnswers: ["80-90%"],
                explanation: "Equipment financing typically offers 80-90% LTV because the equipment serves as collateral.",
                points: 10,
                difficulty: "medium" as const
              },
              {
                id: "2",
                type: "multiple-choice" as const,
                question: "Which factor is most important when evaluating equipment financing applications?",
                options: ["Personal credit score", "Equipment value", "Business cash flow", "Down payment amount"],
                correctAnswers: ["Business cash flow"],
                explanation: "Cash flow is critical as it demonstrates the business's ability to service the debt.",
                points: 10,
                difficulty: "medium" as const
              }
            ]}
            onComplete={(passed, score) => {
              toast({
                title: score >= 80 ? "🎉 Quiz Passed!" : "📚 Review Needed",
                description: `You scored ${score}%${score >= 80 ? " - Great job!" : " - Please review the material"}`,
                variant: score >= 80 ? "default" : "destructive",
              });
              if (score >= 80) {
                handleComplete();
              }
            }}
            moduleTitle={moduleTitle}
            passingScore={80}
          />
        );
      
      case "interactive":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">🤖 Adaptive Interactive Learning</h3>
              <p className="text-sm text-blue-700">
                This lesson features AI-powered adaptive content that adjusts to your learning pace and style.
              </p>
            </div>
            <InteractiveLessonComponents />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p>Lesson content will be available soon.</p>
            <Button onClick={handleComplete} className="mt-4">
              Mark as Complete
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(lesson.type)}
            <div>
              <DialogTitle className="text-lg">{lesson.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{moduleTitle} • {lesson.duration}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {lesson.completed && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>

          {renderLessonContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
