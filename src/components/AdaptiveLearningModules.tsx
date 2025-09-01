import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdaptiveLearning } from "@/hooks/useAdaptiveLearning";
import { 
  Brain, 
  Target, 
  Zap, 
  Users, 
  Trophy, 
  BookOpen,
  Play,
  CheckCircle,
  Lock,
  Clock,
  TrendingUp,
  Lightbulb,
  Puzzle,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

interface AdaptiveLearningModulesProps {
  courseId?: string;
}

export const AdaptiveLearningModules = ({ courseId = 'halo-launch-pad-learn' }: AdaptiveLearningModulesProps) => {
  const {
    adaptiveModules,
    currentModule,
    loading,
    startAdaptiveModule,
    getPersonalizedRecommendations
  } = useAdaptiveLearning(courseId);
  
  const [selectedTab, setSelectedTab] = useState('modules');

  const getModuleIcon = (moduleKey: string) => {
    const icons = {
      foundations_assessment: <Target className="h-6 w-6" />,
      core_concepts: <Brain className="h-6 w-6" />,
      practical_application: <Puzzle className="h-6 w-6" />,
      advanced_techniques: <TrendingUp className="h-6 w-6" />,
      interactive_simulations: <Zap className="h-6 w-6" />,
      collaborative_projects: <Users className="h-6 w-6" />,
      mastery_certification: <Award className="h-6 w-6" />
    };
    return icons[moduleKey] || <BookOpen className="h-6 w-6" />;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      case 'adaptive': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (instance: any) => {
    if (instance.completion_status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    if (instance.completion_status === 'in_progress') {
      return <Play className="h-5 w-5 text-primary" />;
    }
    if (instance.completion_status === 'locked') {
      return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
    return <Play className="h-5 w-5 text-primary" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (adaptiveModules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Adaptive Modules Available</h3>
          <p className="text-muted-foreground">
            Adaptive learning modules will be initialized when you enroll in a course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Adaptive Learning Journey
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your personalized learning path that adapts to your performance, learning style, and career goals. 
          Each module intelligently adjusts difficulty and content based on your progress.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="progress">Progress Overview</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {adaptiveModules.map((instance, index) => {
              const module = instance.adaptive_module;
              const recommendations = getPersonalizedRecommendations(instance);
              
              return (
                <motion.div
                  key={instance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`transition-all hover:shadow-lg cursor-pointer ${
                    currentModule?.id === instance.id ? 'ring-2 ring-primary border-primary' : ''
                  } ${
                    instance.completion_status === 'completed' ? 'bg-green-50 border-green-200' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getModuleIcon(module.module_key)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <Badge className={getDifficultyColor(instance.current_difficulty_level)}>
                              {instance.current_difficulty_level}
                            </Badge>
                          </div>
                        </div>
                        {getStatusIcon(instance)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{instance.progress_percentage}%</span>
                        </div>
                        <Progress value={instance.progress_percentage} className="h-2" />
                      </div>

                      {/* Module Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{module.base_duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{module.learning_objectives.length} objectives</span>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      {recommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">AI Recommendation</span>
                          </div>
                          <p className="text-xs text-blue-700">
                            {recommendations[0].description}
                          </p>
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1">
                        {module.skills_taught.slice(0, 3).map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {module.skills_taught.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{module.skills_taught.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        onClick={() => startAdaptiveModule(module.module_key)}
                        disabled={instance.completion_status === 'locked'}
                      >
                        {instance.completion_status === 'completed' ? 'Review Module' :
                         instance.completion_status === 'in_progress' ? 'Continue Learning' :
                         instance.completion_status === 'locked' ? 'Locked' : 'Start Module'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {adaptiveModules.filter(m => m.completion_status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Modules Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round(adaptiveModules.reduce((sum, m) => sum + m.progress_percentage, 0) / adaptiveModules.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round(adaptiveModules.reduce((sum, m) => sum + (m.time_spent_minutes || 0), 0) / 60)}h
                </div>
                <div className="text-sm text-muted-foreground">Time Invested</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {adaptiveModules.filter(m => m.current_difficulty_level === 'advanced').length}
                </div>
                <div className="text-sm text-muted-foreground">Advanced Level</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adaptiveModules.map((instance, index) => (
                  <div key={instance.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      instance.completion_status === 'completed' ? 'bg-green-100 text-green-600' :
                      instance.completion_status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{instance.adaptive_module.title}</span>
                        <Badge className={getDifficultyColor(instance.current_difficulty_level)}>
                          {instance.current_difficulty_level}
                        </Badge>
                      </div>
                      <Progress value={instance.progress_percentage} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adaptiveModules.map((instance) => {
              const recommendations = getPersonalizedRecommendations(instance);
              
              if (recommendations.length === 0) return null;
              
              return (
                <Card key={instance.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getModuleIcon(instance.adaptive_module.module_key)}
                      {instance.adaptive_module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className={`h-4 w-4 ${
                            rec.priority === 'high' ? 'text-red-600' :
                            rec.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <span className="font-medium text-sm">{rec.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};