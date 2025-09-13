import { CheckCircle, Clock, BarChart3, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LessonOverviewProps {
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: string;
  };
  moduleTitle: string;
  content: {
    description: string;
    objectives: string[];
    keyPoints: string[];
    scenario?: {
      title: string;
      description: string;
      details: string[];
    };
  };
}

export const LessonOverview = ({ lesson, moduleTitle, content }: LessonOverviewProps) => {
  const getDifficultyLevel = (type: string) => {
    switch (type) {
      case "quiz": return "Advanced";
      case "interactive": return "Intermediate";
      default: return "Beginner";
    }
  };

  const getSkillLevel = (title: string) => {
    if (title.toLowerCase().includes("advanced") || title.toLowerCase().includes("expert")) {
      return "Expert";
    }
    if (title.toLowerCase().includes("intermediate") || title.toLowerCase().includes("professional")) {
      return "Professional";
    }
    return "Foundation";
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <Card className="jp-card-elegant">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="jp-heading text-2xl text-navy-900">
                {lesson.title}
              </CardTitle>
              <p className="jp-subheading text-lg">{moduleTitle}</p>
            </div>
            <Badge className="bg-gradient-primary text-primary-foreground px-3 py-1">
              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} Lesson
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="jp-body text-base leading-relaxed text-muted-foreground">
            {content.description}
          </p>
          
          {/* Professional Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="jp-caption">Duration</p>
                <p className="font-medium text-foreground">{lesson.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <div>
                <p className="jp-caption">Difficulty</p>
                <p className="font-medium text-foreground">{getDifficultyLevel(lesson.type)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="jp-caption">Skill Level</p>
                <p className="font-medium text-foreground">{getSkillLevel(lesson.title)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="jp-caption">Format</p>
                <p className="font-medium text-foreground">Self-Paced</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card className="jp-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="jp-heading text-navy-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Learning Outcomes & Business Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="jp-subheading mb-3">Learning Objectives</h4>
              <ul className="space-y-3">
                {content.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <span className="jp-body text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="jp-subheading mb-3">Key Business Applications</h4>
              <ul className="space-y-3">
                {content.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="jp-body text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Context (if scenario exists) */}
      {content.scenario && (
        <Card className="jp-card bg-gradient-to-r from-navy-900/5 to-primary/5">
          <CardHeader>
            <CardTitle className="jp-heading text-navy-900">
              Industry Application: {content.scenario.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="jp-body mb-4">{content.scenario.description}</p>
            
            <div className="bg-card rounded-lg p-4 border">
              <h5 className="jp-subheading mb-3">Scenario Details</h5>
              <div className="grid gap-2">
                {content.scenario.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="jp-caption">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Prerequisites */}
      <Card className="jp-card">
        <CardHeader>
          <CardTitle className="jp-heading text-navy-900">Prerequisites & Preparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h5 className="jp-subheading mb-2">Knowledge Base</h5>
              <p className="jp-caption">Basic understanding of commercial lending principles</p>
            </div>
            <div>
              <h5 className="jp-subheading mb-2">Materials Needed</h5>
              <p className="jp-caption">Notebook for case study analysis and calculations</p>
            </div>
            <div>
              <h5 className="jp-subheading mb-2">Time Commitment</h5>
              <p className="jp-caption">Allow additional time for note-taking and reflection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};