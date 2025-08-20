import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Building, Users, CheckCircle } from "lucide-react";
import { LoanExample } from "@/data/courseData";

interface LoanExamplesProps {
  examples: LoanExample[];
  moduleTitle: string;
}

export const LoanExamples = ({ examples, moduleTitle }: LoanExamplesProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Real-World Loan Examples for {moduleTitle}
        </h3>
      </div>
      
      <div className="grid gap-6">
        {examples.map((example, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-foreground">
                    {example.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {example.loanAmount}
                    </Badge>
                    <Badge variant="outline">
                      {example.loanType}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Scenario */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Business Scenario
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {example.scenario}
                </p>
              </div>
              
              <Separator />
              
              {/* Borrower Profile */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Borrower Profile
                </h4>
                <p className="text-sm text-muted-foreground">
                  {example.borrowerProfile}
                </p>
              </div>
              
              <Separator />
              
              {/* Key Learning Points */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Key Learning Points
                </h4>
                <ul className="space-y-2">
                  {example.keyLearningPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {examples.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-md border">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> These examples are designed to reinforce the concepts taught in {moduleTitle}. 
            Each scenario reflects real-world situations you may encounter in business finance and lending.
          </p>
        </div>
      )}
    </div>
  );
};