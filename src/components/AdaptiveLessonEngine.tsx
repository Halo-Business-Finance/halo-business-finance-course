import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, BookOpen, Video, FileText, MessageSquare, Lightbulb } from 'lucide-react';
import { InteractiveLessonPlayer } from './InteractiveLessonPlayer';
import { LearningPathVisualizer } from './LearningPathVisualizer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/secureLogging';

interface AdaptiveLessonEngineProps {
  moduleId: string;
  userId: string;
  courseId: string;
}

interface LearningProfile {
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty_preference: 'gradual' | 'challenge' | 'adaptive';
  engagement_level: number;
  knowledge_gaps: string[];
  strengths: string[];
  current_mastery_level: number;
}

interface AdaptiveLesson {
  id: string;
  title: string;
  content_type: 'video' | 'interactive' | 'text' | 'simulation' | 'quiz';
  difficulty_level: number;
  estimated_duration: number;
  prerequisites: string[];
  learning_objectives: string[];
  interactive_elements: any[];
  adaptive_content: any;
}

export const AdaptiveLessonEngine = ({ moduleId, userId, courseId }: AdaptiveLessonEngineProps) => {
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [adaptiveLessons, setAdaptiveLessons] = useState<AdaptiveLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<AdaptiveLesson | null>(null);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masteryScore, setMasteryScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeAdaptiveLearning();
  }, [moduleId, userId]);

  const initializeAdaptiveLearning = async () => {
    try {
      setIsLoading(true);
      
      // Fetch or create user's learning profile
      const profile = await fetchLearningProfile();
      setLearningProfile(profile);

      // Generate adaptive lessons based on profile
      const lessons = await generateAdaptiveLessons(profile);
      setAdaptiveLessons(lessons);

      // Create personalized learning path
      const path = await createLearningPath(lessons, profile);
      setLearningPath(path);

      if (lessons.length > 0) {
        setCurrentLesson(lessons[0]);
      }

    } catch (error) {
      logger.error('Error initializing adaptive learning', error, { userId });
      toast({
        title: "Error",
        description: "Failed to initialize adaptive learning system",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLearningProfile = async (): Promise<LearningProfile> => {
    // Check if user has existing adaptive module instance
    const { data: instance } = await supabase
      .from('adaptive_module_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (instance && instance.personalized_content) {
      const content = instance.personalized_content as any;
      return {
        learning_style: content.learning_style || 'visual',
        difficulty_preference: content.difficulty_preference || 'adaptive',
        engagement_level: (instance.performance_metrics as any)?.engagement_level || 50,
        knowledge_gaps: (instance.performance_metrics as any)?.knowledge_gaps || [],
        strengths: (instance.performance_metrics as any)?.strengths || [],
        current_mastery_level: instance.progress_percentage || 0
      };
    }

    // Create default profile for new users
    return {
      learning_style: 'visual',
      difficulty_preference: 'adaptive',
      engagement_level: 50,
      knowledge_gaps: [],
      strengths: [],
      current_mastery_level: 0
    };
  };

  const generateAdaptiveLessons = async (profile: LearningProfile): Promise<AdaptiveLesson[]> => {
    // Mock adaptive lesson generation - in production, this would use AI
    const baseTopics = [
      'SBA Express Loan Fundamentals',
      'Application Process',
      'Documentation Requirements', 
      'Underwriting Criteria',
      'Approval Process',
      'Loan Servicing',
      'Compliance Requirements'
    ];

    const lessons = baseTopics.map((topic, index) => ({
      id: `adaptive-lesson-${index}`,
      title: topic,
      content_type: getOptimalContentType(profile.learning_style, index),
      difficulty_level: calculateDifficultyLevel(profile, index),
      estimated_duration: calculateDuration(profile, index),
      prerequisites: index > 0 ? [baseTopics[index - 1]] : [],
      learning_objectives: generateLearningObjectives(topic),
      interactive_elements: generateInteractiveElements(topic, profile),
      adaptive_content: generateAdaptiveContent(topic, profile)
    }));

    return lessons;
  };

  const getOptimalContentType = (learningStyle: string, index: number): any => {
    const contentTypes = ['video', 'interactive', 'text', 'simulation', 'quiz'];
    
    switch (learningStyle) {
      case 'visual':
        return ['video', 'interactive', 'simulation'][index % 3];
      case 'auditory':
        return ['video', 'interactive'][index % 2];
      case 'kinesthetic':
        return ['interactive', 'simulation'][index % 2];
      case 'reading':
        return ['text', 'quiz'][index % 2];
      default:
        return contentTypes[index % contentTypes.length];
    }
  };

  const calculateDifficultyLevel = (profile: LearningProfile, index: number): number => {
    const base = Math.min(profile.current_mastery_level / 20, 5);
    
    switch (profile.difficulty_preference) {
      case 'gradual':
        return Math.max(1, base + index * 0.5);
      case 'challenge':
        return Math.min(10, base + 2 + index * 0.8);
      default:
        return Math.max(1, Math.min(10, base + index * 0.6));
    }
  };

  const calculateDuration = (profile: LearningProfile, index: number): number => {
    const baseTime = 15; // 15 minutes
    const engagementMultiplier = profile.engagement_level / 50;
    return Math.round(baseTime * engagementMultiplier + index * 5);
  };

  const generateLearningObjectives = (topic: string): string[] => {
    const objectives = {
      'SBA Express Loan Fundamentals': [
        'Understand SBA Express loan program basics',
        'Identify key benefits and limitations',
        'Compare with other SBA loan types'
      ],
      'Application Process': [
        'Master the application workflow',
        'Identify required stakeholders',
        'Understand timeline expectations'
      ],
      'Documentation Requirements': [
        'List all required documents',
        'Understand documentation best practices',
        'Identify common documentation errors'
      ]
    };
    
    return objectives[topic as keyof typeof objectives] || [
      `Learn ${topic} fundamentals`,
      `Apply ${topic} concepts`,
      `Demonstrate ${topic} mastery`
    ];
  };

  const generateInteractiveElements = (topic: string, profile: LearningProfile): any[] => {
    const elements = [];
    
    if (profile.learning_style === 'visual' || profile.learning_style === 'kinesthetic') {
      elements.push({
        type: 'drag-drop',
        title: 'Document Sorting Exercise',
        description: `Sort ${topic} documents by priority`
      });
    }
    
    if (profile.engagement_level > 60) {
      elements.push({
        type: 'scenario-simulation',
        title: 'Real-world Scenario',
        description: `Navigate a ${topic} challenge`
      });
    }
    
    elements.push({
      type: 'knowledge-check',
      title: 'Quick Assessment',
      description: `Test your ${topic} understanding`
    });
    
    return elements;
  };

  const generateAdaptiveContent = (topic: string, profile: LearningProfile): any => {
    return {
      main_content: `Adaptive content for ${topic}`,
      difficulty_variants: {
        beginner: `Basic introduction to ${topic}`,
        intermediate: `Detailed exploration of ${topic}`,
        advanced: `Advanced applications of ${topic}`
      },
      style_adaptations: {
        visual: `Visual guide to ${topic}`,
        auditory: `Audio explanation of ${topic}`,
        kinesthetic: `Hands-on practice with ${topic}`,
        reading: `Comprehensive text on ${topic}`
      },
      remediation_content: `Additional support for ${topic}`,
      enrichment_content: `Advanced exploration of ${topic}`
    };
  };

  const createLearningPath = async (lessons: AdaptiveLesson[], profile: LearningProfile): Promise<any[]> => {
    return lessons.map((lesson, index) => ({
      step: index + 1,
      lesson: lesson,
      status: index === 0 ? 'current' : 'locked',
      estimatedCompletionTime: lesson.estimated_duration,
      adaptations: {
        difficulty: lesson.difficulty_level,
        contentType: lesson.content_type,
        interactiveElements: lesson.interactive_elements.length
      }
    }));
  };

  const handleLessonComplete = async (lessonId: string, score: number, timeSpent: number) => {
    try {
      // Update user progress and performance metrics
      await updateLearningMetrics(lessonId, score, timeSpent);
      
      // Adjust learning profile based on performance
      await adaptLearningProfile(score, timeSpent);
      
      // Move to next lesson or complete module
      const currentIndex = adaptiveLessons.findIndex(l => l.id === lessonId);
      if (currentIndex < adaptiveLessons.length - 1) {
        setCurrentLesson(adaptiveLessons[currentIndex + 1]);
        
        // Update learning path
        const newPath = [...learningPath];
        newPath[currentIndex].status = 'completed';
        newPath[currentIndex + 1].status = 'current';
        setLearningPath(newPath);
      } else {
        // Module completed
        toast({
          title: "🎉 Module Completed!",
          description: "Great job! You've mastered this module with adaptive learning.",
        });
      }
      
    } catch (error) {
      logger.error('Error completing lesson', error, { userId, lessonId });
      toast({
        title: "Error",
        description: "Failed to save lesson progress",
        variant: "destructive"
      });
    }
  };

  const updateLearningMetrics = async (lessonId: string, score: number, timeSpent: number) => {
    const { error } = await supabase
      .from('adaptive_module_instances')
      .update({
        performance_metrics: {
          ...learningProfile,
          last_score: score,
          average_time_per_lesson: timeSpent,
          lessons_completed: (learningProfile?.current_mastery_level || 0) + 1
        },
        progress_percentage: Math.min(100, (learningProfile?.current_mastery_level || 0) + (100 / adaptiveLessons.length)),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
  };

  const adaptLearningProfile = async (score: number, timeSpent: number) => {
    if (!learningProfile) return;

    const newProfile = { ...learningProfile };
    
    // Adjust engagement based on time spent vs estimated
    if (currentLesson) {
      const timeRatio = timeSpent / currentLesson.estimated_duration;
      if (timeRatio > 1.5) {
        newProfile.engagement_level = Math.max(0, newProfile.engagement_level - 10);
      } else if (timeRatio < 0.8) {
        newProfile.engagement_level = Math.min(100, newProfile.engagement_level + 5);
      }
    }
    
    // Adjust mastery level based on score
    newProfile.current_mastery_level = Math.min(100, newProfile.current_mastery_level + (score / 10));
    
    setLearningProfile(newProfile);
    setMasteryScore(newProfile.current_mastery_level);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Brain className="h-8 w-8 animate-pulse mx-auto text-primary" />
          <p>Personalizing your learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Adaptive Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline">{learningProfile?.learning_style}</Badge>
              <p className="text-sm text-muted-foreground mt-1">Learning Style</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{masteryScore}%</div>
              <p className="text-sm text-muted-foreground">Mastery Level</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{learningProfile?.engagement_level}%</div>
              <p className="text-sm text-muted-foreground">Engagement</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary">{learningProfile?.difficulty_preference}</Badge>
              <p className="text-sm text-muted-foreground mt-1">Difficulty</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lesson" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson">Current Lesson</TabsTrigger>
          <TabsTrigger value="path">Learning Path</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson" className="space-y-6">
          {currentLesson && (
            <InteractiveLessonPlayer
              lesson={currentLesson}
              learningProfile={learningProfile!}
              onComplete={handleLessonComplete}
            />
          )}
        </TabsContent>

        <TabsContent value="path" className="space-y-6">
          <LearningPathVisualizer
            learningPath={learningPath}
            currentLessonId={currentLesson?.id}
            onLessonSelect={(lesson) => setCurrentLesson(lesson)}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Module Progress</span>
                    <span>{Math.round((learningPath.filter(p => p.status === 'completed').length / learningPath.length) * 100)}%</span>
                  </div>
                  <Progress value={(learningPath.filter(p => p.status === 'completed').length / learningPath.length) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Mastery Score</span>
                    <span>{masteryScore}%</span>
                  </div>
                  <Progress value={masteryScore} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {learningProfile?.strengths.map((strength, index) => (
                      <Badge key={index} variant="success" className="text-xs">
                        {strength}
                      </Badge>
                    )) || <Badge variant="outline" className="text-xs">Building strengths...</Badge>}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Focus Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {learningProfile?.knowledge_gaps.map((gap, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {gap}
                      </Badge>
                    )) || <Badge variant="outline" className="text-xs">No gaps identified</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};