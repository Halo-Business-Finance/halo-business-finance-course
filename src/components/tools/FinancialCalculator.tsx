import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calculator, DollarSign, TrendingUp, PieChart, Calendar, Zap, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalPercentage: number;
  interestPercentage: number;
}

interface AmortizationEntry {
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export const FinancialCalculator = () => {
  const [principal, setPrincipal] = useState<string>("100000");
  const [rate, setRate] = useState<string>("5.5");
  const [years, setYears] = useState<string>("10");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [amortization, setAmortization] = useState<AmortizationEntry[]>([]);
  const [animatedValues, setAnimatedValues] = useState({ payment: 0, total: 0, interest: 0 });

  useEffect(() => {
    if (result) {
      // Animate values
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedValues({
          payment: result.monthlyPayment * easeOut,
          total: result.totalPayment * easeOut,
          interest: result.totalInterest * easeOut
        });
        
        currentStep++;
        if (currentStep > steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(years) * 12;

    if (p > 0 && r > 0 && n > 0) {
      const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - p;
      
      // Calculate amortization schedule
      let balance = p;
      const schedule: AmortizationEntry[] = [];
      
      for (let i = 1; i <= Math.min(12, n); i++) {
        const interestPayment = balance * r;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        schedule.push({
          payment: i,
          principalPayment,
          interestPayment,
          remainingBalance: balance
        });
      }

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principalPercentage: (p / totalPayment) * 100,
        interestPercentage: (totalInterest / totalPayment) * 100
      });
      
      setAmortization(schedule);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentBreakdown = () => {
    if (!result) return null;
    const principalAmount = parseFloat(principal);
    return [
      { label: "Principal", value: principalAmount, color: "bg-blue-500" },
      { label: "Interest", value: result.totalInterest, color: "bg-red-500" }
    ];
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            Advanced Loan Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal" className="flex items-center gap-2">
                Loan Amount
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The total amount you want to borrow</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate" className="flex items-center gap-2">
                Annual Interest Rate (%)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The yearly interest rate for your loan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="5.5"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years" className="flex items-center gap-2">
                Loan Term (Years)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How long you'll take to repay the loan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="10"
                className="text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateLoan} className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Zap className="h-5 w-5 mr-2" />
            Calculate Payment
          </Button>

          {result && (
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="breakdown" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Breakdown
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Monthly Payment</Label>
                      <div className="text-3xl font-bold text-blue-600 mt-2 animate-fade-in">
                        {formatCurrency(animatedValues.payment)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Base payment
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Total Payment</Label>
                      <div className="text-3xl font-bold text-green-600 mt-2 animate-fade-in">
                        {formatCurrency(animatedValues.total)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Over {years} years
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Total Interest</Label>
                      <div className="text-3xl font-bold text-red-600 mt-2 animate-fade-in">
                        {formatCurrency(animatedValues.interest)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {result.interestPercentage.toFixed(1)}% of total
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Payment Composition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Principal ({result.principalPercentage.toFixed(1)}%)</span>
                          <span>{formatCurrency(parseFloat(principal))}</span>
                        </div>
                        <Progress value={result.principalPercentage} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Interest ({result.interestPercentage.toFixed(1)}%)</span>
                          <span>{formatCurrency(result.totalInterest)}</span>
                        </div>
                        <Progress value={result.interestPercentage} className="h-3 bg-red-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      First Year Amortization Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Payment #</th>
                            <th className="text-left p-2">Principal</th>
                            <th className="text-left p-2">Interest</th>
                            <th className="text-left p-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortization.map((entry, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-medium">{entry.payment}</td>
                              <td className="p-2 text-green-600">{formatCurrency(entry.principalPayment)}</td>
                              <td className="p-2 text-red-600">{formatCurrency(entry.interestPayment)}</td>
                              <td className="p-2">{formatCurrency(entry.remainingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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