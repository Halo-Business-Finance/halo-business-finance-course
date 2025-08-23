import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Zap, BarChart3 } from "lucide-react";

interface CashFlowData {
  month: number;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  burnRate: number;
}

interface ProjectionInputs {
  startingCash: string;
  monthlyRevenue: string;
  revenueGrowth: string;
  fixedExpenses: string;
  variableExpenseRate: string;
  projectionMonths: string;
}

export const CashFlowProjector = () => {
  const [inputs, setInputs] = useState<ProjectionInputs>({
    startingCash: "50000",
    monthlyRevenue: "25000",
    revenueGrowth: "5",
    fixedExpenses: "15000",
    variableExpenseRate: "30",
    projectionMonths: "12"
  });

  const [projectionData, setProjectionData] = useState<CashFlowData[]>([]);
  const [breakEvenMonth, setBreakEvenMonth] = useState<number | null>(null);
  const [runwayMonths, setRunwayMonths] = useState<number | null>(null);

  const calculateProjections = () => {
    const startingCash = parseFloat(inputs.startingCash);
    const monthlyRevenue = parseFloat(inputs.monthlyRevenue);
    const revenueGrowth = parseFloat(inputs.revenueGrowth) / 100;
    const fixedExpenses = parseFloat(inputs.fixedExpenses);
    const variableRate = parseFloat(inputs.variableExpenseRate) / 100;
    const months = parseInt(inputs.projectionMonths);

    const data: CashFlowData[] = [];
    let cumulativeCashFlow = startingCash;
    let breakEven: number | null = null;
    let runway: number | null = null;

    for (let month = 1; month <= months; month++) {
      const revenue = monthlyRevenue * Math.pow(1 + revenueGrowth, month - 1);
      const variableExpenses = revenue * variableRate;
      const totalExpenses = fixedExpenses + variableExpenses;
      const netCashFlow = revenue - totalExpenses;
      
      cumulativeCashFlow += netCashFlow;
      
      const burnRate = netCashFlow < 0 ? Math.abs(netCashFlow) : 0;

      data.push({
        month,
        revenue,
        expenses: totalExpenses,
        netCashFlow,
        cumulativeCashFlow,
        burnRate
      });

      // Find break-even month
      if (netCashFlow >= 0 && !breakEven) {
        breakEven = month;
      }

      // Find runway (when cash runs out)
      if (cumulativeCashFlow <= 0 && !runway) {
        runway = month;
      }
    }

    setProjectionData(data);
    setBreakEvenMonth(breakEven);
    setRunwayMonths(runway);
  };

  const updateInput = (field: keyof ProjectionInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getHealthColor = (cashFlow: number) => {
    if (cashFlow >= 10000) return "text-green-600";
    if (cashFlow >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthStatus = (data: CashFlowData[]) => {
    if (data.length === 0) return { status: "Unknown", color: "text-gray-600" };
    
    const lastMonth = data[data.length - 1];
    const avgCashFlow = data.reduce((sum, month) => sum + month.netCashFlow, 0) / data.length;
    
    if (lastMonth.cumulativeCashFlow > parseFloat(inputs.startingCash) && avgCashFlow > 0) {
      return { status: "Healthy Growth", color: "text-green-600" };
    }
    if (lastMonth.cumulativeCashFlow > 0 && avgCashFlow >= 0) {
      return { status: "Stable", color: "text-blue-600" };
    }
    if (lastMonth.cumulativeCashFlow > 0) {
      return { status: "At Risk", color: "text-yellow-600" };
    }
    return { status: "Critical", color: "text-red-600" };
  };

  const healthStatus = getHealthStatus(projectionData);

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Cash Flow Projector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingCash">Starting Cash</Label>
              <Input
                id="startingCash"
                type="number"
                value={inputs.startingCash}
                onChange={(e) => updateInput('startingCash', e.target.value)}
                placeholder="50000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
              <Input
                id="monthlyRevenue"
                type="number"
                value={inputs.monthlyRevenue}
                onChange={(e) => updateInput('monthlyRevenue', e.target.value)}
                placeholder="25000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenueGrowth">Revenue Growth (%/month)</Label>
              <Input
                id="revenueGrowth"
                type="number"
                step="0.1"
                value={inputs.revenueGrowth}
                onChange={(e) => updateInput('revenueGrowth', e.target.value)}
                placeholder="5"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fixedExpenses">Fixed Monthly Expenses</Label>
              <Input
                id="fixedExpenses"
                type="number"
                value={inputs.fixedExpenses}
                onChange={(e) => updateInput('fixedExpenses', e.target.value)}
                placeholder="15000"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variableExpenseRate">Variable Expense Rate (%)</Label>
              <Input
                id="variableExpenseRate"
                type="number"
                value={inputs.variableExpenseRate}
                onChange={(e) => updateInput('variableExpenseRate', e.target.value)}
                placeholder="30"
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectionMonths">Projection Period (Months)</Label>
              <Input
                id="projectionMonths"
                type="number"
                value={inputs.projectionMonths}
                onChange={(e) => updateInput('projectionMonths', e.target.value)}
                placeholder="12"
                className="text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateProjections} className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Zap className="h-5 w-5 mr-2" />
            Generate Projection
          </Button>

          {projectionData.length > 0 && (
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly Data
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Final Cash Position</Label>
                      <div className={`text-3xl font-bold mt-2 ${getHealthColor(projectionData[projectionData.length - 1]?.cumulativeCashFlow)}`}>
                        {formatCurrency(projectionData[projectionData.length - 1]?.cumulativeCashFlow || 0)}
                      </div>
                      <Badge className={`mt-2 ${healthStatus.color.includes('green') ? 'bg-green-100 text-green-700' : healthStatus.color.includes('red') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {healthStatus.status}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Break-Even Month</Label>
                      <div className="text-3xl font-bold text-blue-600 mt-2">
                        {breakEvenMonth ? `Month ${breakEvenMonth}` : "Not Reached"}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {breakEvenMonth ? "Profitable" : "Needs Work"}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Cash Runway</Label>
                      <div className="text-3xl font-bold text-amber-600 mt-2">
                        {runwayMonths ? `${runwayMonths} Months` : "∞"}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {runwayMonths ? "Limited" : "Sustainable"}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <CardContent className="p-6 text-center">
                      <Label className="text-sm text-muted-foreground font-medium">Avg Monthly Burn</Label>
                      <div className="text-3xl font-bold text-purple-600 mt-2">
                        {formatCurrency(projectionData.reduce((sum, month) => sum + month.burnRate, 0) / projectionData.length)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        Average
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cash Flow Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectionData.slice(0, 6).map((month, index) => (
                        <div key={month.month} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {month.month}
                            </div>
                            <div>
                              <div className="font-medium">Month {month.month}</div>
                              <div className="text-sm text-muted-foreground">
                                Revenue: {formatCurrency(month.revenue)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getHealthColor(month.netCashFlow)}`}>
                              {month.netCashFlow >= 0 ? '+' : ''}{formatCurrency(month.netCashFlow)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total: {formatCurrency(month.cumulativeCashFlow)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Monthly Cash Flow Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Month</th>
                            <th className="text-left p-2">Revenue</th>
                            <th className="text-left p-2">Expenses</th>
                            <th className="text-left p-2">Net Cash Flow</th>
                            <th className="text-left p-2">Cumulative</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectionData.map((month) => (
                            <tr key={month.month} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-medium">{month.month}</td>
                              <td className="p-2 text-green-600">{formatCurrency(month.revenue)}</td>
                              <td className="p-2 text-red-600">{formatCurrency(month.expenses)}</td>
                              <td className={`p-2 font-medium ${getHealthColor(month.netCashFlow)}`}>
                                {month.netCashFlow >= 0 ? '+' : ''}{formatCurrency(month.netCashFlow)}
                              </td>
                              <td className={`p-2 font-medium ${getHealthColor(month.cumulativeCashFlow)}`}>
                                {formatCurrency(month.cumulativeCashFlow)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid gap-6">
                  {runwayMonths && runwayMonths <= 6 && (
                    <Card className="border-0 shadow-md bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-700 mb-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Critical Cash Flow Warning</span>
                        </div>
                        <p className="text-sm text-red-600">
                          Your business is projected to run out of cash in {runwayMonths} months. 
                          Consider immediate action to reduce expenses or increase revenue.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!breakEvenMonth && (
                    <Card className="border-0 shadow-md bg-yellow-50 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-yellow-700 mb-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Break-Even Not Achieved</span>
                        </div>
                        <p className="text-sm text-yellow-600">
                          Your business doesn't reach profitability in the projection period. 
                          Consider strategies to increase revenue or reduce costs.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Key Financial Ratios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Gross Margin</span>
                            <span className="font-medium">
                              {(100 - parseFloat(inputs.variableExpenseRate)).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Monthly Growth Rate</span>
                            <span className="font-medium">{inputs.revenueGrowth}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Fixed Cost Ratio</span>
                            <span className="font-medium">
                              {((parseFloat(inputs.fixedExpenses) / parseFloat(inputs.monthlyRevenue)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Cash Efficiency</span>
                            <span className="font-medium">
                              {projectionData[0] ? (projectionData[0].revenue / Math.abs(projectionData[0].netCashFlow || 1)).toFixed(1) : 'N/A'}x
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Revenue Run Rate</span>
                            <span className="font-medium">
                              {formatCurrency(parseFloat(inputs.monthlyRevenue) * 12)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Expense Run Rate</span>
                            <span className="font-medium">
                              {formatCurrency((parseFloat(inputs.fixedExpenses) + parseFloat(inputs.monthlyRevenue) * parseFloat(inputs.variableExpenseRate) / 100) * 12)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Recommendations</span>
                      </div>
                      <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                        <li>Monitor actual performance against projections monthly</li>
                        <li>Maintain 3-6 months of operating expenses in cash reserves</li>
                        <li>Focus on improving gross margins to reach profitability faster</li>
                        <li>Consider scenario planning for different growth rates</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};