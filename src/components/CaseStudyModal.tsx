import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calculator, TrendingUp, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    duration: string;
  } | null;
}

export const CaseStudyModal = ({ isOpen, onClose, caseStudy }: CaseStudyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const getCaseStudyData = (id: number) => {
    switch (id) {
      case 1:
        return {
          company: "MidTech Manufacturing Corp",
          scenario: "A 15-year-old manufacturing company specializing in automotive parts seeks a $500,000 equipment loan to purchase new CNC machines. The company has shown steady growth but faced challenges during the recent economic downturn.",
          financials: {
            revenue: "$2.8M (2023), $2.6M (2022), $2.9M (2021)",
            netIncome: "$280K (2023), $195K (2022), $340K (2021)",
            totalDebt: "$850K",
            currentRatio: "1.8",
            debtToEquity: "2.1",
            cashFlow: "$420K annual operating cash flow"
          },
          questions: [
            {
              id: "risk_assessment",
              question: "What is your primary concern about this loan application?",
              options: [
                "Declining revenue trend over 3 years",
                "High debt-to-equity ratio of 2.1",
                "Volatile earnings pattern",
                "All of the above require attention"
              ],
              correct: 3
            },
            {
              id: "loan_structure",
              question: "What loan term would you recommend for this equipment financing?",
              options: [
                "3-5 years to match equipment depreciation",
                "7-10 years to reduce monthly payments",
                "1-2 years for quick payoff", 
                "15-20 years like a mortgage"
              ],
              correct: 0
            }
          ]
        };
      case 2:
        return {
          company: "Seasons Retail Boutique",
          scenario: "A seasonal retail clothing store needs a $150,000 working capital line of credit. The business experiences strong sales during fall/winter but struggles with cash flow during spring/summer months.",
          financials: {
            revenue: "$600K annual, 70% in Q4/Q1",
            netIncome: "$85K annual",
            inventory: "$120K average, peaks at $200K",
            currentRatio: "2.4",
            quickRatio: "0.9",
            cashFlow: "Seasonal swings from +$40K to -$25K"
          },
          questions: [
            {
              id: "seasonality",
              question: "How should seasonality impact your lending decision?",
              options: [
                "Require higher interest rates due to risk",
                "Structure draws/payments around seasonal patterns",
                "Decline due to cash flow volatility",
                "Require additional collateral"
              ],
              correct: 1
            }
          ]
        };
      case 3:
        return {
          company: "Wellness Family Practice",
          scenario: "A medical practice with 3 physicians wants to expand by purchasing a neighboring building for $750,000. They're considering an SBA 504 loan for the real estate acquisition.",
          financials: {
            revenue: "$1.8M annual, growing 8% yearly",
            netIncome: "$540K before owner salaries",
            cashFlow: "$480K debt service capacity",
            downPayment: "$75K available (10%)",
            creditScore: "785 (practice), 760+ (guarantors)"
          },
          questions: [
            {
              id: "sba_structure",
              question: "What's the optimal SBA 504 structure for this deal?",
              options: [
                "50% bank loan, 40% SBA debenture, 10% down",
                "70% bank loan, 20% SBA debenture, 10% down",
                "60% bank loan, 30% SBA debenture, 10% down",
                "80% bank loan, 10% SBA debenture, 10% down"
              ],
              correct: 0
            }
          ]
        };
      default:
        return null;
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers({});
    setShowResults(false);
  };

  if (!caseStudy || !isOpen) return null;

  const data = getCaseStudyData(caseStudy.id);
  if (!data) return null;

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-primary">{caseStudy.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {data.company} • {caseStudy.difficulty} • {caseStudy.duration}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Step {currentStep} of 3</p>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Business Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{data.scenario}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-accent" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(data.financials).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-sm text-muted-foreground mt-1">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  Begin Analysis
                  <TrendingUp className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    Analysis Questions
                  </CardTitle>
                  <CardDescription>
                    Answer the following questions based on your analysis of the financial data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.questions.map((question, index) => (
                    <div key={question.id} className="space-y-3">
                      <h4 className="font-medium text-primary">
                        Question {index + 1}: {question.question}
                      </h4>
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswer(question.id, value)}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                            <Label htmlFor={`${question.id}-${optionIndex}`} className="text-sm">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}

                  <div className="space-y-3">
                    <h4 className="font-medium text-primary">Additional Analysis:</h4>
                    <Textarea
                      placeholder="Provide your recommendations for loan structure, terms, and any conditions you would require..."
                      className="min-h-[100px]"
                      value={answers.analysis || ""}
                      onChange={(e) => handleAnswer("analysis", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Scenario
                </Button>
                <Button onClick={handleSubmit} disabled={!data.questions.every(q => answers[q.id])}>
                  Submit Analysis
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 || showResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Analysis Results & Expert Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.questions.map((question, index) => {
                    const userAnswer = parseInt(answers[question.id] || "");
                    const isCorrect = userAnswer === question.correct;
                    
                    return (
                      <div key={question.id} className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Question {index + 1}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{question.question}</p>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              ✓ Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              ✗ Incorrect
                            </Badge>
                          )}
                          <span className="text-sm">
                            Correct answer: {question.options[question.correct]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Expert Recommendation:</h4>
                    <p className="text-sm text-muted-foreground">
                      {caseStudy.id === 1 && "This loan requires careful structuring with quarterly financial reporting, equipment as collateral, and a 7-year term to match depreciation. Consider requiring a debt service coverage ratio covenant of 1.25x."}
                      {caseStudy.id === 2 && "A seasonal line of credit with draws permitted October-February and mandatory paydown in summer months would align with cash flow patterns. Consider inventory-based borrowing base."}
                      {caseStudy.id === 3 && "The SBA 504 program is ideal here with 50/40/10 structure, providing long-term fixed rate financing for the real estate acquisition while preserving working capital."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleRestart}>
                  Start Over
                </Button>
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                  Complete Case Study
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};