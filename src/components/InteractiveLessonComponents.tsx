import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Calculator, Target, Move, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";

interface InteractiveCalculatorProps {
  onComplete?: () => void;
}

// Interactive Calculator Component
export const InteractiveCalculator = ({ onComplete }: InteractiveCalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(60);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculatePayment = () => {
    const principal = loanAmount;
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm;
    
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    setMonthlyPayment(Math.round(payment * 100) / 100);
    setIsCalculated(true);
    
    toast({
      title: "Calculation Complete!",
      description: `Monthly payment: $${payment.toFixed(2)}`,
    });

    if (onComplete) onComplete();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          Interactive Loan Calculator
        </CardTitle>
        <CardDescription>
          Practice calculating loan payments with this interactive tool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount ($)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (months)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="text-lg font-medium"
            />
          </div>
        </div>
        
        <Button onClick={calculatePayment} className="w-full" size="lg">
          Calculate Monthly Payment
        </Button>
        
        {isCalculated && (
          <div className="p-4 bg-white rounded-lg border-2 border-green-300">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold text-green-700">${monthlyPayment.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Total amount: ${(monthlyPayment * loanTerm).toFixed(2)}
              </p>
            </div>
          </div>
        )}
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
  onComplete?: () => void;
}

// Interactive Drag & Drop Component
export const InteractiveDragDrop = ({ onComplete }: InteractiveDragDropProps) => {
  const [items] = useState<DragDropItem[]>([
    { id: "1", text: "Equipment Purchase", category: "Collateral" },
    { id: "2", text: "Annual Revenue", category: "Cash Flow" },
    { id: "3", text: "Debt Service Coverage", category: "Financial Ratio" },
    { id: "4", text: "Real Estate", category: "Collateral" },
    { id: "5", text: "Operating Expenses", category: "Cash Flow" },
    { id: "6", text: "Current Ratio", category: "Financial Ratio" },
  ]);

  const [droppedItems, setDroppedItems] = useState<Record<string, DragDropItem[]>>({
    "Collateral": [],
    "Cash Flow": [],
    "Financial Ratio": []
  });

  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDrop = (item: DragDropItem, category: string) => {
    const isCorrect = item.category === category;
    
    setDroppedItems(prev => ({
      ...prev,
      [category]: [...prev[category], item]
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct!",
        description: `${item.text} belongs in ${category}`,
      });
    } else {
      toast({
        title: "Try Again",
        description: `${item.text} doesn't belong in ${category}`,
        variant: "destructive"
      });
    }

    // Check completion
    const totalDropped = Object.values(droppedItems).reduce((sum, arr) => sum + arr.length, 0) + 1;
    if (totalDropped === items.length) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const availableItems = items.filter(item => 
    !Object.values(droppedItems).some(category => 
      category.some(dropped => dropped.id === item.id)
    )
  );

  return (
    <Card className="w-full max-w-4xl mx-auto border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Target className="h-5 w-5" />
          Interactive Categorization Exercise
        </CardTitle>
        <CardDescription>
          Drag the lending factors into their correct categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Progress: {score}/{items.length} correct</div>
          <Progress value={(score / items.length) * 100} className="w-32" />
        </div>

        {/* Available Items */}
        <div className="space-y-2">
          <h4 className="font-medium">Available Items:</h4>
          <div className="flex flex-wrap gap-2">
            {availableItems.map(item => (
              <Badge 
                key={item.id} 
                variant="outline" 
                className="cursor-move p-2 hover:bg-gray-100"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(item))}
              >
                <Move className="h-3 w-3 mr-1" />
                {item.text}
              </Badge>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(droppedItems).map(category => (
            <div 
              key={category}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-32"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const itemData = JSON.parse(e.dataTransfer.getData("text/plain"));
                handleDrop(itemData, category);
              }}
            >
              <h4 className="font-medium mb-2">{category}</h4>
              <div className="space-y-1">
                {droppedItems[category].map(item => (
                  <div 
                    key={item.id} 
                    className={`p-2 rounded text-sm ${
                      item.category === category 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.category === category ? (
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                    )}
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isCompleted && (
          <div className="text-center p-4 bg-white rounded-lg border-2 border-green-300">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-800">
              Exercise Complete! Score: {score}/{items.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ScenarioChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  consequence: string;
}

interface InteractiveScenarioProps {
  onComplete?: () => void;
}

// Interactive Scenario Component
export const InteractiveScenario = ({ onComplete }: InteractiveScenarioProps) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scenario = {
    title: "SBA Loan Eligibility Scenario",
    description: "A restaurant owner wants to expand their business with a second location. They have been operating for 3 years with annual revenue of $800,000. The owner wants to borrow $350,000 for the new location. What is your recommendation?",
    choices: [
      {
        id: "a",
        text: "Recommend SBA 7(a) loan - meets all requirements",
        isCorrect: true,
        feedback: "Correct! This is an ideal SBA 7(a) candidate.",
        consequence: "The business gets favorable terms and the expansion succeeds."
      },
      {
        id: "b", 
        text: "Decline - restaurant industry is too risky",
        isCorrect: false,
        feedback: "Incorrect. Restaurants are eligible for SBA loans.",
        consequence: "You miss a good lending opportunity."
      },
      {
        id: "c",
        text: "Require 50% down payment due to industry risk",
        isCorrect: false,
        feedback: "Incorrect. SBA loans typically require only 10-15% down.",
        consequence: "The borrower seeks financing elsewhere."
      },
      {
        id: "d",
        text: "Recommend conventional loan instead",
        isCorrect: false,
        feedback: "Incorrect. SBA loan would offer better terms for this borrower.",
        consequence: "Higher rates make the expansion less profitable."
      }
    ]
  };

  const handleChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowFeedback(true);
    
    const choice = scenario.choices.find(c => c.id === choiceId);
    if (choice?.isCorrect) {
      toast({
        title: "Excellent Decision!",
        description: choice.feedback,
      });
    } else {
      toast({
        title: "Learning Opportunity",
        description: choice?.feedback,
        variant: "destructive"
      });
    }

    if (onComplete) onComplete();
  };

  const selectedChoiceData = scenario.choices.find(c => c.id === selectedChoice);

  return (
    <Card className="w-full max-w-4xl mx-auto border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Lightbulb className="h-5 w-5" />
          {scenario.title}
        </CardTitle>
        <CardDescription>
          Analyze the scenario and choose the best course of action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-gray-700 leading-relaxed">{scenario.description}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">What would you recommend?</h4>
          {scenario.choices.map(choice => (
            <Button
              key={choice.id}
              variant={selectedChoice === choice.id ? "default" : "outline"}
              className={`w-full text-left justify-start p-4 h-auto ${
                showFeedback && selectedChoice === choice.id
                  ? choice.isCorrect 
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-500 bg-red-50 text-red-800'
                  : ''
              }`}
              onClick={() => !showFeedback && handleChoice(choice.id)}
              disabled={showFeedback}
            >
              <div className="text-wrap">
                <span className="font-medium mr-2">{choice.id.toUpperCase()}.</span>
                {choice.text}
              </div>
            </Button>
          ))}
        </div>

        {showFeedback && selectedChoiceData && (
          <div className={`p-4 rounded-lg border-2 ${
            selectedChoiceData.isCorrect 
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {selectedChoiceData.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="space-y-2">
                <p className="font-medium">{selectedChoiceData.feedback}</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Consequence:</strong> {selectedChoiceData.consequence}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component that showcases all interactive elements
export const InteractiveLessonComponents = () => {
  const [completedComponents, setCompletedComponents] = useState<Set<string>>(new Set());

  const handleComponentComplete = (componentName: string) => {
    setCompletedComponents(prev => new Set([...prev, componentName]));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Interactive Learning Components</h2>
        <p className="text-muted-foreground">
          Engage with hands-on tools and scenarios to master finance concepts
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant={completedComponents.has('calculator') ? 'default' : 'outline'}>
            Calculator {completedComponents.has('calculator') && '✓'}
          </Badge>
          <Badge variant={completedComponents.has('dragdrop') ? 'default' : 'outline'}>
            Categorization {completedComponents.has('dragdrop') && '✓'}
          </Badge>
          <Badge variant={completedComponents.has('scenario') ? 'default' : 'outline'}>
            Scenario {completedComponents.has('scenario') && '✓'}
          </Badge>
        </div>
      </div>

      <InteractiveCalculator onComplete={() => handleComponentComplete('calculator')} />
      <InteractiveDragDrop onComplete={() => handleComponentComplete('dragdrop')} />
      <InteractiveScenario onComplete={() => handleComponentComplete('scenario')} />

      {completedComponents.size === 3 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              All Interactive Components Completed!
            </h3>
            <p className="text-green-700">
              You've successfully engaged with all interactive learning elements. 
              Great job mastering these practical finance concepts!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};