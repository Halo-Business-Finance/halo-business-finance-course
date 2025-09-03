import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdaptiveLearning } from "@/hooks/useAdaptiveLearning";
import { InteractiveLessonComponents } from "@/components/InteractiveLessonComponents";
import { EnhancedQuiz } from "@/components/EnhancedQuiz";
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Play,
  Award,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

interface AdaptiveModuleContentProps {
  moduleInstanceId: string;
  onComplete?: () => void;
}

export const AdaptiveModuleContent = ({ moduleInstanceId, onComplete }: AdaptiveModuleContentProps) => {
  const { adaptiveModules, updateModuleProgress } = useAdaptiveLearning();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const moduleInstance = adaptiveModules.find(m => m.id === moduleInstanceId);
  
  if (!moduleInstance) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Module not found or not accessible.</p>
        </CardContent>
      </Card>
    );
  }

  const module = moduleInstance.adaptive_module;
  const adaptiveContent = module.adaptive_content;
  
  // Generate adaptive learning steps based on module content and user's current level
  const generateAdaptiveSteps = () => {
    const baseSteps = [
      {
        id: 'introduction',
        title: 'Introduction & Objectives',
        type: 'content',
        content: {
          title: `Welcome to ${module.title}`,
          description: module.description,
          objectives: module.learning_objectives,
          estimatedTime: module.base_duration
        }
      },
      {
        id: 'assessment',
        title: 'Initial Assessment',
        type: 'assessment',
        content: {
          title: 'Knowledge Check',
          description: 'Let\'s assess your current understanding to personalize your learning path.',
          questions: generateAdaptiveQuestions(module.module_key, moduleInstance.current_difficulty_level)
        }
      },
      {
        id: 'learning',
        title: 'Interactive Learning',
        type: 'interactive',
        content: {
          title: 'Hands-on Practice',
          description: 'Apply concepts through interactive exercises.',
          activities: adaptiveContent.content_types || ['interactive_lessons', 'simulations']
        }
      },
      {
        id: 'practice',
        title: 'Practice Scenarios',
        type: 'scenarios',
        content: {
          title: 'Real-world Application',
          description: 'Practice with realistic business scenarios.',
          scenarios: generatePracticeScenarios(module.module_key, moduleInstance.current_difficulty_level)
        }
      },
      {
        id: 'mastery',
        title: 'Mastery Assessment',
        type: 'final_assessment',
        content: {
          title: 'Demonstrate Your Mastery',
          description: 'Show that you\'ve mastered the key concepts.',
          passingScore: module.assessment_criteria.mastery_threshold || 85
        }
      }
    ];

    // Adapt steps based on user's performance and difficulty level
    if (moduleInstance.current_difficulty_level === 'beginner') {
      baseSteps.splice(2, 0, {
        id: 'fundamentals',
        title: 'Core Fundamentals',
        type: 'content',
        content: {
          title: 'Building Strong Foundations',
          description: 'Let\'s start with the essential concepts you need to know.',
          objectives: module.learning_objectives.slice(0, 2),
          estimatedTime: '30 minutes'
        }
      });
    }

    if (moduleInstance.current_difficulty_level === 'expert') {
      baseSteps.push({
        id: 'expert_topics',
        title: 'Expert Applications',
        type: 'scenarios',
        content: {
          title: 'Expert-Level Challenges',
          description: 'Tackle complex scenarios and innovative solutions.',
          scenarios: generateExpertChallenges(module.module_key)
        }
      });
    }

    return baseSteps;
  };

  const generateAdaptiveQuestions = (moduleKey: string, difficultyLevel: string) => {
    // This would be more sophisticated in a real implementation
    const questionBank = {
      foundations_assessment: [
        {
          id: 'q1',
          question: 'What is the primary goal of financial analysis in lending?',
          options: [
            'To maximize loan amount',
            'To assess creditworthiness and risk',
            'To minimize paperwork',
            'To speed up processing'
          ],
          correctAnswer: 1,
          explanation: 'Financial analysis helps lenders assess the borrower\'s ability to repay and overall creditworthiness.'
        }
      ],
      core_concepts: [
        {
          id: 'q2',
          question: 'Which factor is most important in commercial lending decisions?',
          options: [
            'Personal relationships',
            'Cash flow analysis',
            'Marketing budget',
            'Office location'
          ],
          correctAnswer: 1,
          explanation: 'Cash flow analysis is crucial as it shows the business\'s ability to service debt.'
        }
      ]
    };

    return questionBank[moduleKey] || [];
  };

  const generatePracticeScenarios = (moduleKey: string, difficultyLevel: string) => {
    const scenarios = {
      foundations_assessment: [
        {
          title: 'Small Business Loan Application',
          description: 'A local restaurant owner is applying for a $75,000 working capital loan.',
          task: 'Review their financial statements and make a recommendation.'
        }
      ],
      practical_application: [
        {
          title: 'Manufacturing Company Expansion',
          description: 'A manufacturing company needs $500,000 for equipment purchase.',
          task: 'Analyze the business case and structure an appropriate loan.'
        }
      ]
    };

    return scenarios[moduleKey] || [];
  };

  const generateExpertChallenges = (moduleKey: string) => {
    return [
      {
        title: 'Complex Deal Structuring',
        description: 'Structure a multi-layered financing solution for a complex transaction.',
        complexity: 'high'
      }
    ];
  };

  const adaptiveSteps = generateAdaptiveSteps();
  const currentStepData = adaptiveSteps[currentStep];

  const handleStepComplete = async (stepData?: any) => {
    setLoading(true);
    
    // Mark step as completed
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);

    // Calculate progress
    const progressPercentage = Math.round((newCompletedSteps.length / adaptiveSteps.length) * 100);
    
    // Calculate time spent
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 60000);

    // Update performance metrics based on step completion
    const performanceMetrics = {
      ...moduleInstance.performance_metrics,
      steps_completed: newCompletedSteps.length,
      current_step: currentStep,
      last_step_data: stepData,
      accuracy: stepData?.score || 0,
      speed: stepData?.completionTime || 1.0,
      confidence: stepData?.confidence || 75
    };

    await updateModuleProgress(moduleInstanceId, {
      progress_percentage: progressPercentage,
      performance_metrics: performanceMetrics,
      time_spent_minutes: (moduleInstance.time_spent_minutes || 0) + timeSpent,
      completion_status: progressPercentage === 100 ? 'completed' : 'in_progress'
    });

    if (currentStep < adaptiveSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Module completed
      onComplete?.();
    }

    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'content':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {currentStepData.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentStepData.content.description}</p>
              
              {currentStepData.content.objectives && (
                <div>
                  <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {currentStepData.content.objectives.map((obj: string, index: number) => (
                      <li key={index} className="text-sm">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStepData.content.estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated time: {currentStepData.content.estimatedTime}</span>
                </div>
              )}

              <Button onClick={() => handleStepComplete()} className="w-full" disabled={loading}>
                Continue Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'assessment':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {currentStepData.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentStepData.content.description}</p>
              
              <div className="space-y-4">
                {currentStepData.content.questions.map((question: any, index: number) => (
                  <Card key={question.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">{question.question}</h4>
                      <div className="space-y-2">
                        {question.options?.map((option: string, optionIndex: number) => (
                          <Button
                            key={optionIndex}
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => handleStepComplete({
                              score: optionIndex === question.correctAnswer ? 100 : 0,
                              completionTime: 2.0,
                              confidence: 75
                            })}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'interactive':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                {currentStepData.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{currentStepData.content.description}</p>
              <InteractiveLessonComponents />
              <Button onClick={() => handleStepComplete()} className="w-full mt-4" disabled={loading}>
                Complete Interactive Learning
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'scenarios':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {currentStepData.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentStepData.content.description}</p>
              
              {currentStepData.content.scenarios.map((scenario: any, index: number) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <strong>Your Task:</strong> {scenario.task}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={() => handleStepComplete()} className="w-full" disabled={loading}>
                Complete Scenarios
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'final_assessment':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {currentStepData.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentStepData.content.description}</p>
              
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-semibold">Mastery Requirements</span>
                </div>
                <p className="text-sm">
                  Score {currentStepData.content.passingScore}% or higher to demonstrate mastery
                </p>
              </div>

              <Button onClick={() => handleStepComplete({ score: 90 })} className="w-full" disabled={loading}>
                Start Final Assessment
                <Award className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{module.title}</h2>
              <p className="text-muted-foreground">{module.description}</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {moduleInstance.current_difficulty_level}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((completedSteps.length / adaptiveSteps.length) * 100)}%</span>
            </div>
            <Progress value={(completedSteps.length / adaptiveSteps.length) * 100} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-2 mt-4">
            {adaptiveSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                  completedSteps.includes(index)
                    ? 'bg-success text-success-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {completedSteps.includes(index) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">{currentStepData.title}</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {adaptiveSteps.length}
          </p>
        </div>
        {renderStepContent()}
      </motion.div>
    </div>
  );
};