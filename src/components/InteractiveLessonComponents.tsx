import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InteractiveCalculatorProps {
  onComplete: () => void;
}

export const InteractiveCalculator = ({ onComplete }: InteractiveCalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(60);
  const [calculated, setCalculated] = useState(false);
  const { toast } = useToast();

  const calculatePayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                   (Math.pow(1 + monthlyRate, loanTerm) - 1);
    setCalculated(true);
    
    toast({
      title: "📊 Calculation Complete!",
      description: `Monthly payment: $${payment.toFixed(2)}`,
    });

    setTimeout(() => onComplete(), 3000);
    return payment;
  };

  const monthlyPayment = calculated ? calculatePayment() : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Equipment Financing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="loan-amount">Loan Amount: ${loanAmount.toLocaleString()}</Label>
            <Slider
              value={[loanAmount]}
              onValueChange={(value) => setLoanAmount(value[0])}
              max={500000}
              min={10000}
              step={5000}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="interest-rate">Interest Rate: {interestRate}%</Label>
            <Slider
              value={[interestRate]}
              onValueChange={(value) => setInterestRate(value[0])}
              max={15}
              min={3}
              step={0.1}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="loan-term">Loan Term: {loanTerm} months</Label>
            <Slider
              value={[loanTerm]}
              onValueChange={(value) => setLoanTerm(value[0])}
              max={84}
              min={12}
              step={6}
              className="mt-2"
            />
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Monthly Payment:</span>
            <span className="text-2xl font-bold text-primary">
              ${calculated ? monthlyPayment.toFixed(2) : "---"}
            </span>
          </div>
          {calculated && (
            <div className="mt-2 text-sm text-muted-foreground">
              Total cost: ${(monthlyPayment * loanTerm).toLocaleString()}
            </div>
          )}
        </div>

        <Button onClick={calculatePayment} className="w-full" disabled={calculated}>
          {calculated ? "✓ Calculated" : "Calculate Payment"}
        </Button>
      </CardContent>
    </Card>
  );
};

interface DragDropItem {
  id: string;
  text: string;
  category: string;
}

interface InteractiveDragDropProps {
  onComplete: () => void;
}

export const InteractiveDragDrop = ({ onComplete }: InteractiveDragDropProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const items: DragDropItem[] = [
    { id: "1", text: "Equipment Purchase", category: "collateral" },
    { id: "2", text: "Personal Guarantee", category: "security" },
    { id: "3", text: "Business Revenue", category: "cashflow" },
    { id: "4", text: "Machinery Value", category: "collateral" },
    { id: "5", text: "UCC Filing", category: "security" },
    { id: "6", text: "Monthly Profit", category: "cashflow" },
  ];

  const categories = {
    collateral: { title: "Collateral", color: "bg-blue-50", items: [] as DragDropItem[] },
    security: { title: "Security Measures", color: "bg-green-50", items: [] as DragDropItem[] },
    cashflow: { title: "Cash Flow Factors", color: "bg-purple-50", items: [] as DragDropItem[] },
  };

  const [categorizedItems, setCategorizedItems] = useState(categories);
  const [availableItems, setAvailableItems] = useState(items);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (categoryKey: string) => {
    if (!draggedItem) return;

    const item = availableItems.find(i => i.id === draggedItem);
    if (!item) return;

    if (item.category === categoryKey) {
      // Correct placement
      setCategorizedItems(prev => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey as keyof typeof categories],
          items: [...prev[categoryKey as keyof typeof categories].items, item]
        }
      }));
      
      setAvailableItems(prev => prev.filter(i => i.id !== draggedItem));
      
      toast({
        title: "✅ Correct!",
        description: `"${item.text}" belongs in ${categories[categoryKey as keyof typeof categories].title}`,
      });

      // Check if all items are placed correctly
      if (availableItems.length === 1) {
        setCompleted(true);
        setTimeout(() => onComplete(), 2000);
      }
    } else {
      // Incorrect placement
      toast({
        title: "❌ Try Again",
        description: `"${item.text}" doesn't belong there. Think about its role in lending.`,
        variant: "destructive",
      });
    }

    setDraggedItem(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Categorize Lending Factors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Available Items:</h4>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border-2 border-dashed rounded-lg">
            {availableItems.map((item) => (
              <Badge
                key={item.id}
                variant="outline"
                className="cursor-move p-2 text-sm hover:bg-accent"
                draggable
                onDragStart={() => handleDragStart(item.id)}
              >
                {item.text}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(categorizedItems).map(([key, category]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 border-dashed min-h-[120px] ${category.color}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(key)}
            >
              <h5 className="font-medium mb-2">{category.title}</h5>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <Badge key={item.id} variant="secondary" className="block text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {item.text}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {completed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Excellent work! All factors categorized correctly.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ScenarioChoice {
  id: string;
  text: string;
  consequence: string;
  isCorrect: boolean;
}

interface InteractiveScenarioProps {
  onComplete: () => void;
}

export const InteractiveScenario = ({ onComplete }: InteractiveScenarioProps) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const scenario = {
    title: "Equipment Financing Decision",
    description: "A manufacturing client needs $300K for new equipment. They have been in business for 3 years, with steady revenue of $2M annually, but their debt-to-equity ratio is 0.8. What's your recommendation?",
    choices: [
      {
        id: "a",
        text: "Approve the full amount at standard rates",
        consequence: "High risk due to elevated debt ratios. Could lead to default if business faces challenges.",
        isCorrect: false
      },
      {
        id: "b",
        text: "Require additional collateral and approve at higher rates",
        consequence: "Good approach! Additional security mitigates the risk from high debt levels.",
        isCorrect: true
      },
      {
        id: "c",
        text: "Decline the application entirely",
        consequence: "Too conservative. The steady revenue and equipment collateral provide viable options.",
        isCorrect: false
      },
      {
        id: "d",
        text: "Approve 70% financing with equipment as sole collateral",
        consequence: "Reasonable compromise, but may want additional guarantees given the debt ratio.",
        isCorrect: true
      }
    ]
  };

  const handleChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowResult(true);
    
    const choice = scenario.choices.find(c => c.id === choiceId);
    if (choice?.isCorrect) {
      toast({
        title: "🎯 Excellent Decision!",
        description: "You demonstrated sound lending judgment.",
      });
      setTimeout(() => onComplete(), 4000);
    } else {
      toast({
        title: "🤔 Consider the Risks",
        description: "Review the consequence and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {scenario.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm leading-relaxed">{scenario.description}</p>
        </div>

        <div className="space-y-3">
          {scenario.choices.map((choice) => (
            <Button
              key={choice.id}
              variant={selectedChoice === choice.id ? "default" : "outline"}
              className="w-full justify-start text-left h-auto p-4"
              onClick={() => handleChoice(choice.id)}
              disabled={showResult}
            >
              <div>
                <div className="font-medium">{choice.text}</div>
                {showResult && selectedChoice === choice.id && (
                  <div className={`mt-2 text-sm ${choice.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center gap-1">
                      {choice.isCorrect ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      {choice.consequence}
                    </div>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {showResult && !scenario.choices.find(c => c.id === selectedChoice)?.isCorrect && (
          <Button 
            variant="secondary" 
            onClick={() => {
              setSelectedChoice(null);
              setShowResult(false);
            }}
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};