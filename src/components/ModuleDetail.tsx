import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Video, Users2, CheckCircle } from "lucide-react";
import { Module } from "@/data/courseData";
import { LoanExamples } from "@/components/LoanExamples";
import { useNavigate } from "react-router-dom";

interface ModuleDetailProps {
  module: Module;
  onClose: () => void;
}

const ModuleDetail = ({ module, onClose }: ModuleDetailProps) => {
  const navigate = useNavigate();

  const handleContinueLearning = () => {
    navigate(`/module/${module.id}`);
    onClose(); // Close the popup after navigation
  };
  
  const lessons = [
    {
      title: "Introduction & Overview",
      type: "video",
      duration: "15 min",
      completed: module.status === "completed" || module.progress > 0
    },
    {
      title: "Core Concepts",
      type: "reading",
      duration: "20 min", 
      completed: module.status === "completed" || module.progress > 25
    },
    {
      title: "Case Study Analysis",
      type: "assignment",
      duration: "30 min",
      completed: module.status === "completed" || module.progress > 50
    },
    {
      title: "Interactive Quiz",
      type: "quiz",
      duration: "10 min",
      completed: module.status === "completed" || module.progress > 75
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "reading": return <FileText className="h-4 w-4" />;
      case "assignment": return <BookOpen className="h-4 w-4" />;
      case "quiz": return <Users2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-[95vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl break-words">{module.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                <span>{module.duration}</span>
                <span>{module.lessons} lessons</span>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="self-start sm:self-auto">×</Button>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">{module.description}</p>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
                <TabsTrigger value="structure" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Course Structure</span>
                  <span className="sm:hidden">Structure</span>
                </TabsTrigger>
                <TabsTrigger value="examples" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Loan Examples</span>
                  <span className="sm:hidden">Examples</span>
                </TabsTrigger>
                <TabsTrigger value="cases" className="text-xs sm:text-sm px-2 py-2">Cases</TabsTrigger>
                <TabsTrigger value="scripts" className="text-xs sm:text-sm px-2 py-2">Scripts</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Learning Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs break-words">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="structure" className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Course Structure</h4>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        lesson.completed ? "bg-accent/10" : "bg-muted/20"
                      }`}
                    >
                      <div className={`flex-shrink-0 ${lesson.completed ? "text-accent" : "text-muted-foreground"}`}>
                        {lesson.completed ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          getTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-words">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                      </div>
                      {lesson.completed && (
                        <Badge variant="success" className="text-xs flex-shrink-0">
                          Complete
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="mt-6">
              <LoanExamples 
                examples={module.loanExamples} 
                moduleTitle={module.title}
              />
            </TabsContent>
            
            <TabsContent value="cases" className="mt-6">
              <div className="space-y-6">
                <h4 className="font-semibold">Case Studies</h4>
                {module.caseStudies?.map((caseStudy, index) => (
                  <Card key={index} className="p-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
                      <div className="text-sm text-muted-foreground font-medium">{caseStudy.company}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Situation</h5>
                        <p className="text-sm text-muted-foreground">{caseStudy.situation}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Challenge</h5>
                        <p className="text-sm text-muted-foreground">{caseStudy.challenge}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Solution</h5>
                        <p className="text-sm text-muted-foreground">{caseStudy.solution}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Outcome</h5>
                        <p className="text-sm text-muted-foreground">{caseStudy.outcome}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Key Lessons Learned</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {caseStudy.lessonsLearned.map((lesson, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{lesson}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )) || <p className="text-muted-foreground">No case studies available for this module.</p>}
              </div>
            </TabsContent>
            
            <TabsContent value="scripts" className="mt-6">
              <div className="space-y-6">
                <h4 className="font-semibold">Training Scripts</h4>
                {module.scripts?.map((script, index) => (
                  <Card key={index} className="p-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{script.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{script.scenario}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-3">Dialogue</h5>
                        <div className="space-y-3 bg-muted/20 p-4 rounded-lg">
                          {script.dialogues.map((dialogue, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="font-medium text-sm text-primary">{dialogue.speaker}:</div>
                              <div className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                                "{dialogue.text}"
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Key Training Points</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {script.keyPoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )) || <p className="text-muted-foreground">No training scripts available for this module.</p>}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t">
            <Button 
              className="w-full text-sm sm:text-base" 
              variant={module.status === "completed" ? "success" : "default"}
              onClick={handleContinueLearning}
            >
              {module.status === "completed" 
                ? "Review Module" 
                : module.status === "in-progress" 
                ? "Continue Learning" 
                : "Start Module"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleDetail;