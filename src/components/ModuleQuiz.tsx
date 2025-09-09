import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { EnhancedQuiz, QuizQuestion } from '@/components/EnhancedQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, RotateCcw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ModuleQuizProps {
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  onQuizComplete?: (passed: boolean) => void;
}

// Generate finance-specific questions for each module
const generateModuleQuestions = (moduleId: string, moduleTitle: string): QuizQuestion[] => {
  const baseQuestions: Record<string, QuizQuestion[]> = {
    // Commercial Lending Fundamentals
    'commercial-lending-fundamentals': [
      {
        id: 'cl-1',
        type: 'multiple-choice',
        question: 'What is the primary purpose of a debt service coverage ratio (DSCR) in commercial lending?',
        options: [
          'To determine the borrower\'s personal credit score',
          'To measure the borrower\'s ability to service debt payments from cash flow',
          'To calculate the loan-to-value ratio',
          'To assess the collateral value'
        ],
        correctAnswers: ['To measure the borrower\'s ability to service debt payments from cash flow'],
        explanation: 'DSCR measures whether a borrower generates sufficient cash flow to cover debt service payments.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'cl-2',
        type: 'multiple-choice',
        question: 'Which of the following is NOT one of the "5 Cs" of credit analysis?',
        options: ['Character', 'Capacity', 'Capital', 'Competition', 'Collateral'],
        correctAnswers: ['Competition'],
        explanation: 'The 5 Cs are Character, Capacity, Capital, Collateral, and Conditions.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'cl-3',
        type: 'true-false',
        question: 'A loan-to-value (LTV) ratio of 80% means the borrower is financing 80% of the property value.',
        correctAnswers: ['true'],
        explanation: 'LTV of 80% indicates the loan amount is 80% of the property\'s appraised value.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'cl-4',
        type: 'multiple-choice',
        question: 'What is a typical minimum DSCR requirement for most commercial loans?',
        options: ['1.0x', '1.15x', '1.25x', '1.50x'],
        correctAnswers: ['1.25x'],
        explanation: 'Most lenders require a minimum DSCR of 1.25x to ensure adequate cash flow coverage.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'cl-5',
        type: 'multiple-select',
        question: 'Which financial statements are typically required for commercial loan underwriting?',
        options: [
          'Income Statement (P&L)',
          'Balance Sheet',
          'Cash Flow Statement',
          'Tax Returns',
          'Personal Budget'
        ],
        correctAnswers: ['Income Statement (P&L)', 'Balance Sheet', 'Cash Flow Statement', 'Tax Returns'],
        explanation: 'All these financial documents except personal budget are standard requirements.',
        points: 20,
        difficulty: 'medium'
      },
      {
        id: 'cl-6',
        type: 'short-answer',
        question: 'What does NOI stand for in commercial real estate lending?',
        correctAnswers: ['Net Operating Income', 'net operating income'],
        explanation: 'NOI (Net Operating Income) is gross income minus operating expenses.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'cl-7',
        type: 'scenario',
        question: 'A borrower has NOI of $100,000 and annual debt service of $75,000. What is their DSCR and would this typically qualify for commercial financing?',
        scenario: 'Property generates $150,000 gross income with $50,000 in operating expenses.',
        correctAnswers: ['1.33x DSCR, typically qualifies'],
        explanation: 'DSCR = $100,000 / $75,000 = 1.33x, which exceeds the typical 1.25x minimum.',
        points: 20,
        difficulty: 'hard'
      }
    ],

    // SBA Lending Basics
    'sba-lending-basics': [
      {
        id: 'sba-1',
        type: 'multiple-choice',
        question: 'What is the maximum loan amount for an SBA 7(a) loan?',
        options: ['$5 million', '$10 million', '$15 million', '$25 million'],
        correctAnswers: ['$5 million'],
        explanation: 'The SBA 7(a) program has a maximum loan amount of $5 million.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'sba-2',
        type: 'multiple-choice',
        question: 'What percentage of an SBA 7(a) loan does the SBA typically guarantee?',
        options: ['50%', '75%', '85%', '90%'],
        correctAnswers: ['75%'],
        explanation: 'For loans over $150,000, the SBA guarantees 75% of the loan amount.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'sba-3',
        type: 'true-false',
        question: 'SBA loans can be used to refinance existing debt under certain circumstances.',
        correctAnswers: ['true'],
        explanation: 'SBA allows refinancing under specific conditions, such as when it benefits the borrower.',
        points: 10,
        difficulty: 'medium'
      },
      {
        id: 'sba-4',
        type: 'multiple-select',
        question: 'Which of the following are eligible uses for SBA 7(a) loans?',
        options: [
          'Working capital',
          'Equipment purchase',
          'Real estate acquisition',
          'Debt refinancing',
          'Speculative investments'
        ],
        correctAnswers: ['Working capital', 'Equipment purchase', 'Real estate acquisition', 'Debt refinancing'],
        explanation: 'All except speculative investments are eligible uses for SBA 7(a) loans.',
        points: 20,
        difficulty: 'medium'
      },
      {
        id: 'sba-5',
        type: 'multiple-choice',
        question: 'What is the personal guarantee requirement for SBA loans?',
        options: [
          'No personal guarantee required',
          'Personal guarantee required for owners with 10% or more ownership',
          'Personal guarantee required for owners with 20% or more ownership',
          'Personal guarantee required for all owners'
        ],
        correctAnswers: ['Personal guarantee required for owners with 20% or more ownership'],
        explanation: 'Owners with 20% or more ownership must provide personal guarantees.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'sba-6',
        type: 'short-answer',
        question: 'What does SBA stand for?',
        correctAnswers: ['Small Business Administration', 'small business administration'],
        explanation: 'SBA is the Small Business Administration, a federal agency.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'sba-7',
        type: 'scenario',
        question: 'A business needs $2 million for equipment and working capital. They qualify for SBA financing. How much would the bank be at risk for with the SBA guarantee?',
        scenario: 'Loan amount: $2 million, SBA 7(a) program',
        correctAnswers: ['$500,000', '500000', '$500k'],
        explanation: 'Bank risk = $2M × 25% (non-guaranteed portion) = $500,000.',
        points: 20,
        difficulty: 'hard'
      }
    ],

    // Default questions for any other module
    'default': [
      {
        id: 'def-1',
        type: 'multiple-choice',
        question: 'What is the primary goal of commercial lending?',
        options: [
          'To maximize interest income',
          'To provide capital while managing risk',
          'To compete with other lenders',
          'To build customer relationships only'
        ],
        correctAnswers: ['To provide capital while managing risk'],
        explanation: 'Commercial lending balances providing needed capital with prudent risk management.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'def-2',
        type: 'true-false',
        question: 'Cash flow analysis is more important than collateral value in commercial lending.',
        correctAnswers: ['true'],
        explanation: 'While collateral is important, cash flow determines the borrower\'s ability to repay.',
        points: 10,
        difficulty: 'medium'
      },
      {
        id: 'def-3',
        type: 'multiple-choice',
        question: 'Which document typically provides the most accurate picture of a company\'s financial performance?',
        options: ['Balance Sheet', 'Income Statement', 'Tax Returns', 'Bank Statements'],
        correctAnswers: ['Tax Returns'],
        explanation: 'Tax returns are audited by the IRS and generally provide the most accurate financial picture.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'def-4',
        type: 'multiple-select',
        question: 'What factors should be considered when pricing a commercial loan?',
        options: [
          'Risk level of the borrower',
          'Market interest rates',
          'Loan term and structure',
          'Relationship value',
          'Borrower\'s favorite color'
        ],
        correctAnswers: ['Risk level of the borrower', 'Market interest rates', 'Loan term and structure', 'Relationship value'],
        explanation: 'All factors except the borrower\'s favorite color affect loan pricing.',
        points: 20,
        difficulty: 'medium'
      },
      {
        id: 'def-5',
        type: 'short-answer',
        question: 'What does LTV stand for in lending terms?',
        correctAnswers: ['Loan to Value', 'loan to value', 'Loan-to-Value'],
        explanation: 'LTV (Loan-to-Value) ratio compares the loan amount to the asset\'s value.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'def-6',
        type: 'multiple-choice',
        question: 'What is typically the first step in the commercial loan underwriting process?',
        options: [
          'Ordering an appraisal',
          'Initial credit review and pre-qualification',
          'Collecting financial statements',
          'Setting loan terms'
        ],
        correctAnswers: ['Initial credit review and pre-qualification'],
        explanation: 'Pre-qualification helps determine if the loan request is worth pursuing further.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'def-7',
        type: 'scenario',
        question: 'A borrower requests a $1M loan against a property valued at $1.5M. What is the LTV ratio and is this typically acceptable?',
        scenario: 'Loan request: $1,000,000, Property value: $1,500,000',
        correctAnswers: ['66.67% LTV, typically acceptable', '67% LTV, acceptable'],
        explanation: 'LTV = $1M / $1.5M = 66.67%, which is well within typical lending guidelines.',
        points: 20,
        difficulty: 'hard'
      }
    ]
  };

  // Return module-specific questions or default questions
  return baseQuestions[moduleId] || baseQuestions['default'];
};

export const ModuleQuiz: React.FC<ModuleQuizProps> = ({
  moduleId,
  moduleTitle,
  courseId,
  onQuizComplete
}) => {
  const { user } = useAuth();
  const { completeModule } = useCourseProgress(user?.id, courseId);
  const { toast } = useToast();
  
  const [quizQuestions] = useState<QuizQuestion[]>(() => 
    generateModuleQuestions(moduleId, moduleTitle)
  );
  const [quizStatus, setQuizStatus] = useState<{
    completed: boolean;
    passed: boolean;
    score: number;
    attempts: number;
  }>({ completed: false, passed: false, score: 0, attempts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadQuizStatus();
    }
  }, [user?.id, moduleId]);

  const loadQuizStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('quiz_completed, quiz_score, quiz_attempts')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setQuizStatus({
          completed: data.quiz_completed || false,
          passed: (data.quiz_score || 0) >= 70,
          score: data.quiz_score || 0,
          attempts: data.quiz_attempts || 0
        });
      }
    } catch (error) {
      console.error('Error loading quiz status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (passed: boolean, score: number, results: any) => {
    if (!user?.id) return;

    try {
      const newAttempts = quizStatus.attempts + 1;
      
      // Update course progress with quiz results
      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          quiz_completed: passed,
          quiz_score: score,
          quiz_attempts: newAttempts,
          progress_percentage: passed ? 100 : 50, // 100% if passed, 50% if not
          completed_at: passed ? new Date().toISOString() : null
        });

      if (error) throw error;

      // Update local state
      setQuizStatus({
        completed: passed,
        passed,
        score,
        attempts: newAttempts
      });

      // If passed, complete the module
      if (passed) {
        await completeModule(moduleId, courseId);
        toast({
          title: "🎉 Module Completed!",
          description: `Congratulations! You've successfully completed ${moduleTitle} with a score of ${score}%.`,
        });
        onQuizComplete?.(true);
      } else {
        toast({
          title: "Quiz Complete",
          description: `You scored ${score}%. You need 70% or higher to pass and proceed to the next module.`,
          variant: "destructive"
        });
        onQuizComplete?.(false);
      }
    } catch (error) {
      console.error('Error updating quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetQuiz = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          quiz_completed: false,
          quiz_score: 0,
          progress_percentage: 10 // Reset to started state
        });

      if (error) throw error;

      setQuizStatus({
        completed: false,
        passed: false,
        score: 0,
        attempts: quizStatus.attempts
      });

      toast({
        title: "Quiz Reset",
        description: "You can now retake the quiz.",
      });
    } catch (error) {
      console.error('Error resetting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to reset quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading quiz...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz completed and passed
  if (quizStatus.completed && quizStatus.passed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passed
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                Score: {quizStatus.score}%
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                Attempts: {quizStatus.attempts}
              </Badge>
            </div>
            
            <Progress value={100} className="w-full" />
            
            <p className="text-muted-foreground">
              Excellent work! You've successfully completed the {moduleTitle} quiz and can now proceed to the next module.
            </p>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={resetQuiz}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz failed or not completed
  if (quizStatus.attempts >= 3 && !quizStatus.passed) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Maximum Attempts Reached</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You've reached the maximum number of quiz attempts (3). Please review the module content and contact your instructor for assistance.
            </p>
            
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                Last Score: {quizStatus.score}%
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                Attempts: {quizStatus.attempts}/3
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quiz interface
  return (
    <div className="space-y-6">
      {quizStatus.attempts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  Previous Score: {quizStatus.score}%
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                  Attempt: {quizStatus.attempts + 1}/3
                </Badge>
              </div>
              <Button onClick={resetQuiz} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <EnhancedQuiz
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        questions={quizQuestions}
        timeLimit={30} // 30 minutes
        passingScore={70} // 70% to pass
        maxAttempts={3}
        onComplete={handleQuizComplete}
        showHints={true}
        allowReview={true}
      />
    </div>
  );
};

export default ModuleQuiz;