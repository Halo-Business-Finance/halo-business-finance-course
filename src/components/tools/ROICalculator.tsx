import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign } from "lucide-react";

interface ROIResult {
  roi: number;
  profit: number;
  roiPercentage: string;
}

export const ROICalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState<string>("50000");
  const [finalValue, setFinalValue] = useState<string>("65000");
  const [result, setResult] = useState<ROIResult | null>(null);

  const calculateROI = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);

    if (initial > 0 && final >= 0) {
      const profit = final - initial;
      const roi = (profit / initial) * 100;
      
      setResult({
        roi,
        profit,
        roiPercentage: roi >= 0 ? "positive" : "negative"
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

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initial">Initial Investment</Label>
            <Input
              id="initial"
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="50000"
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
            />
          </div>
        </div>

        <Button onClick={calculateROI} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Calculate ROI
        </Button>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">ROI Percentage</Label>
                <div className={`text-2xl font-bold mt-1 ${result.roiPercentage === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(result.roi)}
                </div>
                <Badge variant={result.roiPercentage === 'positive' ? 'success' : 'destructive'} className="mt-2">
                  {result.roiPercentage === 'positive' ? 'Profit' : 'Loss'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">Profit/Loss</Label>
                <div className={`text-2xl font-bold mt-1 ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(result.profit)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Label className="text-sm text-muted-foreground">Final Value</Label>
                <div className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(parseFloat(finalValue))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};