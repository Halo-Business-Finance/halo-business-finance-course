import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export const FinancialCalculator = () => {
  const [principal, setPrincipal] = useState<string>("100000");
  const [rate, setRate] = useState<string>("5.5");
  const [years, setYears] = useState<string>("10");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12; // Monthly interest rate
    const n = parseInt(years) * 12; // Total number of payments

    if (p > 0 && r > 0 && n > 0) {
      const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - p;

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Loan Payment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Loan Amount</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="100000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Loan Term (Years)</Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        <Button onClick={calculateLoan} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Calculate Payment
        </Button>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">Monthly Payment</Label>
                <div className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(result.monthlyPayment)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">Total Payment</Label>
                <div className="text-2xl font-bold text-secondary-foreground mt-1">
                  {formatCurrency(result.totalPayment)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">Total Interest</Label>
                <div className="text-2xl font-bold text-accent mt-1">
                  {formatCurrency(result.totalInterest)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};