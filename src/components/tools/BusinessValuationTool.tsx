import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, TrendingUp, Calculator, Target, BarChart3, Zap } from "lucide-react";

interface ValuationResult {
  assetBasedValue: number;
  incomeBasedValue: number;
  marketBasedValue: number;
  weightedAverage: number;
  confidence: number;
}

interface BusinessMetrics {
  revenue: string;
  netIncome: string;
  assets: string;
  liabilities: string;
  industry: string;
  growthRate: string;
  riskFactor: string;
}

export const BusinessValuationTool = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    revenue: "1000000",
    netIncome: "150000",
    assets: "500000",
    liabilities: "200000",
    industry: "technology",
    growthRate: "15",
    riskFactor: "medium"
  });
  
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [animatedValues, setAnimatedValues] = useState({ 
    asset: 0, 
    income: 0, 
    market: 0, 
    weighted: 0 
  });

  const industryMultipliers = {
    technology: { revenue: 5.2, ebitda: 18.5 },
    manufacturing: { revenue: 1.8, ebitda: 12.3 },
    retail: { revenue: 1.2, ebitda: 8.7 },
    services: { revenue: 2.1, ebitda: 10.5 },
    healthcare: { revenue: 3.8, ebitda: 15.2 },
    finance: { revenue: 2.9, ebitda: 13.8 }
  };

  const riskFactors = {
    low: 0.85,
    medium: 1.0,
    high: 1.15
  };

  useEffect(() => {
    if (result) {
      const duration = 2000;
      const steps = 80;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedValues({
          asset: result.assetBasedValue * easeOut,
          income: result.incomeBasedValue * easeOut,
          market: result.marketBasedValue * easeOut,
          weighted: result.weightedAverage * easeOut
        });
        
        currentStep++;
        if (currentStep > steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const calculateValuation = () => {
    const revenue = parseFloat(metrics.revenue) || 0;
    const netIncome = parseFloat(metrics.netIncome) || 0;
    const assets = parseFloat(metrics.assets) || 0;
    const liabilities = parseFloat(metrics.liabilities) || 0;
    const growthRate = parseFloat(metrics.growthRate) || 0;
    const riskAdjustment = riskFactors[metrics.riskFactor as keyof typeof riskFactors];
    
    // Asset-based valuation
    const netAssets = assets - liabilities;
    const assetBasedValue = netAssets;
    
    // Income-based valuation (DCF simplified)
    const discountRate = 0.1 + (riskAdjustment - 1) * 0.05;
    const terminalGrowth = Math.min(growthRate / 100, 0.03);
    const projectedIncome = netIncome * (1 + growthRate / 100);
    const incomeBasedValue = (projectedIncome * (1 + terminalGrowth)) / (discountRate - terminalGrowth);
    
    // Market-based valuation
    const multipliers = industryMultipliers[metrics.industry as keyof typeof industryMultipliers];
    const marketBasedValue = revenue * multipliers.revenue * riskAdjustment;
    
    // Weighted average (40% income, 35% market, 25% asset)
    const weightedAverage = (
      incomeBasedValue * 0.4 + 
      marketBasedValue * 0.35 + 
      assetBasedValue * 0.25
    );
    
    // Confidence score based on data quality and consistency
    const valuationRange = Math.max(assetBasedValue, incomeBasedValue, marketBasedValue) - 
                           Math.min(assetBasedValue, incomeBasedValue, marketBasedValue);
    const confidence = Math.max(20, 100 - (valuationRange / weightedAverage) * 100);
    
    setResult({
      assetBasedValue,
      incomeBasedValue,
      marketBasedValue,
      weightedAverage,
      confidence: Math.min(confidence, 95)
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

  const updateMetric = (field: keyof BusinessMetrics, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            Business Valuation Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue</Label>
              <Input
                id="revenue"
                type="number"
                value={metrics.revenue}
                onChange={(e) => updateMetric('revenue', e.target.value)}
                placeholder="1000000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="netIncome">Net Income</Label>
              <Input
                id="netIncome"
                type="number"
                value={metrics.netIncome}
                onChange={(e) => updateMetric('netIncome', e.target.value)}
                placeholder="150000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assets">Total Assets</Label>
              <Input
                id="assets"
                type="number"
                value={metrics.assets}
                onChange={(e) => updateMetric('assets', e.target.value)}
                placeholder="500000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="liabilities">Total Liabilities</Label>
              <Input
                id="liabilities"
                type="number"
                value={metrics.liabilities}
                onChange={(e) => updateMetric('liabilities', e.target.value)}
                placeholder="200000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={metrics.industry} onValueChange={(value) => updateMetric('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="growthRate">Growth Rate (%)</Label>
              <Input
                id="growthRate"
                type="number"
                value={metrics.growthRate}
                onChange={(e) => updateMetric('growthRate', e.target.value)}
                placeholder="15"
                className="text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskFactor">Risk Assessment</Label>
            <Select value={metrics.riskFactor} onValueChange={(value) => updateMetric('riskFactor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateValuation} className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Zap className="h-5 w-5 mr-2" />
            Calculate Business Valuation
          </Button>

          {result && (
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="methods" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Methods
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Estimated Business Value</Label>
                      <div className="text-4xl font-bold text-emerald-600 mt-2 animate-fade-in">
                        {formatCurrency(animatedValues.weighted)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Weighted Average
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Confidence Level</Label>
                      <div className={`text-4xl font-bold mt-2 animate-fade-in ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence.toFixed(0)}%
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {getConfidenceLevel(result.confidence)}
                      </Badge>
                      <Progress value={result.confidence} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Valuation Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Low Estimate</span>
                        <span className="font-medium">
                          {formatCurrency(Math.min(result.assetBasedValue, result.incomeBasedValue, result.marketBasedValue))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">High Estimate</span>
                        <span className="font-medium">
                          {formatCurrency(Math.max(result.assetBasedValue, result.incomeBasedValue, result.marketBasedValue))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                        <span>Most Likely Value</span>
                        <span className="text-emerald-600">{formatCurrency(result.weightedAverage)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methods" className="space-y-6">
                <div className="grid gap-6">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Asset-Based Approach</h3>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(animatedValues.asset)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Net asset value (Total Assets - Total Liabilities)
                      </p>
                      <Badge variant="outline">25% Weight</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Income-Based Approach</h3>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(animatedValues.income)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Discounted cash flow based on projected income and growth
                      </p>
                      <Badge variant="outline">40% Weight</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Market-Based Approach</h3>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(animatedValues.market)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Industry multiples applied to revenue with risk adjustments
                      </p>
                      <Badge variant="outline">35% Weight</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Key Metrics Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revenue Multiple</span>
                          <span className="font-medium">
                            {(result.weightedAverage / parseFloat(metrics.revenue)).toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Earnings Multiple</span>
                          <span className="font-medium">
                            {(result.weightedAverage / parseFloat(metrics.netIncome)).toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Asset Multiple</span>
                          <span className="font-medium">
                            {(result.weightedAverage / parseFloat(metrics.assets)).toFixed(1)}x
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Profit Margin</span>
                          <span className="font-medium">
                            {((parseFloat(metrics.netIncome) / parseFloat(metrics.revenue)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ROA</span>
                          <span className="font-medium">
                            {((parseFloat(metrics.netIncome) / parseFloat(metrics.assets)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Debt-to-Asset Ratio</span>
                          <span className="font-medium">
                            {((parseFloat(metrics.liabilities) / parseFloat(metrics.assets)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <Target className="h-5 w-5" />
                      <span className="font-medium">Valuation Notes</span>
                    </div>
                    <ul className="text-sm text-amber-600 space-y-1 list-disc list-inside">
                      <li>This valuation is an estimate based on provided financial data</li>
                      <li>Actual business value may vary based on market conditions and buyer perception</li>
                      <li>Consider professional appraisal for legal or transaction purposes</li>
                      <li>Industry multiples are based on market averages and may not reflect current conditions</li>
                    </ul>
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