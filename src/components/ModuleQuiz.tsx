import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Award, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ModuleQuizProps {
  moduleId: string;
  moduleTitle: string;
  totalQuestions: number;
  onComplete?: (passed: boolean, score: number) => void;
}

const getQuizData = (moduleId: string): Question[] => {
  // Sample questions - in a real app this would come from a database
  const quizQuestions: Record<string, Question[]> = {
    foundations: [
      {
        id: 1,
        question: "What is the primary purpose of financial analysis?",
        options: [
          "To calculate taxes",
          "To evaluate the financial health and performance of a business",
          "To create marketing strategies",
          "To manage human resources"
        ],
        correctAnswer: 1,
        explanation: "Financial analysis helps assess a company's financial health, profitability, and overall performance to make informed business decisions."
      },
      {
        id: 2,
        question: "Which financial statement shows a company's assets, liabilities, and equity at a specific point in time?",
        options: [
          "Income Statement",
          "Cash Flow Statement",
          "Balance Sheet",
          "Statement of Retained Earnings"
        ],
        correctAnswer: 2,
        explanation: "The Balance Sheet provides a snapshot of a company's financial position at a specific date, showing what it owns (assets) and owes (liabilities)."
      },
      {
        id: 3,
        question: "What does ROI stand for?",
        options: [
          "Return on Investment",
          "Rate of Interest",
          "Revenue over Income",
          "Risk of Investment"
        ],
        correctAnswer: 0,
        explanation: "ROI (Return on Investment) measures the gain or loss generated on an investment relative to the amount invested."
      },
      {
        id: 4,
        question: "Which ratio measures a company's ability to pay short-term obligations?",
        options: [
          "Debt-to-equity ratio",
          "Current ratio",
          "Profit margin",
          "Price-to-earnings ratio"
        ],
        correctAnswer: 1,
        explanation: "The current ratio compares current assets to current liabilities, indicating the company's ability to pay short-term debts."
      },
      {
        id: 5,
        question: "What is working capital?",
        options: [
          "Total assets minus total liabilities",
          "Current assets minus current liabilities", 
          "Revenue minus expenses",
          "Cash and cash equivalents only"
        ],
        correctAnswer: 1,
        explanation: "Working capital is the difference between current assets and current liabilities, representing the short-term financial health of a company."
      },
      {
        id: 6,
        question: "Which of the following is NOT a component of the income statement?",
        options: [
          "Revenue",
          "Cost of Goods Sold",
          "Accounts Receivable",
          "Operating Expenses"
        ],
        correctAnswer: 2,
        explanation: "Accounts Receivable is a balance sheet item, not an income statement component. The income statement shows revenues, expenses, and profits over a period."
      },
      {
        id: 7,
        question: "What does EBITDA stand for?",
        options: [
          "Earnings Before Interest, Taxes, Depreciation, and Amortization",
          "Equity Before Income Tax Deduction Analysis",
          "Enterprise Business Income and Debt Analysis",
          "Economic Benefit of Investment Tax Deduction Allowance"
        ],
        correctAnswer: 0,
        explanation: "EBITDA measures a company's operational performance by excluding non-operational expenses like interest, taxes, depreciation, and amortization."
      },
      {
        id: 8,
        question: "Which financial statement shows how cash moves in and out of a business?",
        options: [
          "Balance Sheet",
          "Income Statement",
          "Cash Flow Statement",
          "Statement of Equity"
        ],
        correctAnswer: 2,
        explanation: "The Cash Flow Statement tracks the actual cash receipts and payments, showing operating, investing, and financing activities."
      },
      {
        id: 9,
        question: "What is the debt-to-equity ratio used to measure?",
        options: [
          "Profitability",
          "Liquidity",
          "Financial leverage",
          "Market performance"
        ],
        correctAnswer: 2,
        explanation: "The debt-to-equity ratio measures financial leverage by comparing total debt to total equity, indicating how much debt a company uses to finance its assets."
      },
      {
        id: 10,
        question: "Which principle requires that expenses be recorded when incurred, not when cash is paid?",
        options: [
          "Revenue Recognition Principle",
          "Matching Principle",
          "Conservatism Principle",
          "Materiality Principle"
        ],
        correctAnswer: 1,
        explanation: "The Matching Principle requires that expenses be recorded in the same period as the revenues they help generate, regardless of when cash changes hands."
      }
    ]
  };

  return quizQuestions[moduleId] || [];
};

export const ModuleQuiz = ({ moduleId, moduleTitle, totalQuestions, onComplete }: ModuleQuizProps) => {
  const [questions] = useState<Question[]>(getQuizData(moduleId));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !showResults && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !showResults) {
      handleFinishQuiz();
    }

    return () => clearTimeout(timer);
  }, [quizStarted, showResults, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
    }
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
    
    // Calculate score and trigger completion logic
    const score = calculateScore();
    const passed = score >= 80;
    
    // Show celebration toast for passing
    if (passed) {
      toast({
        title: "🎉 Congratulations!",
        description: `Amazing work! You scored ${score}% and passed the ${moduleTitle} quiz. You've unlocked the next module!`,
        variant: "default",
        duration: 6000,
      });
    } else {
      toast({
        title: "Keep Learning!",
        description: `You scored ${score}%. Review the material and try again to unlock the next module.`,
        variant: "destructive",
        duration: 4000,
      });
    }
    
    // Trigger the completion callback
    onComplete?.(passed, score);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setTimeRemaining(30 * 60);
  };

  if (!questions.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Quiz Not Available</h3>
          <p className="text-muted-foreground">Questions for this module are being prepared.</p>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Quiz</CardTitle>
          <CardDescription>Test your knowledge of {moduleTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">80%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">30 min</div>
                <div className="text-sm text-muted-foreground">Time Limit</div>
              </div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select the best answer for each question</li>
                <li>• You can navigate between questions and change answers</li>
                <li>• You need 80% or higher to pass</li>
                <li>• The quiz will auto-submit when time runs out</li>
              </ul>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setQuizStarted(true)}
            >
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 80;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Quiz Completed - Passed!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Quiz Completed - Try Again
              </>
            )}
          </CardTitle>
          <CardDescription>
            Your final score: {score}% ({selectedAnswers.filter((answer, i) => answer === questions[i].correctAnswer).length} out of {questions.length} correct)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <Badge 
                variant={passed ? "success" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {score}%
              </Badge>
              <p className="mt-2 text-muted-foreground">
                {passed ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Outstanding! You've mastered this module and unlocked the next one!
                    <Star className="h-4 w-4 text-yellow-500" />
                  </span>
                ) : (
                  "You need 80% or higher to pass. Review the material and try again."
                )}
              </p>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h4 className="font-medium">Question Review:</h4>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">Q{index + 1}: {question.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: {userAnswer !== undefined ? question.options[userAnswer] : "Not answered"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button onClick={restartQuiz} variant="outline" className="flex-1">
                Retake Quiz
              </Button>
              {passed && (
                <Button className="flex-1">
                  Continue to Next Module
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <CardDescription>Choose the best answer</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            
            <RadioGroup 
              value={selectedAnswers[currentQuestion]?.toString()} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestion === questions.length - 1 ? (
                <Button 
                  onClick={handleFinishQuiz}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                >
                  Finish Quiz
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Question Navigation:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestion === index ? "default" : selectedAnswers[index] !== undefined ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                  className="w-10 h-10"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};