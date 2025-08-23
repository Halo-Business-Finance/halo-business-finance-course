import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingUp, TrendingDown } from "lucide-react";

interface ScoreImpact {
  newScore: number;
  impact: number;
  description: string;
}

export const CreditScoreSimulator = () => {
  const [currentScore, setCurrentScore] = useState<string>("700");
  const [scenario, setScenario] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000");
  const [result, setResult] = useState<ScoreImpact | null>(null);

  const simulateScore = () => {
    const score = parseInt(currentScore);
    const value = parseFloat(amount);
    let impact = 0;
    let description = "";

    switch (scenario) {
      case "new-credit-card":
        impact = -5 - Math.floor(value / 5000) * 2;
        description = "Opening a new credit card typically causes a temporary decrease due to hard inquiry and reduced average account age.";
        break;
      case "pay-down-debt":
        impact = Math.floor(value / 1000) * 3;
        description = "Paying down debt reduces credit utilization ratio, which positively impacts your credit score.";
        break;
      case "missed-payment":
        impact = -35 - Math.floor(value / 500) * 5;
        description = "Missed payments have a significant negative impact on credit scores, especially for larger amounts.";
        break;
      case "close-old-card":
        impact = -10 - Math.floor(value / 1000) * 2;
        description = "Closing an old credit card reduces your credit history length and available credit.";
        break;
      case "increase-limit":
        impact = Math.floor(value / 2000) * 2;
        description = "Increasing credit limits improves your credit utilization ratio when balances remain the same.";
        break;
      default:
        return;
    }

    const newScore = Math.max(300, Math.min(850, score + impact));
    
    setResult({
      newScore,
      impact,
      description
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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Credit Score Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scenario">Credit Scenario</Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario to simulate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-credit-card">Open New Credit Card</SelectItem>
              <SelectItem value="pay-down-debt">Pay Down Existing Debt</SelectItem>
              <SelectItem value="missed-payment">Missed Payment</SelectItem>
              <SelectItem value="close-old-card">Close Old Credit Card</SelectItem>
              <SelectItem value="increase-limit">Credit Limit Increase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={simulateScore} className="w-full" disabled={!scenario}>
          <CreditCard className="h-4 w-4 mr-2" />
          Simulate Impact
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Label className="text-sm text-muted-foreground">Current Score</Label>
                  <div className={`text-2xl font-bold mt-1 ${getScoreColor(parseInt(currentScore))}`}>
                    {currentScore}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {getScoreCategory(parseInt(currentScore))}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Label className="text-sm text-muted-foreground">Projected Score</Label>
                  <div className={`text-2xl font-bold mt-1 ${getScoreColor(result.newScore)}`}>
                    {result.newScore}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {getScoreCategory(result.newScore)}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Label className="text-sm text-muted-foreground">Score Change</Label>
                  <div className={`text-2xl font-bold mt-1 flex items-center justify-center gap-1 ${result.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.impact >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {result.impact >= 0 ? '+' : ''}{result.impact}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium">Impact Analysis</Label>
                <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};