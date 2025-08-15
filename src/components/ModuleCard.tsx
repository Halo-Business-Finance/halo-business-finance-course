import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, PlayCircle, Lock } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: "locked" | "available" | "in-progress" | "completed";
  onStart: () => void;
}

const ModuleCard = ({ 
  title, 
  description, 
  duration, 
  lessons, 
  progress, 
  status, 
  onStart 
}: ModuleCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "in-progress":
        return <PlayCircle className="h-5 w-5 text-primary" />;
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <PlayCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = () => {
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

  const isDisabled = status === "locked";

  return (
    <Card className={`group hover:shadow-elevated transition-all duration-300 ${
      isDisabled ? "opacity-60" : "hover:-translate-y-1"
    }`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {duration}
                </div>
                <span>{lessons} lessons</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "in-progress" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button 
          variant={status === "completed" ? "success" : "course"}
          className="w-full"
          disabled={isDisabled}
          onClick={onStart}
        >
          {status === "completed" 
            ? "Review Module" 
            : status === "in-progress" 
            ? "Continue Learning" 
            : "Start Module"
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;