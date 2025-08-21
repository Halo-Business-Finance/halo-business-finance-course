import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users, GraduationCap } from "lucide-react";

interface LearningObjectivesProps {
  objectives: string[];
}

const LearningObjectives = ({ objectives }: LearningObjectivesProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Learning Objectives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Upon completion of this certification program, you will be able to:
        </p>
        <ul className="space-y-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-sm">{objective}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default LearningObjectives;