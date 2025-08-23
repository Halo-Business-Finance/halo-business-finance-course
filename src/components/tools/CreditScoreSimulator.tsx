import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface ScoreImpact {
  newScore: number;
  impact: number;
  description: string;
  tips: string[];
  timeToSeeChange: string;
}

interface CreditFactor {
  name: string;
  weight: number;
  current: number;
  optimal: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export const CreditScoreSimulator = () => {
  const [currentScore, setCurrentScore] = useState<string>("700");
  const [scenario, setScenario] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000");
  const [timeframe, setTimeframe] = useState<string>("1");
  const [result, setResult] = useState<ScoreImpact | null>(null);
  const [animatedScore, setAnimatedScore] = useState(700);

  // Credit factors analysis
  const [creditFactors, setCreditFactors] = useState<CreditFactor[]>([
    { name: "Payment History", weight: 35, current: 85, optimal: 100, impact: 'neutral' },
    { name: "Credit Utilization", weight: 30, current: 45, optimal: 10, impact: 'negative' },
    { name: "Length of Credit History", weight: 15, current: 70, optimal: 90, impact: 'neutral' },
    { name: "Credit Mix", weight: 10, current: 80, optimal: 90, impact: 'positive' },
    { name: "New Credit", weight: 10, current: 75, optimal: 85, impact: 'neutral' },
  ]);

  useEffect(() => {
    if (result) {
      let current = parseInt(currentScore);
      const target = result.newScore;
      const difference = target - current;
      const steps = 30;
      const increment = difference / steps;
      
      const interval = setInterval(() => {
        current += increment;
        setAnimatedScore(Math.round(current));
        
        if (Math.abs(current - target) < 1) {
          setAnimatedScore(target);
          clearInterval(interval);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [result, currentScore]);

  const simulateScore = () => {
    const score = parseInt(currentScore);
    const value = parseFloat(amount);
    const months = parseInt(timeframe);
    let impact = 0;
    let description = "";
    let tips: string[] = [];
    let timeToSeeChange = "";

    switch (scenario) {
      case "new-credit-card":
        impact = -5 - Math.floor(value / 5000) * 2;
        description = "Opening a new credit card typically causes a temporary decrease due to hard inquiry and reduced average account age.";
        tips = [
          "Keep the new card's utilization below 10%",
          "Don't close old cards to maintain credit history",
          "Wait 6+ months before applying for more credit"
        ];
        timeToSeeChange = "2-3 months";
        break;
      case "pay-down-debt":
        impact = Math.floor(value / 1000) * 3;
        description = "Paying down debt reduces credit utilization ratio, which positively impacts your credit score.";
        tips = [
          "Pay down cards with highest utilization first",
          "Keep paid-off cards open",
          "Set up automatic payments to avoid late fees"
        ];
        timeToSeeChange = "1-2 months";
        break;
      case "missed-payment":
        impact = -35 - Math.floor(value / 500) * 5;
        description = "Missed payments have a significant negative impact on credit scores, especially for larger amounts.";
        tips = [
          "Contact your lender immediately to explain the situation",
          "Make the payment as soon as possible",
          "Consider setting up automatic payments"
        ];
        timeToSeeChange = "Immediate";
        break;
      case "close-old-card":
        impact = -10 - Math.floor(value / 1000) * 2;
        description = "Closing an old credit card reduces your credit history length and available credit.";
        tips = [
          "Keep old cards open, even if unused",
          "Use old cards occasionally to keep them active",
          "Consider downgrading instead of closing"
        ];
        timeToSeeChange = "2-3 months";
        break;
      case "increase-limit":
        impact = Math.floor(value / 2000) * 2;
        description = "Increasing credit limits improves your credit utilization ratio when balances remain the same.";
        tips = [
          "Don't increase spending with higher limits",
          "Request increases on your oldest cards first",
          "Aim for automatic increases rather than requesting"
        ];
        timeToSeeChange = "1-2 months";
        break;
      case "debt-consolidation":
        impact = Math.floor(value / 5000) * 1;
        description = "Debt consolidation can improve your score by reducing overall utilization and simplifying payments.";
        tips = [
          "Don't close the paid-off cards",
          "Avoid accumulating new debt",
          "Choose a consolidation method with lower interest rates"
        ];
        timeToSeeChange = "2-4 months";
        break;
      default:
        return;
    }

    // Apply time factor
    const timeFactor = Math.max(0.5, 1 - (months - 1) * 0.1);
    impact = Math.round(impact * timeFactor);

    const newScore = Math.max(300, Math.min(850, score + impact));
    
    setResult({
      newScore,
      impact,
      description,
      tips,
      timeToSeeChange
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-green-600";
    if (score >= 740) return "text-blue-600";
    if (score >= 670) return "text-yellow-600";
    if (score >= 580) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreCategory = (score: number) => {
    if (score >= 800) return "Excellent";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  };

  const getScoreProgress = (score: number) => {
    return ((score - 300) / 550) * 100;
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            Advanced Credit Score Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Current Credit Score</Label>
              <Input
                id="score"
                type="number"
                min="300"
                max="850"
                value={currentScore}
                onChange={(e) => setCurrentScore(e.target.value)}
                placeholder="700"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario">Credit Scenario</Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-credit-card">Open New Credit Card</SelectItem>
                  <SelectItem value="pay-down-debt">Pay Down Debt</SelectItem>
                  <SelectItem value="missed-payment">Missed Payment</SelectItem>
                  <SelectItem value="close-old-card">Close Old Credit Card</SelectItem>
                  <SelectItem value="increase-limit">Increase Credit Limit</SelectItem>
                  <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (Months)</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={simulateScore} className="w-full h-12 text-lg" disabled={!scenario}>
            <BarChart3 className="h-5 w-5 mr-2" />
            Simulate Impact
          </Button>

          {result && (
            <Tabs defaultValue="simulation" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="simulation">Impact Analysis</TabsTrigger>
                <TabsTrigger value="factors">Credit Factors</TabsTrigger>
                <TabsTrigger value="tips">Improvement Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="simulation" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <Label className="text-sm text-muted-foreground">Current Score</Label>
                        <div className={`text-4xl font-bold ${getScoreColor(parseInt(currentScore))}`}>
                          {currentScore}
                        </div>
                        <Badge variant="outline">
                          {getScoreCategory(parseInt(currentScore))}
                        </Badge>
                        <Progress value={getScoreProgress(parseInt(currentScore))} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <Label className="text-sm text-muted-foreground">Projected Score</Label>
                        <div className={`text-4xl font-bold ${getScoreColor(animatedScore)} animate-fade-in`}>
                          {animatedScore}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {result.impact > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`font-medium ${result.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {result.impact > 0 ? '+' : ''}{result.impact} points
                          </span>
                        </div>
                        <Badge variant="outline">
                          {getScoreCategory(result.newScore)}
                        </Badge>
                        <Progress value={getScoreProgress(result.newScore)} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">Impact Analysis</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{result.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          Time to see change: {result.timeToSeeChange}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="factors" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Credit Score Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {creditFactors.map((factor, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{factor.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {factor.weight}% weight
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {factor.impact === 'positive' && <TrendingUp className="h-4 w-4 text-green-500" />}
                              {factor.impact === 'negative' && <TrendingDown className="h-4 w-4 text-red-500" />}
                              {factor.impact === 'neutral' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                              <span className="text-sm">{factor.current}%</span>
                            </div>
                          </div>
                          <Progress value={factor.current} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Optimal: {factor.optimal}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tips" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Actionable Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Target className="h-5 w-5" />
                      <span className="font-medium">Pro Tip</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Consistency is key for credit improvement. Small, regular positive actions compound over time to create significant score improvements.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};