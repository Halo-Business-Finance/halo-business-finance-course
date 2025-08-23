import { Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveLearningStats } from "@/components/LiveLearningStats";

const LearningStatsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Learning Stats</h1>
      </div>

      {/* Live Learning Stats Component */}
      <LiveLearningStats />

      {/* Learning Goals Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals
          </CardTitle>
          <CardDescription>
            Track your progress toward learning objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Complete SBA Loan Programs</h3>
                <span className="text-sm text-muted-foreground">65% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[65%]"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Target: End of this month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Earn 3 Professional Certificates</h3>
                <span className="text-sm text-muted-foreground">2 of 3 Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full w-[67%]"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Target: End of next month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningStatsPage;