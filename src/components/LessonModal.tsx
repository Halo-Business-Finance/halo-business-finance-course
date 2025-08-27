
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EnhancedQuiz } from "@/components/EnhancedQuiz";
import { CheckCircle, Play, FileText, BookOpen, Users2, X } from "lucide-react";
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

  const renderLessonContent = () => {
    switch (lesson.type) {
      case "video":
        return (
          <div className="space-y-4">
            <VideoPlayer
              videoType="file"
              videoUrl="https://example.com/sample-video.mp4"
              title={lesson.title}
              onProgress={(progressPercent) => setProgress(progressPercent)}
              onComplete={handleComplete}
            />
            <div className="text-sm text-muted-foreground">
              <p>Watch this video to learn about the key concepts in {moduleTitle.toLowerCase()}.</p>
            </div>
          </div>
        );
      
      case "reading":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reading Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p>This reading material covers the fundamental concepts you need to understand for {moduleTitle}.</p>
                  <h3>Key Learning Points:</h3>
                  <ul>
                    <li>Understanding the basic principles</li>
                    <li>Practical applications</li>
                    <li>Common challenges and solutions</li>
                    <li>Best practices in the industry</li>
                  </ul>
                  <p>Take your time to review this material thoroughly before proceeding to the next lesson.</p>
                </div>
                <Button onClick={handleComplete} className="w-full">
                  Mark as Read
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      
      case "assignment":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Study Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p><strong>Scenario:</strong> You are working with a client who needs financing for new equipment. Review the following case and provide your analysis.</p>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4>Client Profile:</h4>
                    <ul>
                      <li>Manufacturing company, 5 years in business</li>
                      <li>Annual revenue: $2.5M</li>
                      <li>Equipment needed: $500K production line</li>
                      <li>Current debt-to-equity ratio: 0.6</li>
                    </ul>
                  </div>
                  
                  <p><strong>Your Task:</strong> Analyze this client's financing needs and recommend the best approach.</p>
                </div>
                <Button onClick={handleComplete} className="w-full">
                  Submit Analysis
                </Button>
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
