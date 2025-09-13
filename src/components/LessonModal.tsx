
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, X, StickyNote, ArrowLeft, ArrowRight } from "lucide-react";
import { useNotes } from "@/contexts/NotesContext";
import { useToast } from "@/hooks/use-toast";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { LessonOverview } from "@/components/lessons/LessonOverview";
import { EnhancedVideoSection } from "@/components/lessons/EnhancedVideoSection";
import { CorporateContentDisplay } from "@/components/lessons/CorporateContentDisplay";
import { ProfessionalAssessment } from "@/components/lessons/ProfessionalAssessment";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: string;
    completed: boolean;
  };
  moduleTitle: string;
  moduleId?: string;
}

export const LessonModal = ({ isOpen, onClose, lesson, moduleTitle, moduleId }: LessonModalProps) => {
  const { toast } = useToast();
  const { setIsNotesModalOpen, setCurrentContext, getNotesByLesson } = useNotes();
  const { 
    currentStep, 
    steps, 
    loading, 
    completeStep, 
    goToStep, 
    completeLesson,
    getProgressStats 
  } = useLessonProgress(lesson.id, moduleId || 'default');
  
  const [activeTab, setActiveTab] = useState("overview");

  // Get lesson-specific notes count
  const lessonNotesCount = moduleId ? getNotesByLesson(moduleId, lesson.id).length : 0;
  const progressStats = getProgressStats();

  // Set tab based on current step
  useEffect(() => {
    const stepNames = ['overview', 'video', 'content', 'assessment', 'summary'];
    if (currentStep < stepNames.length) {
      setActiveTab(stepNames[currentStep]);
    }
  }, [currentStep]);

  const handleTakeNotes = () => {
    if (moduleId) {
      setCurrentContext(moduleId, lesson.id);
      setIsNotesModalOpen(true);
    }
  };

  const handleComplete = async () => {
    const success = await completeLesson();
    if (success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleStepComplete = (stepName: string) => {
    const stepIndex = steps.findIndex(step => step.type === stepName);
    if (stepIndex !== -1) {
      completeStep(stepIndex);
    }
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    const stepIndex = steps.findIndex(step => step.type === tabValue);
    if (stepIndex !== -1) {
      goToStep(stepIndex);
    }
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const content = getTopicSpecificContent(lesson.title, lesson.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto jp-card-elegant">
        {/* Professional Header */}
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="jp-heading text-2xl text-navy-900">
                {lesson.title}
              </DialogTitle>
              <p className="jp-subheading">{moduleTitle} • {lesson.duration}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="jp-hover-scale">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Enhanced Progress Section */}
        <div className="space-y-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="jp-subheading">Learning Progress</span>
                <span className="jp-body font-semibold text-primary">{progressStats.completionPercentage}%</span>
              </div>
              <Progress value={progressStats.completionPercentage} className="h-3" />
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {progressStats.isCompleted ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="border-primary text-primary">
                  In Progress
                </Badge>
              )}
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => goToStep(index)}
                >
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-8 mx-1 ${
                    step.completed ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Lesson Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 jp-card">
              <TabsTrigger value="overview" className="jp-body text-sm">Overview</TabsTrigger>
              <TabsTrigger value="video" className="jp-body text-sm">Video</TabsTrigger>
              <TabsTrigger value="content" className="jp-body text-sm">Content</TabsTrigger>
              <TabsTrigger value="assessment" className="jp-body text-sm">Assessment</TabsTrigger>
              <TabsTrigger value="summary" className="jp-body text-sm">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <LessonOverview lesson={lesson} moduleTitle={moduleTitle} content={content} />
              <div className="flex justify-end">
                <Button onClick={() => handleStepComplete('overview')} className="jp-button-primary">
                  Continue to Video
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <EnhancedVideoSection 
                lesson={lesson} 
                moduleTitle={moduleTitle}
                onNotesTake={handleTakeNotes}
                notesCount={lessonNotesCount}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('overview')} className="jp-button-secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
                <Button onClick={() => handleStepComplete('video')} className="jp-button-primary">
                  Continue to Content
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <CorporateContentDisplay lesson={lesson} content={content} />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('video')} className="jp-button-secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Video
                </Button>
                <Button onClick={() => handleStepComplete('content')} className="jp-button-primary">
                  Take Assessment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <ProfessionalAssessment
                lesson={lesson}
                onComplete={(passed, score) => {
                  if (passed) {
                    handleStepComplete('assessment');
                    setActiveTab('summary');
                  }
                }}
                passingScore={80}
              />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="jp-card-elegant p-6 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                <div>
                  <h3 className="jp-heading text-2xl text-navy-900">Lesson Complete!</h3>
                  <p className="jp-subheading mt-2">
                    You've successfully completed all components of this professional learning module.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="jp-card p-4">
                    <p className="jp-caption">Time Invested</p>
                    <p className="jp-heading text-primary">{Math.round(progressStats.totalTimeSpent / 60)} min</p>
                  </div>
                  <div className="jp-card p-4">
                    <p className="jp-caption">Steps Completed</p>
                    <p className="jp-heading text-primary">{progressStats.completedSteps}/{progressStats.totalSteps}</p>
                  </div>
                  <div className="jp-card p-4">
                    <p className="jp-caption">Notes Taken</p>
                    <p className="jp-heading text-primary">{lessonNotesCount}</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-center mt-6">
                  <Button onClick={handleTakeNotes} variant="outline" className="jp-button-secondary">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Review Notes {lessonNotesCount > 0 && `(${lessonNotesCount})`}
                  </Button>
                  <Button onClick={handleComplete} className="jp-button-primary px-8">
                    Complete Lesson
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
