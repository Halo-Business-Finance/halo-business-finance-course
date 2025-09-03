import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  Brain,
  Lightbulb,
  CheckCircle,
  Timer
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface LearningAnalytics {
  user_id: string;
  module_id: string;
  time_spent_minutes: number;
  completion_rate: number;
  quiz_attempts: number;
  avg_score: number;
  last_accessed: string;
  difficulty_level: string;
  learning_path: string;
}

interface LearningInsight {
  type: 'strength' | 'improvement' | 'recommendation';
  title: string;
  description: string;
  action?: string;
  score?: number;
}

export const LearningAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<LearningAnalytics[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      // Load module completion data
      const { data: moduleData, error: moduleError } = await supabase
        .from('module_completions')
        .select(`
          *,
          course_modules(title, difficulty:skill_level)
        `)
        .eq('user_id', user.id);

      if (moduleError) throw moduleError;

      // Load assessment data
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (assessmentError) throw assessmentError;

      // Process and combine data
      const processedAnalytics = processAnalyticsData(moduleData || [], assessmentData || []);
      setAnalytics(processedAnalytics);
      
      // Generate insights
      const generatedInsights = generateLearningInsights(processedAnalytics, moduleData || [], assessmentData || []);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (moduleData: any[], assessmentData: any[]) => {
    const moduleMap = new Map();
    
    // Process module completions
    moduleData.forEach(module => {
      moduleMap.set(module.module_id, {
        user_id: module.user_id,
        module_id: module.module_id,
        time_spent_minutes: module.time_spent_minutes || 0,
        completion_rate: 100, // Completed modules are 100%
        quiz_attempts: 0,
        avg_score: 0,
        last_accessed: module.created_at,
        difficulty_level: module.course_modules?.difficulty || 'beginner',
        learning_path: 'core'
      });
    });

    // Process assessment attempts
    assessmentData.forEach(attempt => {
      const existing = moduleMap.get(attempt.assessment_id) || {
        user_id: attempt.user_id,
        module_id: attempt.assessment_id,
        time_spent_minutes: 0,
        completion_rate: 50,
        quiz_attempts: 0,
        avg_score: 0,
        last_accessed: attempt.created_at,
        difficulty_level: 'beginner',
        learning_path: 'assessment'
      };

      existing.quiz_attempts += 1;
      existing.avg_score = ((existing.avg_score * (existing.quiz_attempts - 1)) + attempt.score) / existing.quiz_attempts;
      existing.time_spent_minutes += attempt.time_taken_minutes || 0;
      
      moduleMap.set(attempt.assessment_id, existing);
    });

    return Array.from(moduleMap.values());
  };

  const generateLearningInsights = (analytics: LearningAnalytics[], moduleData: any[], assessmentData: any[]): LearningInsight[] => {
    const insights: LearningInsight[] = [];

    // Completion rate insight
    const completionRate = (moduleData.length / 8) * 100; // Assuming 8 total modules
    if (completionRate >= 80) {
      insights.push({
        type: 'strength',
        title: 'Excellent Progress',
        description: `You've completed ${completionRate.toFixed(0)}% of available modules. Keep up the great work!`,
        score: completionRate
      });
    } else if (completionRate < 30) {
      insights.push({
        type: 'improvement',
        title: 'Increase Learning Pace',
        description: 'Consider setting aside more time for learning to accelerate your progress.',
        action: 'Set a daily learning goal'
      });
    }

    // Assessment performance insight
    const avgAssessmentScore = assessmentData.reduce((sum, attempt) => sum + attempt.score, 0) / assessmentData.length;
    if (avgAssessmentScore >= 85) {
      insights.push({
        type: 'strength',
        title: 'Strong Assessment Performance',
        description: `Your average quiz score is ${avgAssessmentScore.toFixed(0)}%. Excellent understanding!`,
        score: avgAssessmentScore
      });
    } else if (avgAssessmentScore < 70) {
      insights.push({
        type: 'improvement',
        title: 'Review Core Concepts',
        description: 'Consider revisiting module content before taking assessments.',
        action: 'Use study notes and video reviews'
      });
    }

    // Learning time insight
    const totalTime = analytics.reduce((sum, item) => sum + item.time_spent_minutes, 0);
    if (totalTime < 60) {
      insights.push({
        type: 'recommendation',
        title: 'Dedicate More Study Time',
        description: 'Research shows 2-3 hours per week optimizes learning retention.',
        action: 'Schedule regular study sessions'
      });
    }

    // Difficulty progression insight
    const hasExpertModules = analytics.some(item => item.difficulty_level === 'expert');
    if (!hasExpertModules && completionRate > 60) {
      insights.push({
        type: 'recommendation',
        title: 'Ready for Expert Content',
        description: 'Your progress suggests you\'re ready to tackle more challenging modules.',
        action: 'Explore advanced finance topics'
      });
    }

    return insights;
  };

  const getProgressData = () => {
    return analytics.map((item, index) => ({
      module: `Module ${index + 1}`,
      completion: item.completion_rate,
      time: item.time_spent_minutes,
      score: item.avg_score
    }));
  };

  const getDifficultyData = () => {
    const difficulties = analytics.reduce((acc, item) => {
      acc[item.difficulty_level] = (acc[item.difficulty_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(difficulties).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Efficiency</p>
                <p className="text-2xl font-bold">
                  {analytics.length > 0 
                    ? Math.round(analytics.reduce((sum, item) => sum + item.avg_score, 0) / analytics.length)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(analytics.reduce((sum, item) => sum + item.time_spent_minutes, 0) / 60)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
                <p className="text-2xl font-bold">{analytics.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'strength' 
                    ? 'bg-green-50 border-green-500' 
                    : insight.type === 'improvement'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'strength' && <Award className="h-5 w-5 text-green-600 mt-0.5" />}
                  {insight.type === 'improvement' && <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {insight.type === 'recommendation' && <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    {insight.action && (
                      <Badge variant="outline" className="mt-2">
                        {insight.action}
                      </Badge>
                    )}
                  </div>
                  {insight.score && (
                    <div className="text-right">
                      <span className="text-lg font-bold">{Math.round(insight.score)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress Timeline</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="difficulty">Difficulty Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty">
          <Card>
            <CardHeader>
              <CardTitle>Module Difficulty Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDifficultyData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getDifficultyData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};