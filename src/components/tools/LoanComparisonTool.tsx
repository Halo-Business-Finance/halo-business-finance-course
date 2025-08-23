import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, DollarSign } from "lucide-react";

interface LoanOption {
  id: number;
  amount: string;
  rate: string;
  term: string;
  monthlyPayment?: number;
  totalInterest?: number;
  totalPayment?: number;
}

export const LoanComparisonTool = () => {
  const [loans, setLoans] = useState<LoanOption[]>([
    { id: 1, amount: "100000", rate: "5.5", term: "10" },
    { id: 2, amount: "100000", rate: "6.0", term: "15" }
  ]);
  const [calculated, setCalculated] = useState(false);

  const updateLoan = (id: number, field: keyof LoanOption, value: string) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
    setCalculated(false);
  };

  const addLoan = () => {
    const newId = Math.max(...loans.map(l => l.id)) + 1;
    setLoans(prev => [...prev, { id: newId, amount: "100000", rate: "5.5", term: "10" }]);
    setCalculated(false);
  };

  const removeLoan = (id: number) => {
    if (loans.length > 1) {
      setLoans(prev => prev.filter(loan => loan.id !== id));
      setCalculated(false);
    }
  };

  const calculatePayments = () => {
    const updatedLoans = loans.map(loan => {
      const p = parseFloat(loan.amount);
      const r = parseFloat(loan.rate) / 100 / 12;
      const n = parseInt(loan.term) * 12;

      if (p > 0 && r > 0 && n > 0) {
        const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = monthlyPayment * n;
        const totalInterest = totalPayment - p;

        return {
          ...loan,
          monthlyPayment,
          totalPayment,
          totalInterest
        };
      }
      return loan;
    });

    setLoans(updatedLoans);
    setCalculated(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getBestOption = () => {
    if (!calculated) return null;
    const validLoans = loans.filter(loan => loan.monthlyPayment);
    if (validLoans.length === 0) return null;
    
    return validLoans.reduce((best, current) => 
      (current.totalPayment || 0) < (best.totalPayment || 0) ? current : best
    );
  };

  const bestOption = getBestOption();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Loan Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {loans.map((loan, index) => (
            <Card key={loan.id} className={`${bestOption?.id === loan.id ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Loan Option {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    {bestOption?.id === loan.id && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        Best Option
                      </Badge>
                    )}
                    {loans.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeLoan(loan.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Loan Amount</Label>
                    <Input
                      type="number"
                      value={loan.amount}
                      onChange={(e) => updateLoan(loan.id, 'amount', e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={loan.rate}
                      onChange={(e) => updateLoan(loan.id, 'rate', e.target.value)}
                      placeholder="5.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Term (Years)</Label>
                    <Input
                      type="number"
                      value={loan.term}
                      onChange={(e) => updateLoan(loan.id, 'term', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                </div>

                {calculated && loan.monthlyPayment && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Monthly Payment</Label>
                      <div className="text-lg font-bold text-primary mt-1">
                        {formatCurrency(loan.monthlyPayment)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Total Interest</Label>
                      <div className="text-lg font-bold text-accent mt-1">
                        {formatCurrency(loan.totalInterest || 0)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Total Payment</Label>
                      <div className="text-lg font-bold text-secondary-foreground mt-1">
                        {formatCurrency(loan.totalPayment || 0)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={calculatePayments} className="flex-1">
            <DollarSign className="h-4 w-4 mr-2" />
            Compare Loans
          </Button>
          <Button variant="outline" onClick={addLoan}>
            Add Loan Option
          </Button>
        </div>

        {calculated && bestOption && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success" className="bg-green-100 text-green-800">
                  Recommended
                </Badge>
                <span className="font-medium">Best Overall Value</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Loan Option {loans.findIndex(l => l.id === bestOption.id) + 1} offers the lowest total cost with a total payment of {formatCurrency(bestOption.totalPayment || 0)}.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};