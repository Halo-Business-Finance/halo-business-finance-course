import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnhancedLearning } from "@/hooks/useEnhancedLearning";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Clock, 
  Trophy, 
  Flame,
  TrendingUp,
  Brain,
  Timer,
  CheckCircle,
  Star,
  Calendar,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  type: 'modules' | 'time' | 'streak' | 'score';
}

export const EnhancedProgressTracking = () => {
  const { metrics, recommendations, currentSession, loading } = useEnhancedLearning();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [personalGoals, setPersonalGoals] = useState<ProgressGoal[]>([]);

  useEffect(() => {
    // Initialize personal goals based on current metrics
    if (metrics && personalGoals.length === 0) {
      const goals: ProgressGoal[] = [
        {
          id: '1',
          title: 'Complete 3 modules this month',
          target: 3,
          current: Math.floor(metrics.learningVelocity * 4),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'modules'
        },
        {
          id: '2',
          title: 'Maintain 7-day learning streak',
          target: 7,
          current: metrics.currentStreak,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'streak'
        },
        {
          id: '3',
          title: 'Study 10 hours this month',
          target: 10,
          current: metrics.totalTime / 60,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'time'
        }
      ];
      setPersonalGoals(goals);
    }
  }, [metrics, personalGoals.length]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  if (!metrics) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-orange-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Real-time Session Indicator */}
      <AnimatePresence>
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Learning Session Active</p>
                  <p className="text-sm text-blue-700">
                    {currentSession.activityType} • Started {currentSession.startTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className={`text-2xl font-bold ${getProgressColor(metrics.overallProgress)}`}>
                  {Math.round(metrics.overallProgress)}%
                </p>
                <Progress value={metrics.overallProgress} className="mt-2" />
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Streak</p>
                <p className={`text-2xl font-bold ${getStreakColor(metrics.currentStreak)}`}>
                  {metrics.currentStreak} days
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 mr-1" />
                  {metrics.currentStreak >= 7 ? 'On fire!' : 'Keep going!'}
                </div>
              </div>
              <Flame className={`h-8 w-8 ${getStreakColor(metrics.currentStreak)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.totalTime / 60)}h {metrics.totalTime % 60}m
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {metrics.learningVelocity.toFixed(1)} modules/week
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className={`text-2xl font-bold ${getProgressColor(metrics.averageScore)}`}>
                  {Math.round(metrics.averageScore)}%
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Trophy className="h-3 w-3 mr-1" />
                  {metrics.modulesMastered} mastered
                </div>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Personal Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalGoals.map((goal) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              const isCompleted = goal.current >= goal.target;
              
              return (
                <motion.div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-primary/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{goal.current} / {goal.target}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {goal.deadline}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Velocity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Learning Velocity & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Progress Prediction</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Velocity:</span>
                  <Badge variant="outline">{metrics.learningVelocity.toFixed(1)} modules/week</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Completion:</span>
                  <Badge>{metrics.predictedCompletion}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion Rate:</span>
                  <Badge variant="outline">{metrics.completionRate.toFixed(1)}%</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Set Learning Goals
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Study Time
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' 
                      ? 'border-red-500 bg-red-50' 
                      : rec.priority === 'medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.priority} priority
                        </Badge>
                        {rec.estimatedTime > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {rec.estimatedTime}min
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Reason: {rec.reason}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};