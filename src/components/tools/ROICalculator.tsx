import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, Target, BarChart3, Zap } from "lucide-react";

interface ROIResult {
  roi: number;
  profit: number;
  roiPercentage: string;
  annualizedROI?: number;
  paybackPeriod?: number;
}

interface InvestmentScenario {
  name: string;
  initial: number;
  final: number;
  period: number;
}

export const ROICalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState<string>("50000");
  const [finalValue, setFinalValue] = useState<string>("65000");
  const [investmentPeriod, setInvestmentPeriod] = useState<string>("12");
  const [result, setResult] = useState<ROIResult | null>(null);
  const [animatedROI, setAnimatedROI] = useState(0);
  const [animatedProfit, setAnimatedProfit] = useState(0);
  
  const [scenarios, setScenarios] = useState<InvestmentScenario[]>([
    { name: "Conservative Portfolio", initial: 50000, final: 55000, period: 12 },
    { name: "Balanced Portfolio", initial: 50000, final: 62500, period: 12 },
    { name: "Aggressive Portfolio", initial: 50000, final: 72500, period: 12 },
  ]);

  useEffect(() => {
    if (result) {
      // Animate values
      const duration = 1500;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedROI(result.roi * easeOut);
        setAnimatedProfit(result.profit * easeOut);
        
        currentStep++;
        if (currentStep > steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const calculateROI = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);
    const period = parseFloat(investmentPeriod);

    if (initial > 0 && final >= 0 && period > 0) {
      const profit = final - initial;
      const roi = (profit / initial) * 100;
      const annualizedROI = period === 12 ? roi : (roi * (12 / period));
      const paybackPeriod = profit > 0 ? (initial / (profit / period)) : 0;
      
      setResult({
        roi,
        profit,
        roiPercentage: roi >= 0 ? "positive" : "negative",
        annualizedROI,
        paybackPeriod
      });
    }
  };

  const calculateScenarios = () => {
    return scenarios.map(scenario => {
      const profit = scenario.final - scenario.initial;
      const roi = (profit / scenario.initial) * 100;
      const annualizedROI = scenario.period === 12 ? roi : (roi * (12 / scenario.period));
      return {
        ...scenario,
        profit,
        roi,
        annualizedROI
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return "text-emerald-600";
    if (roi >= 10) return "text-green-600";
    if (roi >= 5) return "text-blue-600";
    if (roi >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLevel = (roi: number) => {
    if (roi >= 20) return { level: "High Risk/High Reward", color: "bg-red-100 text-red-700" };
    if (roi >= 10) return { level: "Moderate Risk", color: "bg-yellow-100 text-yellow-700" };
    if (roi >= 5) return { level: "Conservative", color: "bg-green-100 text-green-700" };
    if (roi >= 0) return { level: "Low Risk", color: "bg-blue-100 text-blue-700" };
    return { level: "Loss", color: "bg-red-100 text-red-700" };
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Advanced ROI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial">Initial Investment</Label>
              <Input
                id="initial"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                placeholder="50000"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="final">Final Value</Label>
              <Input
                id="final"
                type="number"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                placeholder="65000"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Investment Period (Months)</Label>
              <Input
                id="period"
                type="number"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(e.target.value)}
                placeholder="12"
                className="text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateROI} className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Zap className="h-5 w-5 mr-2" />
            Calculate ROI
          </Button>

          {result && (
            <Tabs defaultValue="analysis" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">ROI Percentage</Label>
                      <div className={`text-4xl font-bold mt-2 animate-fade-in ${getROIColor(animatedROI)}`}>
                        {formatPercentage(animatedROI)}
                      </div>
                      <Badge className={`mt-2 ${getRiskLevel(result.roi).color}`}>
                        {getRiskLevel(result.roi).level}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Profit/Loss</Label>
                      <div className={`text-4xl font-bold mt-2 animate-fade-in ${animatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(animatedProfit)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {animatedProfit >= 0 ? 'Profit' : 'Loss'}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Annualized ROI</Label>
                      <div className={`text-4xl font-bold mt-2 animate-fade-in ${getROIColor(result.annualizedROI || 0)}`}>
                        {formatPercentage(result.annualizedROI || 0)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Per Year
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Investment Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Investment Period</span>
                          <span className="font-medium">{investmentPeriod} months</span>
                        </div>
                        {result.paybackPeriod && result.paybackPeriod > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Break-even Period</span>
                            <span className="font-medium">{result.paybackPeriod.toFixed(1)} months</span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">ROI Progress</span>
                          <Progress value={Math.abs(result.roi) > 100 ? 100 : Math.abs(result.roi)} className="h-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Investment Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Initial Investment</span>
                          <span className="font-medium">{formatCurrency(parseFloat(initialInvestment))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Final Value</span>
                          <span className="font-medium">{formatCurrency(parseFloat(finalValue))}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Gain/Loss</span>
                          <span className={result.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(result.profit)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Investment Scenarios Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {calculateScenarios().map((scenario, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div>
                            <h3 className="font-medium">{scenario.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(scenario.initial)} → {formatCurrency(scenario.final)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getROIColor(scenario.roi)}`}>
                              {formatPercentage(scenario.roi)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(scenario.profit)} profit
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Investment Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.roi >= 15 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800">Excellent Return</h4>
                          <p className="text-sm text-green-600 mt-1">
                            Your investment shows strong performance with a {formatPercentage(result.roi)} return.
                          </p>
                        </div>
                      )}
                      
                      {result.roi >= 5 && result.roi < 15 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800">Solid Performance</h4>
                          <p className="text-sm text-blue-600 mt-1">
                            Your investment shows steady growth with a {formatPercentage(result.roi)} return.
                          </p>
                        </div>
                      )}
                      
                      {result.roi < 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800">Investment Loss</h4>
                          <p className="text-sm text-red-600 mt-1">
                            Consider reviewing your investment strategy to minimize future losses.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-medium text-purple-800">Recommendation</h4>
                        <p className="text-sm text-purple-600 mt-1">
                          {result.roi >= 10 
                            ? "This investment aligns well with growth objectives. Consider similar opportunities."
                            : result.roi >= 0
                            ? "While profitable, explore higher-yield opportunities for better returns."
                            : "Review investment criteria and consider diversification to reduce risk."
                          }
                        </p>
                      </div>
                    </div>
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