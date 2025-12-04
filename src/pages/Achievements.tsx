import { SEOHead } from '@/components/SEOHead';
import { HorizontalNav } from '@/components/HorizontalNav';
import { FinPilotBrandFooter } from '@/components/FinPilotBrandFooter';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { LearningAnalyticsDashboard } from '@/components/analytics/LearningAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, BarChart3 } from 'lucide-react';

export default function Achievements() {
  return (
    <>
      <SEOHead
        title="Achievements & Analytics | FinPilot LMS"
        description="Track your learning achievements, earn badges, and view your progress analytics on the FinPilot commercial lending training platform."
        keywords="achievements, badges, learning analytics, progress tracking, gamification"
      />
      
      <div className="min-h-screen bg-background">
        <HorizontalNav />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements">
              <GamificationDashboard />
            </TabsContent>
            
            <TabsContent value="analytics">
              <LearningAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </main>
        
        <FinPilotBrandFooter />
      </div>
    </>
  );
}
