import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X, HelpCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeCheckProps {
  element: any;
  onScore: (score: number) => void;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching';
  question: string;
  options?: string[];
  correct: number | string | { [key: string]: string };
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const KnowledgeCheck = ({ element, onScore }: KnowledgeCheckProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [showFeedback, setShowFeedback] = useState<{ [key: number]: boolean }>({});
  const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const questions: Question[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the maximum loan amount for SBA Express loans?',
      options: ['$350,000', '$500,000', '$750,000', '$1,000,000'],
      correct: 1,
      explanation: 'SBA Express loans have a maximum amount of $500,000, which allows for faster processing while maintaining SBA guarantee benefits.',
      hint: 'Think about the balance between loan amount and processing speed.',
      difficulty: 'easy'
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'SBA Express loans require personal guarantees from all owners with 20% or more ownership.',
      options: ['True', 'False'],
      correct: 0,
      explanation: 'True. Personal guarantees are required from all owners with 20% or more ownership in the business.',
      hint: 'Consider the standard SBA guarantee requirements.',
      difficulty: 'medium'
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the typical SBA guarantee percentage for Express loans?',
      options: ['85%', '75%', '50%', '90%'],
      correct: 2,
      explanation: 'SBA Express loans have a 50% SBA guarantee, which is lower than other SBA loan programs but allows for faster processing.',
      hint: 'Express loans trade guarantee percentage for speed.',
      difficulty: 'medium'
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which of the following is NOT a typical use for SBA Express loans?',
      options: [
        'Working capital',
        'Equipment purchase',
        'Real estate acquisition',
        'Speculative investments'
      ],
      correct: 3,
      explanation: 'Speculative investments are not allowed uses for SBA loans. SBA loans must be used for legitimate business purposes.',
      hint: 'Think about what constitutes a legitimate business purpose.',
      difficulty: 'hard'
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleSubmitAnswer = () => {
    const isCorrect = answers[currentQuestion] === question.correct;
    setShowFeedback({ ...showFeedback, [currentQuestion]: true });
    
    toast({
      title: isCorrect ? "Correct!" : "Not quite right",
      description: isCorrect ? "Well done!" : "Review the explanation below",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateFinalScore();
    }
  };

  const calculateFinalScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });
    
    const finalScore = (correct / questions.length) * 100;
    setScore(finalScore);
    setIsComplete(true);
    onScore(finalScore);

    toast({
      title: "Knowledge Check Complete!",
      description: `You scored ${Math.round(finalScore)}% (${correct}/${questions.length} correct)`,
      variant: finalScore >= 70 ? "default" : "destructive"
    });
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowFeedback({});
    setShowHints({});
    setIsComplete(false);
    setScore(0);
  };

  const toggleHint = () => {
    setShowHints({
      ...showHints,
      [currentQuestion]: !showHints[currentQuestion]
    });
  };

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h3 className="text-2xl font-bold">Knowledge Check Complete!</h3>
          <div className={`text-lg px-4 py-2 font-medium ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            Final Score: {Math.round(score)}%
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Results Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {questions.map((q, index) => {
                const isCorrect = answers[index] === q.correct;
                return (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm">Question {index + 1}</span>
                    </div>
                    <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Performance</span>
                <span>{Math.round(score)}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRestart} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button className="flex-1">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{element.title}</h3>
        <p className="text-muted-foreground">{element.description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Question {currentQuestion + 1}
            </CardTitle>
            <span className={`text-sm ${
              question.difficulty === 'easy' ? 'text-green-700' :
              question.difficulty === 'medium' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {question.difficulty}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium">{question.question}</h3>

          {/* Answer Options */}
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestion] === index ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleAnswer(index)}
                disabled={showFeedback[currentQuestion]}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  {showFeedback[currentQuestion] && index === question.correct && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
                  )}
                  {showFeedback[currentQuestion] && 
                   answers[currentQuestion] === index && 
                   index !== question.correct && (
                    <X className="h-4 w-4 ml-auto text-red-500" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Hint */}
          {question.hint && !showFeedback[currentQuestion] && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHint}
                className="text-muted-foreground"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHints[currentQuestion] ? 'Hide Hint' : 'Show Hint'}
              </Button>
            </div>
          )}

          {/* Hint Content */}
          {showHints[currentQuestion] && question.hint && !showFeedback[currentQuestion] && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hint:</strong> {question.hint}
              </p>
            </div>
          )}

          {/* Feedback */}
          {showFeedback[currentQuestion] && (
            <div className={`p-4 rounded-lg ${
              answers[currentQuestion] === question.correct 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {answers[currentQuestion] === question.correct ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold mb-2">
                    {answers[currentQuestion] === question.correct ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between pt-4">
            <div className="flex items-center gap-2">
              {showFeedback[currentQuestion] && (
                <span className={`text-sm font-medium ${answers[currentQuestion] === question.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {answers[currentQuestion] === question.correct ? '+1' : '+0'} point
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {!showFeedback[currentQuestion] && answers[currentQuestion] !== undefined && (
                <Button onClick={handleSubmitAnswer}>
                  Submit Answer
                </Button>
              )}
              {showFeedback[currentQuestion] && (
                <Button onClick={handleNext}>
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Choose the best answer for each question. 
            You can use hints if needed, and detailed explanations will be provided after each answer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};