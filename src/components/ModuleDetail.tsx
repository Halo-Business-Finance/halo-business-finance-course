import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Video, Users2, CheckCircle } from "lucide-react";
import { Module } from "@/data/courseData";
import { LoanExamples } from "@/components/LoanExamples";

interface ModuleDetailProps {
  module: Module;
  onClose: () => void;
}

const ModuleDetail = ({ module, onClose }: ModuleDetailProps) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{module.duration}</span>
                <span>{module.lessons} lessons</span>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          <p className="text-muted-foreground">{module.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structure">Course Structure</TabsTrigger>
              <TabsTrigger value="examples">Loan Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold mb-3">Learning Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="structure" className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold mb-3">Course Structure</h4>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        lesson.completed ? "bg-accent/10" : "bg-muted/20"
                      }`}
                    >
                      <div className={`${lesson.completed ? "text-accent" : "text-muted-foreground"}`}>
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          getTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                      </div>
                      {lesson.completed && (
                        <Badge variant="success" className="text-xs">
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
          </Tabs>

          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              variant={module.status === "completed" ? "success" : "default"}
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