import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'multiple_select';
  question: string;
  options: string[];
  correct_answers: string[];
  explanation?: string;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  time_limit_minutes: number | null;
  passing_score: number;
  max_attempts: number;
  questions: Question[];
}

interface AssessmentQuizProps {
  assessmentId: string;
  onComplete?: (passed: boolean, score: number) => void;
}

interface UserAnswers {
  [questionId: string]: string | string[];
}

export function AssessmentQuiz({ assessmentId, onComplete }: AssessmentQuizProps) {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("course_assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;

      setAssessment({
        ...data,
        questions: (data.questions as unknown) as Question[]
      });
      if (data.time_limit_minutes) {
        setTimeLeft(data.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!assessment) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = userAnswers[question.id];
      
      if (!userAnswer) return;

      if (question.type === 'multiple_select') {
        const userSelections = Array.isArray(userAnswer) ? userAnswer : [];
        const correctAnswers = question.correct_answers;
        
        if (userSelections.length === correctAnswers.length &&
            userSelections.every(answer => correctAnswers.includes(answer))) {
          earnedPoints += question.points;
        }
      } else {
        if (question.correct_answers.includes(userAnswer as string)) {
          earnedPoints += question.points;
        }
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmit = async () => {
    if (!assessment || submitting || !user) return;

    setSubmitting(true);
    const finalScore = calculateScore();
    const passed = finalScore >= assessment.passing_score;

    try {
      // Get current attempt number
      const { data: attempts } = await supabase
        .from("assessment_attempts")
        .select("attempt_number")
        .eq("assessment_id", assessmentId)
        .order("attempt_number", { ascending: false })
        .limit(1);

      const attemptNumber = (attempts && attempts.length > 0) ? attempts[0].attempt_number + 1 : 1;

      // Save attempt
      await supabase
        .from("assessment_attempts")
        .insert({
          user_id: user.id, // Add required user_id field
          assessment_id: assessmentId,
          attempt_number: attemptNumber,
          answers: userAnswers,
          score: finalScore,
          is_passed: passed,
          time_taken_minutes: assessment.time_limit_minutes 
            ? assessment.time_limit_minutes - (timeLeft ? Math.floor(timeLeft / 60) : 0)
            : null
        });

      setScore(finalScore);
      setShowResults(true);
      onComplete?.(passed, finalScore);

      toast({
        title: passed ? "Assessment Completed!" : "Assessment Failed",
        description: passed 
          ? `Congratulations! You scored ${finalScore}%`
          : `You scored ${finalScore}%. You need ${assessment.passing_score}% to pass.`,
        variant: passed ? "default" : "destructive",
      });

    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Assessment not found</h3>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const passed = score >= assessment.passing_score;
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Assessment Passed!" : "Assessment Failed"}
          </CardTitle>
          <CardDescription>
            Your Score: {score}% | Required: {assessment.passing_score}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="mb-4" />
          {!passed && (
            <p className="text-sm text-muted-foreground text-center">
              You can retake this assessment up to {assessment.max_attempts} times.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = assessment.questions[currentQuestion];
  const isLastQuestion = currentQuestion === assessment.questions.length - 1;
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>{assessment.title}</CardTitle>
            <CardDescription>{assessment.description}</CardDescription>
          </div>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {assessment.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          {question.type === 'multiple_choice' && (
            <RadioGroup
              value={userAnswers[question.id] as string || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true_false' && (
            <RadioGroup
              value={userAnswers[question.id] as string || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`} className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`} className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'multiple_select' && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={
                      Array.isArray(userAnswers[question.id]) &&
                      (userAnswers[question.id] as string[]).includes(option)
                    }
                    onCheckedChange={(checked) => {
                      const currentAnswers = Array.isArray(userAnswers[question.id])
                        ? userAnswers[question.id] as string[]
                        : [];
                      
                      if (checked) {
                        handleAnswerChange(question.id, [...currentAnswers, option]);
                      } else {
                        handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !userAnswers[question.id]}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!userAnswers[question.id]}
            >
              Next Question
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}