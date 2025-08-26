import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Percent,
  PieChartIcon,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  Download,
  Share,
  Info
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface LoanScenario {
  principal: number;
  interestRate: number;
  termYears: number;
  loanType: string;
  downPayment: number;
}

interface CashFlowProjection {
  month: number;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

interface BusinessValuation {
  revenue: number;
  ebitda: number;
  assets: number;
  liabilities: number;
  industry: string;
  method: string;
  valuation: number;
}

export const InteractiveFinancialTools = () => {
  const [activeTab, setActiveTab] = useState('loan-calculator');
  
  // Loan Calculator State
  const [loanData, setLoanData] = useState<LoanScenario>({
    principal: 100000,
    interestRate: 6.5,
    termYears: 5,
    loanType: 'conventional',
    downPayment: 20000
  });

  // Cash Flow Projector State
  const [cashFlowData, setCashFlowData] = useState({
    initialRevenue: 50000,
    revenueGrowth: 10,
    fixedExpenses: 25000,
    variableExpenseRate: 60,
    projectionMonths: 12
  });

  // Business Valuation State
  const [valuationData, setValuationData] = useState<BusinessValuation>({
    revenue: 1000000,
    ebitda: 150000,
    assets: 500000,
    liabilities: 200000,
    industry: 'manufacturing',
    method: 'multiple',
    valuation: 0
  });

  // Credit Score Simulator State
  const [creditFactors, setCreditFactors] = useState({
    paymentHistory: 85,
    creditUtilization: 30,
    creditHistory: 120, // months
    creditMix: 4,
    newCredit: 2
  });

  const [projectedCashFlow, setProjectedCashFlow] = useState<CashFlowProjection[]>([]);
  const [loanPayments, setLoanPayments] = useState<any[]>([]);

  useEffect(() => {
    calculateLoanPayments();
    generateCashFlowProjection();
    calculateBusinessValuation();
  }, [loanData, cashFlowData, valuationData]);

  const calculateLoanPayments = () => {
    const { principal, interestRate, termYears } = loanData;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const payments = [];
    let remainingBalance = principal;

    for (let i = 1; i <= totalPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      payments.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    setLoanPayments(payments);
  };

  const generateCashFlowProjection = () => {
    const { initialRevenue, revenueGrowth, fixedExpenses, variableExpenseRate, projectionMonths } = cashFlowData;
    const projections: CashFlowProjection[] = [];
    let cumulativeFlow = 0;

    for (let month = 1; month <= projectionMonths; month++) {
      const monthlyGrowth = Math.pow(1 + revenueGrowth / 100 / 12, month - 1);
      const revenue = initialRevenue * monthlyGrowth;
      const variableExpenses = revenue * (variableExpenseRate / 100);
      const totalExpenses = fixedExpenses + variableExpenses;
      const netCashFlow = revenue - totalExpenses;
      cumulativeFlow += netCashFlow;

      projections.push({
        month,
        revenue,
        expenses: totalExpenses,
        netCashFlow,
        cumulativeCashFlow: cumulativeFlow
      });
    }

    setProjectedCashFlow(projections);
  };

  const calculateBusinessValuation = () => {
    const { revenue, ebitda, assets, liabilities, industry, method } = valuationData;
    let valuation = 0;

    // Industry multiples (simplified)
    const industryMultiples = {
      'manufacturing': { revenue: 1.2, ebitda: 8 },
      'technology': { revenue: 3.5, ebitda: 15 },
      'retail': { revenue: 0.8, ebitda: 6 },
      'services': { revenue: 1.5, ebitda: 10 },
      'healthcare': { revenue: 2.0, ebitda: 12 }
    };

    const multiplier = industryMultiples[industry as keyof typeof industryMultiples];

    switch (method) {
      case 'multiple':
        valuation = ebitda * multiplier.ebitda;
        break;
      case 'revenue':
        valuation = revenue * multiplier.revenue;
        break;
      case 'asset':
        valuation = assets - liabilities;
        break;
      default:
        valuation = ebitda * multiplier.ebitda;
    }

    setValuationData(prev => ({ ...prev, valuation }));
  };

  const calculateCreditScore = () => {
    const { paymentHistory, creditUtilization, creditHistory, creditMix, newCredit } = creditFactors;
    
    // Simplified credit score calculation
    let score = 300; // Base score
    
    // Payment history (35%)
    score += (paymentHistory / 100) * 315;
    
    // Credit utilization (30%) - lower is better
    score += (1 - creditUtilization / 100) * 270;
    
    // Credit history length (15%)
    score += Math.min(creditHistory / 240, 1) * 135; // 20 years max benefit
    
    // Credit mix (10%)
    score += Math.min(creditMix / 5, 1) * 90;
    
    // New credit (10%) - fewer inquiries is better
    score += (1 - Math.min(newCredit / 10, 1)) * 90;
    
    return Math.round(Math.min(score, 850));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Interactive Financial Tools
          </CardTitle>
          <p className="text-muted-foreground">
            Practice with real-world financial calculators and simulators
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="loan-calculator">Loan Calculator</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="credit-score">Credit Score</TabsTrigger>
        </TabsList>

        <TabsContent value="loan-calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Loan Amount</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={loanData.principal}
                      onChange={(e) => setLoanData(prev => ({ ...prev, principal: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Interest Rate (%)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[loanData.interestRate]}
                      onValueChange={([value]) => setLoanData(prev => ({ ...prev, interestRate: value }))}
                      min={1}
                      max={20}
                      step={0.1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {formatPercent(loanData.interestRate)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Term (Years)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[loanData.termYears]}
                      onValueChange={([value]) => setLoanData(prev => ({ ...prev, termYears: value }))}
                      min={1}
                      max={30}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {loanData.termYears} years
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Down Payment</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={loanData.downPayment}
                      onChange={(e) => setLoanData(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Payment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loanPayments.length > 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(loanPayments[0]?.payment || 0)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            loanPayments.reduce((sum, payment) => sum + payment.interest, 0)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={loanPayments.slice(0, 60)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Business Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Initial Monthly Revenue</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={cashFlowData.initialRevenue}
                      onChange={(e) => setCashFlowData(prev => ({ ...prev, initialRevenue: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Revenue Growth Rate (%)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[cashFlowData.revenueGrowth]}
                      onValueChange={([value]) => setCashFlowData(prev => ({ ...prev, revenueGrowth: value }))}
                      min={-10}
                      max={50}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {formatPercent(cashFlowData.revenueGrowth)} annually
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Fixed Monthly Expenses</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={cashFlowData.fixedExpenses}
                      onChange={(e) => setCashFlowData(prev => ({ ...prev, fixedExpenses: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Variable Expense Rate (%)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[cashFlowData.variableExpenseRate]}
                      onValueChange={([value]) => setCashFlowData(prev => ({ ...prev, variableExpenseRate: value }))}
                      min={10}
                      max={90}
                      step={5}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {formatPercent(cashFlowData.variableExpenseRate)} of revenue
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cash Flow Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectedCashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Expenses"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netCashFlow" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Net Cash Flow"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Company Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Annual Revenue</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={valuationData.revenue}
                      onChange={(e) => setValuationData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">EBITDA</label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={valuationData.ebitda}
                      onChange={(e) => setValuationData(prev => ({ ...prev, ebitda: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Total Assets</label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={valuationData.assets}
                        onChange={(e) => setValuationData(prev => ({ ...prev, assets: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Liabilities</label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={valuationData.liabilities}
                        onChange={(e) => setValuationData(prev => ({ ...prev, liabilities: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <div className="mt-2">
                    <select
                      className="w-full p-2 border rounded-md"
                      value={valuationData.industry}
                      onChange={(e) => setValuationData(prev => ({ ...prev, industry: e.target.value }))}
                    >
                      <option value="manufacturing">Manufacturing</option>
                      <option value="technology">Technology</option>
                      <option value="retail">Retail</option>
                      <option value="services">Services</option>
                      <option value="healthcare">Healthcare</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Valuation Method</label>
                  <div className="mt-2">
                    <select
                      className="w-full p-2 border rounded-md"
                      value={valuationData.method}
                      onChange={(e) => setValuationData(prev => ({ ...prev, method: e.target.value }))}
                    >
                      <option value="multiple">EBITDA Multiple</option>
                      <option value="revenue">Revenue Multiple</option>
                      <option value="asset">Asset-Based</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Valuation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Estimated Valuation</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(valuationData.valuation)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Revenue Multiple</span>
                      <span className="font-medium">
                        {(valuationData.valuation / valuationData.revenue).toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>EBITDA Multiple</span>
                      <span className="font-medium">
                        {(valuationData.valuation / valuationData.ebitda).toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Book Value</span>
                      <span className="font-medium">
                        {formatCurrency(valuationData.assets - valuationData.liabilities)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Valuation Note</p>
                        <p className="text-muted-foreground">
                          This is a simplified valuation model. Professional valuations consider many additional factors.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credit-score" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Credit Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Payment History (%)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[creditFactors.paymentHistory]}
                      onValueChange={([value]) => setCreditFactors(prev => ({ ...prev, paymentHistory: value }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {creditFactors.paymentHistory}% on-time payments
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Credit Utilization (%)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[creditFactors.creditUtilization]}
                      onValueChange={([value]) => setCreditFactors(prev => ({ ...prev, creditUtilization: value }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {creditFactors.creditUtilization}% of available credit used
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Credit History Length (months)</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[creditFactors.creditHistory]}
                      onValueChange={([value]) => setCreditFactors(prev => ({ ...prev, creditHistory: value }))}
                      min={6}
                      max={240}
                      step={6}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {Math.floor(creditFactors.creditHistory / 12)} years, {creditFactors.creditHistory % 12} months
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Types of Credit Accounts</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[creditFactors.creditMix]}
                      onValueChange={([value]) => setCreditFactors(prev => ({ ...prev, creditMix: value }))}
                      min={1}
                      max={5}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {creditFactors.creditMix} different account types
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Recent Credit Inquiries</label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[creditFactors.newCredit]}
                      onValueChange={([value]) => setCreditFactors(prev => ({ ...prev, newCredit: value }))}
                      min={0}
                      max={10}
                      step={1}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {creditFactors.newCredit} inquiries in last 2 years
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Credit Score Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Estimated Credit Score</p>
                    <p className="text-4xl font-bold text-primary">
                      {calculateCreditScore()}
                    </p>
                    <div className="mt-2">
                      <Badge variant={calculateCreditScore() >= 750 ? 'default' : calculateCreditScore() >= 670 ? 'secondary' : 'destructive'}>
                        {calculateCreditScore() >= 750 ? 'Excellent' : 
                         calculateCreditScore() >= 670 ? 'Good' : 
                         calculateCreditScore() >= 580 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment History (35%)</span>
                        <span>{creditFactors.paymentHistory}%</span>
                      </div>
                      <Progress value={creditFactors.paymentHistory} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Credit Utilization (30%)</span>
                        <span>{100 - creditFactors.creditUtilization}% (lower is better)</span>
                      </div>
                      <Progress value={100 - creditFactors.creditUtilization} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Credit History (15%)</span>
                        <span>{Math.min(creditFactors.creditHistory / 240 * 100, 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.min(creditFactors.creditHistory / 240 * 100, 100)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Credit Mix (10%)</span>
                        <span>{creditFactors.creditMix * 20}%</span>
                      </div>
                      <Progress value={creditFactors.creditMix * 20} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>New Credit (10%)</span>
                        <span>{100 - Math.min(creditFactors.newCredit * 10, 100)}%</span>
                      </div>
                      <Progress value={100 - Math.min(creditFactors.newCredit * 10, 100)} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Improvement Tips</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {creditFactors.paymentHistory < 90 && <li>• Make all payments on time</li>}
                      {creditFactors.creditUtilization > 30 && <li>• Keep credit utilization below 30%</li>}
                      {creditFactors.creditHistory < 120 && <li>• Keep old accounts open</li>}
                      {creditFactors.newCredit > 3 && <li>• Limit new credit applications</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};