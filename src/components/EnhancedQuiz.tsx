import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Clock, CheckCircle, XCircle, Trophy, Star, Brain, Target, Lightbulb, Timer, RotateCcw, ChevronRight, ChevronLeft, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
export type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'drag-drop' | 'slider' | 'fill-blank' | 'scenario';
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers?: (string | number)[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
  // For drag-drop questions
  items?: string[];
  categories?: string[];
  // For slider questions
  min?: number;
  max?: number;
  // For scenario questions
  scenario?: string;
  // For fill-in-the-blank
  blanks?: string[];
}
interface EnhancedQuizProps {
  moduleId: string;
  moduleTitle: string;
  questions: QuizQuestion[];
  timeLimit?: number; // Total quiz time in minutes
  passingScore?: number; // Percentage needed to pass
  maxAttempts?: number;
  onComplete?: (passed: boolean, score: number, results: any) => void;
  showHints?: boolean;
  allowReview?: boolean;
}
interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  timeSpent: number;
  answersDetail: {
    questionId: string;
    correct: boolean;
    userAnswer: any;
    correctAnswer: any;
    points: number;
  }[];
}
export const EnhancedQuiz = ({
  moduleId,
  moduleTitle,
  questions,
  timeLimit = 30,
  passingScore = 70,
  maxAttempts = 3,
  onComplete,
  showHints = true,
  allowReview = true
}: EnhancedQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const {
    toast
  } = useToast();
  const currentQ = questions[currentQuestion];

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
        setCurrentQuestionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const startQuiz = () => {
    setQuizStarted(true);
    setAttemptCount(prev => prev + 1);
    toast({
      title: "Quiz Started! 🚀",
      description: `You have ${timeLimit} minutes to complete this quiz. Good luck!`
    });
  };
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
    setTimeRemaining(timeLimit * 60);
    setQuestionTimeSpent({});
    setCurrentQuestionTime(0);
    setResults(null);
    setShowExplanation(false);
    setConfidence({});
    setFlaggedQuestions(new Set());
  };
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  const handleConfidence = (questionId: string, level: number) => {
    setConfidence(prev => ({
      ...prev,
      [questionId]: level
    }));
  };
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Save time spent on current question
      setQuestionTimeSpent(prev => ({
        ...prev,
        [currentQ.id]: currentQuestionTime
      }));
      setCurrentQuestionTime(0);
      setCurrentQuestion(prev => prev + 1);
      setShowHint(false);
    }
  };
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowHint(false);
    }
  };
  const calculateResults = (): QuizResults => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersDetail = questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = checkAnswer(q, userAnswer);
      totalPoints += q.points;
      if (isCorrect) {
        correctCount++;
        earnedPoints += q.points;
      }
      return {
        questionId: q.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: q.correctAnswers,
        points: isCorrect ? q.points : 0
      };
    });
    const percentage = totalPoints > 0 ? earnedPoints / totalPoints * 100 : 0;
    const timeSpent = timeLimit * 60 - timeRemaining;
    return {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: earnedPoints,
      percentage,
      timeSpent,
      answersDetail
    };
  };
  const checkAnswer = (question: QuizQuestion, userAnswer: any): boolean => {
    if (!userAnswer || !question.correctAnswers) return false;
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswers[0];
      case 'multiple-select':
        const userSet = new Set(userAnswer);
        const correctSet = new Set(question.correctAnswers);
        return userSet.size === correctSet.size && [...userSet].every(x => correctSet.has(x as string | number));
      case 'short-answer':
        return question.correctAnswers.some(correct => userAnswer.toLowerCase().trim() === String(correct).toLowerCase().trim());
      case 'slider':
        const tolerance = ((question.max || 100) - (question.min || 0)) * 0.05; // 5% tolerance
        const targetValue = Number(question.correctAnswers[0]);
        const userValue = Number(userAnswer);
        return Math.abs(userValue - targetValue) <= tolerance;
      case 'fill-blank':
        const userBlanks = userAnswer || [];
        return question.correctAnswers.every((correct: any, index: number) => userBlanks[index]?.toLowerCase().trim() === String(correct).toLowerCase().trim());
      default:
        return false;
    }
  };
  const handleSubmitQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setQuizCompleted(true);
    const passed = quizResults.percentage >= passingScore;
    onComplete?.(passed, quizResults.score, quizResults);
    toast({
      title: passed ? "🎉 Quiz Passed!" : "📝 Quiz Completed",
      description: passed ? `Congratulations! You scored ${quizResults.percentage.toFixed(1)}%` : `You scored ${quizResults.percentage.toFixed(1)}%. Keep studying!`,
      variant: passed ? "default" : "destructive"
    });
  };
  const getProgressPercentage = () => {
    const answered = Object.keys(answers).length;
    return answered / questions.length * 100;
  };
  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];
    switch (question.type) {
      case 'multiple-choice':
        return <RadioGroup value={userAnswer || ""} onValueChange={value => handleAnswer(question.id, value)}>
            {question.options?.map((option, index) => <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>)}
          </RadioGroup>;
      case 'multiple-select':
        return <div className="space-y-3">
            {question.options?.map((option, index) => <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${question.id}-${index}`} checked={(userAnswer || []).includes(option)} onCheckedChange={checked => {
              const currentAnswers = userAnswer || [];
              if (checked) {
                handleAnswer(question.id, [...currentAnswers, option]);
              } else {
                handleAnswer(question.id, currentAnswers.filter((a: string) => a !== option));
              }
            }} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>)}
          </div>;
      case 'true-false':
        return <RadioGroup value={userAnswer || ""} onValueChange={value => handleAnswer(question.id, value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`} className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`} className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>;
      case 'short-answer':
        return <Input placeholder="Enter your answer..." value={userAnswer || ""} onChange={e => handleAnswer(question.id, e.target.value)} />;
      case 'essay':
        return <Textarea placeholder="Write your detailed answer here..." value={userAnswer || ""} onChange={e => handleAnswer(question.id, e.target.value)} rows={6} />;
      case 'slider':
        return <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold">{userAnswer || question.min}</span>
            </div>
            <Slider value={[userAnswer || question.min!]} onValueChange={([value]) => handleAnswer(question.id, value)} min={question.min} max={question.max} step={1} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.min}</span>
              <span>{question.max}</span>
            </div>
          </div>;
      case 'fill-blank':
        return <div className="space-y-3">
            {question.blanks?.map((blank, index) => <div key={index} className="flex items-center gap-2">
                <Label className="min-w-0 flex-1">{blank}:</Label>
                <Input placeholder="Fill in the blank..." value={(userAnswer || [])[index] || ""} onChange={e => {
              const currentAnswers = userAnswer || [];
              const newAnswers = [...currentAnswers];
              newAnswers[index] = e.target.value;
              handleAnswer(question.id, newAnswers);
            }} className="flex-1" />
              </div>)}
          </div>;
      case 'scenario':
        return <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Scenario:</h4>
              <p className="text-muted-foreground">{question.scenario}</p>
            </div>
            <Textarea placeholder="Describe how you would handle this scenario..." value={userAnswer || ""} onChange={e => handleAnswer(question.id, e.target.value)} rows={4} />
          </div>;
      default:
        return <div>Question type not supported</div>;
    }
  };

  // Quiz start screen
  if (!quizStarted) {
    return <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{moduleTitle} - Quiz</CardTitle>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {questions.length} Questions
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {timeLimit} Minutes
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {passingScore}% to Pass
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Test your knowledge with this comprehensive quiz. You'll have {timeLimit} minutes to complete all questions.
            </p>
            
            {attemptCount > 0 && <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  Attempt: {attemptCount} of {maxAttempts}
                  {attemptCount >= maxAttempts && " (Final Attempt)"}
                </p>
              </div>}

            {attemptCount >= maxAttempts ? <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-destructive">You have reached the maximum number of attempts.</p>
              </div> : <Button onClick={startQuiz} size="lg" className="w-full max-w-xs bg-blue-800 hover:bg-blue-700">
                Start Quiz
              </Button>}
          </div>
        </CardContent>
      </Card>;
  }

  // Quiz results screen
  if (quizCompleted && results) {
    const passed = results.percentage >= passingScore;
    return <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {passed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Congratulations! 🎉" : "Quiz Complete 📝"}
          </CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{results.percentage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{results.correctAnswers}/{results.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(results.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{attemptCount}</div>
              <div className="text-sm text-muted-foreground">Attempts</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {allowReview && <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Answers</h3>
              {results.answersDetail.map((answer, index) => {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) return null;
            return <Card key={answer.questionId} className={`border-l-4 ${answer.correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Badge variant={answer.correct ? "success" : "destructive"}>
                          {answer.correct ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                      <p className="mb-3">{question.question}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Your Answer: </span>
                          <span className={answer.correct ? "text-green-600" : "text-red-600"}>
                            {Array.isArray(answer.userAnswer) ? answer.userAnswer.join(", ") : String(answer.userAnswer || "No answer")}
                          </span>
                        </div>
                        {!answer.correct && <div>
                            <span className="font-medium">Correct Answer: </span>
                            <span className="text-green-600">
                              {Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(", ") : String(answer.correctAnswer)}
                            </span>
                          </div>}
                        {question.explanation && <div className="mt-3 p-3 bg-muted rounded">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </div>}
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div>}

          <div className="flex justify-center gap-4">
            {attemptCount < maxAttempts && !passed && <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>}
            <Button onClick={() => window.history.back()}>
              Back to Module
            </Button>
          </div>
        </CardContent>
      </Card>;
  }

  // Quiz question screen
  return <Card className="max-w-4xl mx-auto">
      <CardHeader>
        {/* Quiz Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <Badge variant={currentQ.difficulty === 'easy' ? 'success' : currentQ.difficulty === 'medium' ? 'default' : 'destructive'}>
              {currentQ.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {currentQ.points} pts
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => toggleFlag(currentQ.id)} className={flaggedQuestions.has(currentQ.id) ? "text-yellow-600" : ""}>
              🚩 {flaggedQuestions.has(currentQ.id) ? "Flagged" : "Flag"}
            </Button>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 300 ? "text-red-600 font-medium" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}% answered</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }} className="space-y-6">
            {/* Question */}
            <div>
              <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>
              {currentQ.type === 'scenario' && currentQ.scenario && <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Scenario:</h4>
                  <p className="text-muted-foreground">{currentQ.scenario}</p>
                </div>}
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {renderQuestion(currentQ)}
            </div>

            {/* Confidence Level */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium mb-3 block">
                How confident are you in your answer?
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Not Confident</span>
                <Slider value={[confidence[currentQ.id] || 50]} onValueChange={([value]) => handleConfidence(currentQ.id, value)} max={100} step={10} className="flex-1" />
                <span className="text-sm">Very Confident</span>
              </div>
            </div>

            {/* Hint */}
            {showHints && <div className="space-y-2">
                <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="text-blue-600 hover:text-blue-700">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHint ? "Hide" : "Show"} Hint
                </Button>
                
                {showHint && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: "auto"
            }} exit={{
              opacity: 0,
              height: 0
            }} className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
                    <p className="text-sm text-blue-800">
                      💡 Think about the key concepts we covered in this module. Consider all options carefully.
                    </p>
                  </motion.div>}
              </div>}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* Question Navigation Dots */}
            <div className="flex gap-1">
              {questions.map((_, index) => <button key={index} onClick={() => setCurrentQuestion(index)} className={`w-3 h-3 rounded-full transition-colors ${index === currentQuestion ? "bg-primary" : answers[questions[index].id] ? "bg-green-500" : flaggedQuestions.has(questions[index].id) ? "bg-yellow-500" : "bg-muted"}`} />)}
            </div>
          </div>

          {currentQuestion === questions.length - 1 ? <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700">
              Submit Quiz
              <Award className="h-4 w-4 ml-2" />
            </Button> : <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>}
        </div>
      </CardContent>
    </Card>;
};