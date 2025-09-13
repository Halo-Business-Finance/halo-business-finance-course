import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/secureLogging";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen,
  Clock,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  RefreshCw
} from "lucide-react";

interface LearningRecommendation {
  id: string;
  type: 'module' | 'review' | 'practice' | 'challenge';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  moduleId?: string;
  topicId?: string;
}

interface PersonalizationProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredPace: 'slow' | 'medium' | 'fast';
  strongAreas: string[];
  weakAreas: string[];
  interests: string[];
  availableTime: number; // minutes per day
  goals: string[];
  difficultyPreference: 'challenging' | 'balanced' | 'comfortable';
}

interface AdaptivePath {
  id: string;
  name: string;
  description: string;
  modules: {
    id: string;
    title: string;
    order: number;
    unlocked: boolean;
    recommended: boolean;
    adaptedContent: {
      videos: boolean;
      readings: boolean;
      interactives: boolean;
      assessments: boolean;
    };
  }[];
  estimatedCompletion: string;
  personalizedFeatures: string[];
}

export const AdaptiveLearningEngine = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [adaptivePaths, setAdaptivePaths] = useState<AdaptivePath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadPersonalizationData();
    }
  }, [user?.id]);

  const loadPersonalizationData = async () => {
    try {
      await Promise.all([
        loadUserProfile(),
        generateRecommendations(),
        generateAdaptivePaths()
      ]);
    } catch (error) {
      logger.error('Error loading personalization data', error, { userId: user?.id });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    // In a real implementation, this would come from user preferences and learning analytics
    const mockProfile: PersonalizationProfile = {
      learningStyle: 'visual',
      preferredPace: 'medium',
      strongAreas: ['Financial Analysis', 'Risk Assessment'],
      weakAreas: ['Capital Markets', 'Credit Analysis'],
      interests: ['SBA Lending', 'Commercial Banking'],
      availableTime: 60, // 1 hour per day
      goals: ['Complete certification', 'Improve quiz scores', 'Master advanced topics'],
      difficultyPreference: 'balanced'
    };
    setProfile(mockProfile);
  };

  const generateRecommendations = async () => {
    // AI-powered recommendations based on user performance and preferences
    const mockRecommendations: LearningRecommendation[] = [
      {
        id: 'rec1',
        type: 'review',
        title: 'Review Capital Markets Fundamentals',
        description: 'Strengthen your understanding of primary and secondary markets',
        reason: 'Your recent quiz scores suggest this area needs reinforcement',
        priority: 'high',
        estimatedTime: 30,
        difficulty: 'medium',
        moduleId: 'capital-markets'
      },
      {
        id: 'rec2',
        type: 'practice',
        title: 'Interactive Credit Analysis Simulation',
        description: 'Practice real-world credit analysis scenarios',
        reason: 'Hands-on practice will help solidify theoretical knowledge',
        priority: 'high',
        estimatedTime: 45,
        difficulty: 'medium',
        topicId: 'credit-analysis'
      },
      {
        id: 'rec3',
        type: 'module',
        title: 'Advanced SBA Lending Strategies',
        description: 'Explore specialized SBA loan programs',
        reason: 'Aligns with your expressed interest in SBA lending',
        priority: 'medium',
        estimatedTime: 90,
        difficulty: 'hard',
        moduleId: 'sba-advanced'
      },
      {
        id: 'rec4',
        type: 'challenge',
        title: 'Weekly Finance Quiz Challenge',
        description: 'Test your knowledge across all topics',
        reason: 'Regular assessment helps maintain and improve knowledge',
        priority: 'low',
        estimatedTime: 20,
        difficulty: 'medium'
      }
    ];
    setRecommendations(mockRecommendations);
  };

  const generateAdaptivePaths = async () => {
    const mockPaths: AdaptivePath[] = [
      {
        id: 'visual-learner',
        name: 'Visual Learning Pathway',
        description: 'Optimized for visual learners with diagrams, charts, and interactive content',
        estimatedCompletion: '6-8 weeks',
        personalizedFeatures: [
          'Interactive diagrams and flowcharts',
          'Video content with visual aids',
          'Infographic summaries',
          'Mind maps for complex concepts'
        ],
        modules: [
          {
            id: 'foundations',
            title: 'Business Finance Foundations (Visual)',
            order: 1,
            unlocked: true,
            recommended: true,
            adaptedContent: {
              videos: true,
              readings: false,
              interactives: true,
              assessments: true
            }
          },
          {
            id: 'capital-markets',
            title: 'Capital Markets (Interactive)',
            order: 2,
            unlocked: false,
            recommended: false,
            adaptedContent: {
              videos: true,
              readings: false,
              interactives: true,
              assessments: true
            }
          }
        ]
      },
      {
        id: 'accelerated',
        name: 'Accelerated Pathway',
        description: 'Fast-track learning for experienced professionals',
        estimatedCompletion: '3-4 weeks',
        personalizedFeatures: [
          'Condensed content modules',
          'Advanced case studies',
          'Skip basic concepts',
          'Challenge-based learning'
        ],
        modules: [
          {
            id: 'advanced-credit',
            title: 'Advanced Credit Analysis',
            order: 1,
            unlocked: true,
            recommended: true,
            adaptedContent: {
              videos: false,
              readings: true,
              interactives: true,
              assessments: true
            }
          }
        ]
      }
    ];
    setAdaptivePaths(mockPaths);
    setSelectedPath(mockPaths[0].id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return BookOpen;
      case 'review': return RefreshCw;
      case 'practice': return Target;
      case 'challenge': return Zap;
      default: return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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

  const selectedAdaptivePath = adaptivePaths.find(p => p.id === selectedPath);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Adaptive Learning
          </CardTitle>
          <p className="text-muted-foreground">
            Personalized learning recommendations based on your progress, preferences, and goals
          </p>
        </CardHeader>
      </Card>

      {/* Learning Profile Summary */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Learning Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Learning Style</p>
                <p className="font-semibold capitalize">{profile.learningStyle}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Preferred Pace</p>
                <p className="font-semibold capitalize">{profile.preferredPace}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Daily Study Time</p>
                <p className="font-semibold">{profile.availableTime} minutes</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Difficulty Preference</p>
                <p className="font-semibold capitalize">{profile.difficultyPreference}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium mb-2">Strong Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.strongAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Areas for Improvement</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.weakAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const IconComponent = getTypeIcon(rec.type);
              return (
                <div key={rec.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.estimatedTime} min
                        </span>
                        <Badge variant="outline">{rec.difficulty}</Badge>
                        <Badge variant="outline" className="capitalize">{rec.type}</Badge>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg mb-3">
                        <p className="text-sm">
                          <strong>Why this is recommended:</strong> {rec.reason}
                        </p>
                      </div>
                      
                      <Button size="sm" className="flex items-center gap-1">
                        Start Learning
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Adaptive Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Path Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Available Paths</h4>
              {adaptivePaths.map((path) => (
                <div 
                  key={path.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPath === path.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <h5 className="font-semibold">{path.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{path.estimatedCompletion}</p>
                </div>
              ))}
            </div>

            {/* Selected Path Details */}
            {selectedAdaptivePath && (
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personalized Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAdaptivePath.personalizedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Learning Modules</h4>
                  <div className="space-y-3">
                    {selectedAdaptivePath.modules.map((module) => (
                      <div key={module.id} className={`p-4 border rounded-lg ${
                        module.recommended ? 'border-primary bg-primary/5' : ''
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{module.title}</h5>
                          <div className="flex gap-1">
                            {module.recommended && (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                Recommended
                              </Badge>
                            )}
                            {!module.unlocked && (
                              <Badge variant="outline">Locked</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 text-xs">
                          {module.adaptedContent.videos && (
                            <Badge variant="secondary">Videos</Badge>
                          )}
                          {module.adaptedContent.readings && (
                            <Badge variant="secondary">Readings</Badge>
                          )}
                          {module.adaptedContent.interactives && (
                            <Badge variant="secondary">Interactive</Badge>
                          )}
                          {module.adaptedContent.assessments && (
                            <Badge variant="secondary">Assessments</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  Start Adaptive Path
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};