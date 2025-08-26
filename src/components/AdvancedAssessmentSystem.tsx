import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedLearning } from "@/hooks/useEnhancedLearning";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Target,
  TrendingUp,
  RotateCcw,
  Lightbulb,
  Timer,
  Award,
  BookOpen
} from "lucide-react";

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'scenario' | 'drag_drop' | 'simulation';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  timeLimit?: number;
  hints?: string[];
  multimedia?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
  adaptiveData?: {
    previousPerformance: number;
    conceptMastery: number;
    recommendedDifficulty: string;
  };
}

interface AssessmentSession {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  startTime: Date;
  timeRemaining: number;
  isAdaptive: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  hintsUsed: Record<string, number>;
  confidence: Record<string, number>;
}

interface AssessmentResults {
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  topicBreakdown: Record<string, { correct: number; total: number; averageTime: number }>;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

export const AdvancedAssessmentSystem = () => {
  const { trackLearningEvent } = useEnhancedLearning();
  const { toast } = useToast();
  
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [confidence, setConfidence] = useState<number>(3);
  const [currentMode, setCurrentMode] = useState<'practice' | 'assessment' | 'adaptive'>('practice');

  // Timer management
  useEffect(() => {
    if (!session || results) return;

    const timer = setInterval(() => {
      setSession(prev => {
        if (!prev) return prev;
        
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          handleTimeUp();
          return prev;
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, results]);

  const startAssessment = useCallback(async (mode: 'practice' | 'assessment' | 'adaptive', topic?: string) => {
    setIsLoading(true);
    setCurrentMode(mode);
    
    try {
      // Generate adaptive questions based on user's performance history
      const questions = await generateAdaptiveQuestions(mode, topic);
      
      const newSession: AssessmentSession = {
        id: crypto.randomUUID(),
        questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: new Date(),
        timeRemaining: mode === 'assessment' ? 1800 : 3600, // 30 min for assessment, 60 min for practice
        isAdaptive: mode === 'adaptive',
        difficultyLevel: 'beginner',
        topic: topic || 'general',
        hintsUsed: {},
        confidence: {}
      };
      
      setSession(newSession);
      setResults(null);
      setSelectedAnswer("");
      setShowHint(false);
      setConfidence(3);
      
      await trackLearningEvent('assessment_started', {
        mode,
        topic,
        questionCount: questions.length
      });
      
    } catch (error) {
      toast({
        title: "Error starting assessment",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [trackLearningEvent, toast]);

  const generateAdaptiveQuestions = async (mode: string, topic?: string): Promise<Question[]> => {
    // In a real implementation, this would call an AI service or fetch from database
    // For now, we'll create diverse question types
    const sampleQuestions: Question[] = [
      {
        id: '1',
        type: 'multiple_choice',
        question: 'What is the primary purpose of a debt-to-income ratio in commercial lending?',
        options: [
          'To determine the borrower\'s credit score',
          'To assess the borrower\'s ability to service debt payments',
          'To calculate the loan-to-value ratio',
          'To estimate the property\'s market value'
        ],
        correctAnswer: 'To assess the borrower\'s ability to service debt payments',
        explanation: 'The debt-to-income ratio is a key metric that helps lenders evaluate whether a borrower can comfortably manage their debt obligations relative to their income.',
        difficulty: 'easy',
        topic: 'Credit Analysis',
        timeLimit: 120,
        hints: ['Think about what debt payments require', 'Consider what income represents']
      },
      {
        id: '2',
        type: 'scenario',
        question: 'A retail business is seeking a $500,000 working capital loan. Their annual revenue is $2M, but their cash flow is seasonal with 70% of sales occurring in Q4. How would you structure this loan?',
        explanation: 'For seasonal businesses, consider a revolving credit line that aligns with cash flow patterns, potentially with seasonal payment adjustments.',
        difficulty: 'hard',
        topic: 'Loan Structuring',
        timeLimit: 300,
        hints: ['Consider the seasonal nature', 'Think about cash flow timing', 'What type of credit facility would be most appropriate?']
      },
      {
        id: '3',
        type: 'true_false',
        question: 'SBA 7(a) loans can be used for real estate acquisition but not for refinancing existing debt.',
        correctAnswer: 'false',
        explanation: 'SBA 7(a) loans can be used for both real estate acquisition and refinancing existing business debt under certain conditions.',
        difficulty: 'medium',
        topic: 'SBA Lending',
        timeLimit: 90
      },
      {
        id: '4',
        type: 'short_answer',
        question: 'Define "loan-to-value ratio" and explain its significance in commercial real estate lending.',
        explanation: 'LTV is the ratio of the loan amount to the property\'s appraised value, typically expressed as a percentage. It helps lenders assess risk and determine appropriate loan amounts.',
        difficulty: 'medium',
        topic: 'Real Estate Finance',
        timeLimit: 180
      }
    ];

    // Adaptive algorithm would select questions based on:
    // - User's previous performance
    // - Current difficulty level
    // - Topic focus
    // - Learning objectives
    
    return sampleQuestions.slice(0, mode === 'practice' ? 5 : 10);
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!session || !selectedAnswer) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    // Record answer with confidence and timing data
    const answerData = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      confidence: confidence,
      timeSpent: currentQuestion.timeLimit ? (currentQuestion.timeLimit - session.timeRemaining) : 0,
      hintsUsed: session.hintsUsed[currentQuestion.id] || 0,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer
    };

    const updatedAnswers = { ...session.answers, [currentQuestion.id]: answerData };
    
    // Update session
    setSession(prev => prev ? {
      ...prev,
      answers: updatedAnswers,
      confidence: { ...prev.confidence, [currentQuestion.id]: confidence }
    } : null);

    // Track learning event
    await trackLearningEvent('question_answered', {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      difficulty: currentQuestion.difficulty,
      topic: currentQuestion.topic,
      isCorrect: answerData.isCorrect,
      timeSpent: answerData.timeSpent,
      confidence: confidence,
      hintsUsed: answerData.hintsUsed
    });

    // Move to next question or finish
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null);
      setSelectedAnswer("");
      setShowHint(false);
      setConfidence(3);
    } else {
      await finishAssessment(updatedAnswers);
    }
  }, [session, selectedAnswer, confidence, trackLearningEvent]);

  const finishAssessment = async (finalAnswers: Record<string, any>) => {
    if (!session) return;

    const endTime = new Date();
    const totalTimeSpent = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60);
    
    // Calculate comprehensive results
    const results = calculateDetailedResults(session, finalAnswers, totalTimeSpent);
    setResults(results);
    setSession(null);

    // Track completion
    await trackLearningEvent('assessment_completed', {
      mode: currentMode,
      score: results.score,
      timeSpent: totalTimeSpent,
      questionsAnswered: results.totalQuestions,
      correctAnswers: results.correctAnswers
    });

    toast({
      title: "Assessment Complete!",
      description: `You scored ${results.score}% in ${totalTimeSpent} minutes.`,
    });
  };

  const calculateDetailedResults = (
    session: AssessmentSession, 
    answers: Record<string, any>, 
    timeSpent: number
  ): AssessmentResults => {
    const questions = session.questions;
    let correctCount = 0;
    const topicBreakdown: Record<string, { correct: number; total: number; averageTime: number }> = {};
    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach(question => {
      const answer = answers[question.id];
      const isCorrect = answer?.isCorrect || false;
      
      if (isCorrect) correctCount++;

      // Topic breakdown
      if (!topicBreakdown[question.topic]) {
        topicBreakdown[question.topic] = { correct: 0, total: 0, averageTime: 0 };
      }
      topicBreakdown[question.topic].total++;
      topicBreakdown[question.topic].averageTime += answer?.timeSpent || 0;
      if (isCorrect) topicBreakdown[question.topic].correct++;

      // Difficulty breakdown
      if (!difficultyBreakdown[question.difficulty]) {
        difficultyBreakdown[question.difficulty] = { correct: 0, total: 0 };
      }
      difficultyBreakdown[question.difficulty].total++;
      if (isCorrect) difficultyBreakdown[question.difficulty].correct++;
    });

    // Calculate average times
    Object.keys(topicBreakdown).forEach(topic => {
      topicBreakdown[topic].averageTime = topicBreakdown[topic].averageTime / topicBreakdown[topic].total;
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Generate AI-powered recommendations
    const recommendations = generateRecommendations(score, topicBreakdown, difficultyBreakdown);
    const strengths = generateStrengths(topicBreakdown, difficultyBreakdown);
    const improvements = generateImprovements(topicBreakdown, difficultyBreakdown);
    const nextSteps = generateNextSteps(score, session.topic);

    return {
      score,
      timeSpent,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      topicBreakdown,
      difficultyBreakdown,
      recommendations,
      strengths,
      improvements,
      nextSteps
    };
  };

  const generateRecommendations = (score: number, topics: any, difficulties: any): string[] => {
    const recs = [];
    
    if (score < 70) {
      recs.push("Focus on fundamental concepts before attempting advanced topics");
      recs.push("Consider reviewing course materials and taking practice quizzes");
    }
    
    // Find weak topics
    Object.entries(topics).forEach(([topic, data]: [string, any]) => {
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 60) {
        recs.push(`Review ${topic} concepts - current mastery: ${Math.round(percentage)}%`);
      }
    });

    if (score >= 90) {
      recs.push("Excellent performance! Consider advancing to more challenging modules");
    }

    return recs;
  };

  const generateStrengths = (topics: any, difficulties: any): string[] => {
    const strengths = [];
    
    Object.entries(topics).forEach(([topic, data]: [string, any]) => {
      const percentage = (data.correct / data.total) * 100;
      if (percentage >= 80) {
        strengths.push(`Strong understanding of ${topic} (${Math.round(percentage)}%)`);
      }
    });

    return strengths;
  };

  const generateImprovements = (topics: any, difficulties: any): string[] => {
    const improvements = [];
    
    Object.entries(topics).forEach(([topic, data]: [string, any]) => {
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 70) {
        improvements.push(`${topic} needs more practice (${Math.round(percentage)}%)`);
      }
    });

    return improvements;
  };

  const generateNextSteps = (score: number, topic: string): string[] => {
    const steps = [];
    
    if (score >= 80) {
      steps.push("Advance to the next module or take a more challenging assessment");
      steps.push("Apply knowledge through practical scenarios and case studies");
    } else if (score >= 60) {
      steps.push("Review incorrect answers and their explanations");
      steps.push("Practice similar questions to reinforce weak areas");
    } else {
      steps.push("Revisit course materials for fundamental concepts");
      steps.push("Schedule study time for focused review");
      steps.push("Consider additional learning resources or tutoring");
    }
    
    return steps;
  };

  const handleTimeUp = () => {
    if (session) {
      finishAssessment(session.answers);
    }
  };

  const useHint = () => {
    if (!session) return;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const hintsUsed = session.hintsUsed[currentQuestion.id] || 0;
    
    if (hintsUsed < (currentQuestion.hints?.length || 0)) {
      setShowHint(true);
      setSession(prev => prev ? {
        ...prev,
        hintsUsed: { 
          ...prev.hintsUsed, 
          [currentQuestion.id]: hintsUsed + 1 
        }
      } : null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Results View
  if (results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {results.score >= 90 ? (
                <Award className="h-8 w-8 text-yellow-500" />
              ) : results.score >= 70 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <Target className="h-8 w-8 text-blue-500" />
              )}
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{results.score}%</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.timeSpent}m</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {results.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Improvement */}
              {results.improvements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <TrendingUp className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {results.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setResults(null)} variant="outline">
                Take Another Assessment
              </Button>
              <Button onClick={() => startAssessment('practice')} variant="outline">
                Practice Mode
              </Button>
              <Button>Continue Learning</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment Interface
  if (session) {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
    const hintsUsed = session.hintsUsed[currentQuestion.id] || 0;
    const availableHints = currentQuestion.hints?.length || 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.topic}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                {formatTime(session.timeRemaining)}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
                {currentQuestion.multimedia && (
                  <div className="mt-4">
                    {currentQuestion.multimedia.type === 'image' && (
                      <img 
                        src={currentQuestion.multimedia.url} 
                        alt={currentQuestion.multimedia.alt}
                        className="max-w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Answer Input */}
                {currentQuestion.type === 'multiple_choice' && (
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'true_false' && (
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <Input
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full"
                  />
                )}

                {(currentQuestion.type === 'essay' || currentQuestion.type === 'scenario') && (
                  <Textarea
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Provide your detailed response..."
                    className="min-h-[120px]"
                  />
                )}

                {/* Confidence Selector */}
                <div className="space-y-2">
                  <Label>How confident are you in your answer?</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={confidence === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfidence(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1 = Not confident, 5 = Very confident
                  </p>
                </div>

                {/* Hint System */}
                {availableHints > 0 && (
                  <div className="space-y-3">
                    {!showHint && hintsUsed < availableHints && (
                      <Button variant="outline" size="sm" onClick={useHint}>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Get Hint ({hintsUsed}/{availableHints} used)
                      </Button>
                    )}
                    
                    {showHint && currentQuestion.hints && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 mb-1">Hint:</p>
                            <p className="text-sm text-yellow-700">
                              {currentQuestion.hints[hintsUsed]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    disabled={session.currentQuestionIndex === 0}
                    onClick={() => setSession(prev => prev ? {
                      ...prev,
                      currentQuestionIndex: prev.currentQuestionIndex - 1
                    } : null)}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer.trim()}
                  >
                    {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Start Screen
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Advanced Assessment System</CardTitle>
          <p className="text-muted-foreground">
            Choose your assessment type to begin adaptive testing with detailed feedback.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => startAssessment('practice')}>
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Practice Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Untimed practice with hints and immediate feedback
                </p>
              </div>
            </Card>

            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => startAssessment('assessment')}>
              <div className="text-center space-y-2">
                <Clock className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-semibold">Formal Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Timed assessment for certification and progress tracking
                </p>
              </div>
            </Card>

            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => startAssessment('adaptive')}>
              <div className="text-center space-y-2">
                <Brain className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">Adaptive Test</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered adaptive difficulty based on your performance
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Assessment Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Multiple question types (MC, scenarios, essays)
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Detailed performance analytics
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Adaptive difficulty adjustment
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Personalized learning recommendations
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Confidence tracking and hint system
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Topic and difficulty breakdowns
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};