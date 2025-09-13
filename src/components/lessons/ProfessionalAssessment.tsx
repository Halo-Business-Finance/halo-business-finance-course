import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  type: "multiple-choice" | "scenario" | "calculation";
  question: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

interface ProfessionalAssessmentProps {
  lesson: {
    id: string;
    title: string;
  };
  questions?: Question[];
  onComplete: (passed: boolean, score: number) => void;
  passingScore?: number;
}

export const ProfessionalAssessment = ({ 
  lesson, 
  questions, 
  onComplete, 
  passingScore = 80 
}: ProfessionalAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{score: number; passed: boolean; details: any[]}>({
    score: 0,
    passed: false,
    details: []
  });

  // Default professional questions for equipment financing
  const defaultQuestions: Question[] = [
    {
      id: "1",
      type: "multiple-choice",
      question: "What is the typical loan-to-value ratio for equipment financing in commercial lending?",
      options: ["60-70%", "70-80%", "80-90%", "90-100%"],
      correctAnswers: ["80-90%"],
      explanation: "Equipment financing typically offers 80-90% LTV because the equipment serves as primary collateral, providing security for the lender while allowing businesses to preserve working capital.",
      points: 15,
      difficulty: "medium"
    },
    {
      id: "2",
      type: "scenario",
      question: "A manufacturing client needs $500,000 for new CNC equipment. They have $75,000 down payment, annual revenue of $2.5M, and net income of $375,000. What is the most critical factor for approval?",
      options: [
        "Personal credit score of the owner",
        "Debt service coverage ratio and cash flow",
        "Equipment manufacturer reputation",
        "Industry growth projections"
      ],
      correctAnswers: ["Debt service coverage ratio and cash flow"],
      explanation: "Cash flow analysis is paramount. With $375K net income, the DSCR should comfortably support the additional debt service on a $425K loan (after $75K down payment).",
      points: 20,
      difficulty: "hard"
    },
    {
      id: "3",
      type: "calculation",
      question: "If equipment costs $600,000 with 10-year useful life, 5-year loan term, and 7% interest rate, what factors determine the maximum loan amount?",
      options: [
        "Only the purchase price of $600,000",
        "LTV ratio, DSCR, and equipment depreciation",
        "Borrower's total net worth",
        "Industry average loan amounts"
      ],
      correctAnswers: ["LTV ratio, DSCR, and equipment depreciation"],
      explanation: "Maximum loan amount considers multiple factors: LTV (typically 80-90% = $480-540K), borrower's DSCR capability, and equipment's depreciation schedule affecting collateral value.",
      points: 25,
      difficulty: "hard"
    },
    {
      id: "4",
      type: "multiple-choice",
      question: "Which documentation is NOT typically required for equipment financing?",
      options: [
        "Equipment quote and specifications",
        "Borrower's tax returns and financial statements",
        "Personal residence appraisal",
        "UCC-1 financing statement preparation"
      ],
      correctAnswers: ["Personal residence appraisal"],
      explanation: "Personal residence appraisals are not typically required for equipment financing since the equipment itself serves as primary collateral. UCC-1 filings secure the lender's interest in the equipment.",
      points: 10,
      difficulty: "easy"
    }
  ];

  const assessmentQuestions = questions || defaultQuestions;
  const totalQuestions = assessmentQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    const details: any[] = [];

    assessmentQuestions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = question.correctAnswers.includes(userAnswer || "");
      
      if (isCorrect) {
        earnedPoints += question.points;
      }
      
      details.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswers[0],
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points
      });
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= passingScore;

    setResults({ score, passed, details });
    setShowResults(true);
    onComplete(passed, score);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (showResults) {
    return (
      <Card className="jp-card-elegant">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            {results.passed ? (
              <Award className="h-16 w-16 text-primary" />
            ) : (
              <AlertCircle className="h-16 w-16 text-orange-500" />
            )}
            
            <div>
              <CardTitle className="jp-heading text-2xl text-navy-900">
                Assessment {results.passed ? "Completed" : "Needs Review"}
              </CardTitle>
              <p className="jp-subheading mt-2">
                Final Score: <span className="font-bold text-primary">{results.score}%</span>
              </p>
            </div>

            <Badge className={`px-4 py-2 text-base ${
              results.passed 
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
            }`}>
              {results.passed ? `✅ Passed (${passingScore}%+ required)` : `❌ Below ${passingScore}% - Review Required`}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Overview */}
          <Card className="jp-card">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="jp-caption">Questions Correct</p>
                <p className="jp-heading text-2xl text-primary">
                  {results.details.filter(d => d.isCorrect).length}/{totalQuestions}
                </p>
              </div>
              <div className="text-center">
                <p className="jp-caption">Points Earned</p>
                <p className="jp-heading text-2xl text-primary">
                  {results.details.reduce((sum, d) => sum + d.points, 0)}/
                  {results.details.reduce((sum, d) => sum + d.maxPoints, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="jp-caption">Professional Level</p>
                <p className="jp-heading text-lg text-primary">
                  {results.score >= 90 ? "Expert" : results.score >= 80 ? "Proficient" : "Developing"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="jp-card">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900">Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.details.map((detail, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    {detail.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="jp-body font-medium mb-2">{detail.question}</p>
                      <div className="space-y-1">
                        <p className="jp-caption">
                          <span className="font-medium">Your answer:</span> {detail.userAnswer || "Not answered"}
                        </p>
                        {!detail.isCorrect && (
                          <p className="jp-caption text-green-700">
                            <span className="font-medium">Correct answer:</span> {detail.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={detail.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {detail.points}/{detail.maxPoints} pts
                    </Badge>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-500">
                    <p className="jp-body text-sm text-blue-800">
                      <span className="font-medium">Explanation:</span> {detail.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="jp-card bg-gradient-to-r from-primary/5 to-navy-900/5">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {results.passed ? (
                <div className="space-y-2">
                  <p className="jp-body">🎉 Excellent work! You've demonstrated professional competency in this topic.</p>
                  <p className="jp-caption">You're ready to proceed to the next lesson or apply these concepts in practice.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="jp-body">📚 Review the lesson materials focusing on the concepts you missed.</p>
                  <p className="jp-caption">You can retake this assessment after additional study. Consider reviewing the video content and taking detailed notes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  const currentQ = assessmentQuestions[currentQuestion];

  return (
    <Card className="jp-card-elegant">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="jp-heading text-navy-900">Professional Assessment</CardTitle>
          <Badge className={getDifficultyColor(currentQ.difficulty)}>
            {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="jp-caption">Question {currentQuestion + 1} of {totalQuestions}</span>
            <span className="jp-caption">{currentQ.points} points</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="jp-heading text-lg text-navy-900">{currentQ.question}</h3>
          
          <RadioGroup
            value={answers[currentQ.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, value)}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="jp-body cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
            className="jp-button-secondary"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {assessmentQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < currentQuestion 
                    ? "bg-primary" 
                    : index === currentQuestion 
                    ? "bg-primary/50" 
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!answers[currentQ.id]}
            className="jp-button-primary"
          >
            {currentQuestion === totalQuestions - 1 ? "Submit Assessment" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};