import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
  Trophy,
  Star,
  Zap,
  Brain,
  Users,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

interface LearningPathModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'expert';
  prerequisites: string[];
  estimatedTime: number;
  topics: string[];
  learningObjectives: string[];
  isCompleted: boolean;
  isUnlocked: boolean;
  progress: number;
  moduleType: 'core' | 'elective' | 'bonus';
  skills: string[];
  assessmentCount: number;
  videoCount: number;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: LearningPathModule[];
  totalDuration: string;
  difficulty: 'beginner' | 'expert';
  completionRate: number;
  estimatedCompletion: string;
}

export const InteractiveLearningPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('finance-fundamentals');
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadLearningPaths();
      loadUserProgress();
    }
  }, [user?.id]);

  const loadLearningPaths = async () => {
    // For demo purposes, using static data. In real implementation, this would come from the database
    const paths: LearningPath[] = [
      {
        id: 'finance-fundamentals',
        name: 'Finance Fundamentals',
        description: 'Master the core principles of business finance and commercial lending',
        difficulty: 'beginner',
        totalDuration: '12-15 hours',
        completionRate: 0,
        estimatedCompletion: '2-3 weeks',
        modules: [
          {
            id: 'foundations',
            title: 'Halo Business Finance Foundations',
            description: 'Learn the essential concepts of business finance, financial analysis, and risk assessment',
            duration: '2.5 hours',
            difficulty: 'beginner',
            prerequisites: [],
            estimatedTime: 150,
            topics: ['Financial Analysis', 'Risk Assessment', 'Cash Flow Analysis'],
            learningObjectives: [
              'Understand core financial statements',
              'Perform basic ratio analysis',
              'Assess business creditworthiness'
            ],
            isCompleted: false,
            isUnlocked: true,
            progress: 0,
            moduleType: 'core',
            skills: ['Financial Analysis', 'Risk Assessment'],
            assessmentCount: 3,
            videoCount: 4
          },
          {
            id: 'capital-markets',
            title: 'Capital Markets & Lending Systems',
            description: 'Explore capital markets and institutional funding mechanisms',
            duration: '3 hours',
            difficulty: 'expert',
            prerequisites: ['foundations'],
            estimatedTime: 180,
            topics: ['Capital Markets', 'Institutional Lending', 'Market Analysis'],
            learningObjectives: [
              'Understand capital market structures',
              'Analyze funding sources',
              'Evaluate market conditions'
            ],
            isCompleted: false,
            isUnlocked: false,
            progress: 0,
            moduleType: 'core',
            skills: ['Market Analysis', 'Capital Allocation'],
            assessmentCount: 4,
            videoCount: 5
          },
          {
            id: 'credit-analysis',
            title: 'Advanced Credit Analysis',
            description: 'Master sophisticated credit analysis techniques and risk management',
            duration: '4 hours',
            difficulty: 'expert',
            prerequisites: ['foundations', 'capital-markets'],
            estimatedTime: 240,
            topics: ['Credit Analysis', 'Risk Management', 'Portfolio Analysis'],
            learningObjectives: [
              'Perform comprehensive credit analysis',
              'Develop risk mitigation strategies',
              'Build and manage loan portfolios'
            ],
            isCompleted: false,
            isUnlocked: false,
            progress: 0,
            moduleType: 'core',
            skills: ['Credit Analysis', 'Risk Management'],
            assessmentCount: 5,
            videoCount: 6
          }
        ]
      },
      {
        id: 'specialized-lending',
        name: 'Specialized Lending',
        description: 'Deep dive into specialized lending products and niche markets',
        difficulty: 'expert',
        totalDuration: '8-10 hours',
        completionRate: 0,
        estimatedCompletion: '1-2 weeks',
        modules: [
          {
            id: 'sba-lending',
            title: 'SBA Lending Mastery',
            description: 'Complete guide to SBA loan programs and application processes',
            duration: '3 hours',
            difficulty: 'expert',
            prerequisites: ['foundations'],
            estimatedTime: 180,
            topics: ['SBA Programs', 'Application Process', 'Compliance'],
            learningObjectives: [
              'Navigate SBA loan programs',
              'Complete SBA applications',
              'Ensure regulatory compliance'
            ],
            isCompleted: false,
            isUnlocked: false,
            progress: 0,
            moduleType: 'elective',
            skills: ['SBA Lending', 'Compliance'],
            assessmentCount: 3,
            videoCount: 4
          }
        ]
      }
    ];

    setLearningPaths(paths);
    setLoading(false);
  };

  const loadUserProgress = async () => {
    if (!user?.id) return;

    try {
      const { data: moduleCompletions, error } = await supabase
        .from('module_completions')
        .select('module_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const progress: Record<string, number> = {};
      moduleCompletions?.forEach(completion => {
        progress[completion.module_id] = 100;
      });

      setUserProgress(progress);
      
      // Update learning path completion rates and unlock status
      setLearningPaths(prev => prev.map(path => ({
        ...path,
        modules: path.modules.map(module => {
          const isCompleted = progress[module.id] === 100;
          const isUnlocked = module.prerequisites.length === 0 || 
            module.prerequisites.every(prereq => progress[prereq] === 100);
          
          return {
            ...module,
            isCompleted,
            isUnlocked,
            progress: progress[module.id] || 0
          };
        })
      })));

    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const currentPath = learningPaths.find(path => path.id === selectedPath);
  
  const getModuleIcon = (module: LearningPathModule) => {
    if (module.isCompleted) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (!module.isUnlocked) return <Lock className="h-6 w-6 text-muted-foreground" />;
    return <Play className="h-6 w-6 text-primary" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'expert': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case 'core': return <Target className="h-4 w-4" />;
      case 'elective': return <Star className="h-4 w-4" />;
      case 'bonus': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const startModule = (moduleId: string) => {
    navigate(`/module/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Learning Path Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {learningPaths.map((path) => (
          <Card 
            key={path.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPath === path.id ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => setSelectedPath(path.id)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                  </div>
                  <Badge variant="outline">{path.completionRate}% Complete</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{path.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {path.totalDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {path.modules.length} modules
                  </span>
                </div>
                
                <Progress value={path.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Learning Path Details */}
      {currentPath && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {currentPath.name}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{currentPath.description}</p>
              </div>
              <Badge className={getDifficultyColor(currentPath.difficulty)}>
                {currentPath.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="modules" className="space-y-6">
              <TabsList>
                <TabsTrigger value="modules">Learning Modules</TabsTrigger>
                <TabsTrigger value="overview">Path Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills & Objectives</TabsTrigger>
              </TabsList>

              <TabsContent value="modules" className="space-y-4">
                {currentPath.modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`transition-all hover:shadow-md ${
                      module.isCompleted ? 'bg-green-50 border-green-200' : 
                      !module.isUnlocked ? 'bg-gray-50 border-gray-200' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getModuleIcon(module)}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{module.title}</h4>
                                  <div className="flex items-center gap-1">
                                    {getModuleTypeIcon(module.moduleType)}
                                    <Badge variant="outline" className="text-xs">
                                      {module.moduleType}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
                                </p>
                              </div>
                              <Badge className={getDifficultyColor(module.difficulty)}>
                                {module.difficulty}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{module.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Play className="h-4 w-4 text-muted-foreground" />
                                <span>{module.videoCount} videos</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span>{module.assessmentCount} assessments</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{module.skills.length} skills</span>
                              </div>
                            </div>

                            {module.prerequisites.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Prerequisites: {module.prerequisites.join(', ')}
                              </div>
                            )}

                            {module.progress > 0 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{module.progress}%</span>
                                </div>
                                <Progress value={module.progress} className="h-2" />
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                              <div className="flex flex-wrap gap-1">
                                {module.topics.slice(0, 3).map((topic, topicIndex) => (
                                  <Badge key={topicIndex} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                                {module.topics.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{module.topics.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                disabled={!module.isUnlocked}
                                onClick={() => startModule(module.id)}
                                className="flex items-center gap-1"
                              >
                                {module.isCompleted ? 'Review' : 'Start'}
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Path Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Duration</span>
                        <span className="font-medium">{currentPath.totalDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Completion</span>
                        <span className="font-medium">{currentPath.estimatedCompletion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Modules</span>
                        <span className="font-medium">{currentPath.modules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate</span>
                        <span className="font-medium">{currentPath.completionRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Comprehensive understanding of business finance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Practical skills for commercial lending</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Risk assessment and management expertise</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Industry-recognized certification</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Skills You'll Develop
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from(new Set(currentPath.modules.flatMap(m => m.skills))).map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentPath.modules.map((module, index) => (
                          <div key={index}>
                            <h5 className="font-medium mb-2">{module.title}</h5>
                            <ul className="space-y-1 ml-4">
                              {module.learningObjectives.map((objective, objIndex) => (
                                <li key={objIndex} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-3 w-3 mt-1 text-primary" />
                                  <span>{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};