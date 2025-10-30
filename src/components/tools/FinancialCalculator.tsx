import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAmount: number;
}

export const FinancialCalculator = () => {
  const [principal, setPrincipal] = useState<string>("0");
  const [rate, setRate] = useState<string>("0");
  const [termValue, setTermValue] = useState<string>("0");
  const [termUnit, setTermUnit] = useState<string>("Years");
  const [interestOnly, setInterestOnly] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateLoan = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const term = parseFloat(termValue);
    const n = termUnit === "Years" ? term * 12 : term;

    if (p > 0 && r >= 0 && n > 0) {
      let monthlyPayment: number;
      let totalInterest: number;
      
      if (interestOnly || r === 0) {
        // Interest-only payment or 0% interest
        monthlyPayment = p * r;
        totalInterest = monthlyPayment * n;
      } else {
        // Standard amortizing loan
        monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = monthlyPayment * n;
        totalInterest = totalPayment - p;
      }
      
      const totalPayment = monthlyPayment * n;

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principalAmount: p
      });
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

  const getYearsDisplay = () => {
    if (termUnit === "Years") {
      return parseFloat(termValue) || 0;
    }
    return (parseFloat(termValue) / 12) || 0;
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Calculate your monthly payments and see the full breakdown
        </p>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div className="space-y-2">
          <Label htmlFor="principal" className="text-base font-semibold">
            Loan Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
              $
            </span>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => {
                setPrincipal(e.target.value);
                calculateLoan();
              }}
              placeholder="0"
              className="pl-8 h-12 text-lg"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="rate" className="text-base font-semibold">
            Interest Rate (Annual)
          </Label>
          <div className="relative">
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                calculateLoan();
              }}
              placeholder="0"
              className="pr-8 h-12 text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <Label htmlFor="term" className="text-base font-semibold">
            Loan Term
          </Label>
          <div className="flex gap-2">
            <Input
              id="term"
              type="number"
              value={termValue}
              onChange={(e) => {
                setTermValue(e.target.value);
                calculateLoan();
              }}
              placeholder="0"
              className="h-12 text-lg flex-1"
            />
            <Select value={termUnit} onValueChange={(value) => {
              setTermUnit(value);
              calculateLoan();
            }}>
              <SelectTrigger className="w-32 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Years">Years</SelectItem>
                <SelectItem value="Months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interest-Only Period Toggle */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="interest-only" className="text-base font-semibold cursor-pointer">
                Interest-Only Period
              </Label>
              <Switch
                id="interest-only"
                checked={interestOnly}
                onCheckedChange={(checked) => {
                  setInterestOnly(checked);
                  if (result) calculateLoan();
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        {result && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-bold">Payment Breakdown</h2>
            
            {/* Monthly Payment - Large Display */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  MONTHLY PAYMENT
                </p>
                <p className="text-5xl font-bold text-blue-600">
                  {formatCurrency(result.monthlyPayment)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {getYearsDisplay().toFixed(1)} years at {rate}% APR
                </p>
              </CardContent>
            </Card>

            {/* Total Amount Paid & Total Interest */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    TOTAL AMOUNT PAID
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(result.totalPayment)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    TOTAL INTEREST
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Principal Amount */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-base text-muted-foreground">
                    Principal Amount
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(result.principalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};