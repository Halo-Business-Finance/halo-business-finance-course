import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Target,
  Clock,
  Brain,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizResult {
  questionId: string;
  question: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  explanation?: string;
  points: number;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface QuizFeedbackProps {
  results: QuizResult[];
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  passingScore: number;
  onRetake?: () => void;
  onContinue?: () => void;
  onReview?: () => void;
  moduleTitle: string;
}

interface PerformanceInsight {
  type: 'strength' | 'weakness' | 'improvement';
  title: string;
  description: string;
  recommendations: string[];
}

export const EnhancedQuizFeedback = ({
  results,
  totalScore,
  maxScore,
  timeSpent,
  passingScore,
  onRetake,
  onContinue,
  onReview,
  moduleTitle
}: QuizFeedbackProps) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'detailed' | 'insights'>('overview');
  
  const percentage = (totalScore / maxScore) * 100;
  const passed = percentage >= passingScore;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  
  // Calculate performance insights
  const insights = generatePerformanceInsights(results, timeSpent, percentage);
  
  // Group results by topic
  const topicPerformance = results.reduce((acc, result) => {
    if (!acc[result.topic]) {
      acc[result.topic] = { correct: 0, total: 0, points: 0, maxPoints: 0 };
    }
    acc[result.topic].total += 1;
    acc[result.topic].maxPoints += result.points;
    if (result.isCorrect) {
      acc[result.topic].correct += 1;
      acc[result.topic].points += result.points;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number; points: number; maxPoints: number }>);

  // Calculate difficulty performance
  const difficultyPerformance = results.reduce((acc, result) => {
    if (!acc[result.difficulty]) {
      acc[result.difficulty] = { correct: 0, total: 0 };
    }
    acc[result.difficulty].total += 1;
    if (result.isCorrect) {
      acc[result.difficulty].correct += 1;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  function generatePerformanceInsights(results: QuizResult[], timeSpent: number, percentage: number): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];
    
    // Time analysis
    const avgTimePerQuestion = timeSpent / results.length;
    if (avgTimePerQuestion < 30) {
      insights.push({
        type: 'improvement',
        title: 'Rushed Responses',
        description: 'You completed questions quickly. Consider taking more time to read carefully.',
        recommendations: [
          'Read each question twice before answering',
          'Review all answer options thoroughly',
          'Use the full time allocation for better accuracy'
        ]
      });
    } else if (avgTimePerQuestion > 120) {
      insights.push({
        type: 'improvement',
        title: 'Slow Response Time',
        description: 'You took considerable time per question. Practice can help increase confidence.',
        recommendations: [
          'Review module content to build familiarity',
          'Practice with similar questions',
          'Focus on key concepts for quicker recognition'
        ]
      });
    }

    // Topic analysis
    const weakTopics = Object.entries(topicPerformance)
      .filter(([_, performance]) => (performance.correct / performance.total) < 0.7)
      .map(([topic, _]) => topic);

    if (weakTopics.length > 0) {
      insights.push({
        type: 'weakness',
        title: 'Topic Gaps Identified',
        description: `Consider reviewing: ${weakTopics.join(', ')}`,
        recommendations: [
          'Revisit module sections covering these topics',
          'Take additional practice quizzes',
          'Focus on practical applications of concepts'
        ]
      });
    }

    // Difficulty analysis
    const hardQuestions = results.filter(r => r.difficulty === 'hard');
    const hardCorrect = hardQuestions.filter(r => r.isCorrect).length;
    
    if (hardQuestions.length > 0 && (hardCorrect / hardQuestions.length) > 0.8) {
      insights.push({
        type: 'strength',
        title: 'Advanced Mastery',
        description: 'Excellent performance on challenging questions!',
        recommendations: [
          'Consider exploring advanced topics',
          'Share knowledge with peers',
          'Take on complex real-world scenarios'
        ]
      });
    }

    // Overall performance
    if (percentage >= 90) {
      insights.push({
        type: 'strength',
        title: 'Outstanding Performance',
        description: 'You demonstrate excellent mastery of the material.',
        recommendations: [
          'Help other learners with concepts',
          'Explore advanced case studies',
          'Apply knowledge in practical scenarios'
        ]
      });
    } else if (percentage < 70) {
      insights.push({
        type: 'improvement',
        title: 'Focus on Fundamentals',
        description: 'Strengthening core concepts will improve overall performance.',
        recommendations: [
          'Review module videos and notes',
          'Complete practice exercises',
          'Seek clarification on unclear concepts'
        ]
      });
    }

    return insights;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLevel = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Header with overall results */}
      <Card className={`relative overflow-hidden ${passed ? 'border-green-500' : 'border-red-500'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}
          </CardTitle>
          <p className="text-muted-foreground">
            {moduleTitle} - Quiz Results
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                {Math.round(percentage)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Grade: {getGradeLevel(percentage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-2xl font-bold">
                {correctAnswers}/{results.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold">
                {formatTime(timeSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={passed ? 'default' : 'destructive'} className="text-sm">
                {passed ? 'PASSED' : 'NEEDS REVIEW'}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button 
          variant={selectedTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={selectedTab === 'detailed' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('detailed')}
        >
          Detailed Review
        </Button>
        <Button 
          variant={selectedTab === 'insights' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('insights')}
        >
          Insights
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Topic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Performance by Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(topicPerformance).map(([topic, performance]) => {
                    const topicPercentage = (performance.correct / performance.total) * 100;
                    return (
                      <div key={topic} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{topic}</span>
                          <span className="text-sm text-muted-foreground">
                            {performance.correct}/{performance.total} ({Math.round(topicPercentage)}%)
                          </span>
                        </div>
                        <Progress value={topicPercentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(difficultyPerformance).map(([difficulty, performance]) => {
                    const difficultyPercentage = (performance.correct / performance.total) * 100;
                    return (
                      <div key={difficulty} className="text-center">
                        <p className="font-medium capitalize">{difficulty}</p>
                        <p className="text-2xl font-bold">
                          {Math.round(difficultyPercentage)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {performance.correct}/{performance.total}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {results.map((result, index) => (
              <Card key={result.questionId} className={`border-l-4 ${result.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {result.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{result.difficulty}</Badge>
                          <Badge variant="outline">{result.topic}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm">{result.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Your Answer:</p>
                          <p className={`text-sm ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {typeof result.userAnswer === 'object' ? JSON.stringify(result.userAnswer) : result.userAnswer}
                          </p>
                        </div>
                        {!result.isCorrect && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Correct Answer:</p>
                            <p className="text-sm text-green-600">
                              {typeof result.correctAnswer === 'object' ? JSON.stringify(result.correctAnswer) : result.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {result.explanation && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            <Lightbulb className="h-4 w-4 inline mr-2" />
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {selectedTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.type === 'strength' ? 'border-green-500' : 
                insight.type === 'weakness' ? 'border-red-500' : 'border-blue-500'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {insight.type === 'strength' && <Award className="h-6 w-6 text-green-600" />}
                      {insight.type === 'weakness' && <Target className="h-6 w-6 text-red-600" />}
                      {insight.type === 'improvement' && <TrendingUp className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!passed && onRetake && (
              <Button onClick={onRetake} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            )}
            {onReview && (
              <Button onClick={onReview} variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Review Module
              </Button>
            )}
            {passed && onContinue && (
              <Button onClick={onContinue} className="flex items-center gap-2">
                Continue Learning
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};