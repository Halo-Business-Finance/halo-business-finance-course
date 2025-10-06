import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScenarioSimulationProps {
  element: any;
  onScore: (score: number) => void;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  challenge: string;
  options: {
    id: string;
    text: string;
    outcome: string;
    score: number;
    consequences: string[];
  }[];
}

export const ScenarioSimulation = ({ element, onScore }: ScenarioSimulationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [showOutcome, setShowOutcome] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const scenarios: Scenario[] = [
    {
      id: 'client-consultation',
      title: 'Client Consultation',
      description: 'A small business owner comes to you seeking an SBA Express loan',
      context: `Sarah owns a local bakery and wants to expand to a second location. 
                She has been in business for 3 years and has steady revenue of $200,000 annually. 
                She needs $150,000 for equipment and initial operating capital.`,
      challenge: 'What is your first step in the consultation?',
      options: [
        {
          id: 'review-financials',
          text: 'Review her financial statements and credit history',
          outcome: 'Excellent choice! Understanding the financial foundation is crucial.',
          score: 100,
          consequences: ['Client feels confident in your expertise', 'You identify potential issues early']
        },
        {
          id: 'discuss-timeline',
          text: 'Discuss her timeline and immediate needs',
          outcome: 'Good approach, but you should review financials first.',
          score: 70,
          consequences: ['Client appreciates the urgency focus', 'You may miss financial red flags']
        },
        {
          id: 'explain-process',
          text: 'Immediately explain the SBA Express loan process',
          outcome: 'Too early - you need to understand her situation first.',
          score: 40,
          consequences: ['Client may feel rushed', 'You lack context for proper guidance']
        }
      ]
    },
    {
      id: 'documentation-review',
      title: 'Documentation Review',
      description: 'You discover some issues with the client\'s documentation',
      context: `During your review, you find that Sarah's financial statements show 
                some inconsistencies and her business tax returns are missing key schedules.`,
      challenge: 'How do you handle this situation?',
      options: [
        {
          id: 'request-corrections',
          text: 'Request corrected documents and explain the importance',
          outcome: 'Perfect! Clear documentation is essential for approval.',
          score: 100,
          consequences: ['Application proceeds smoothly', 'Client learns proper documentation']
        },
        {
          id: 'proceed-anyway',
          text: 'Proceed with the application as-is',
          outcome: 'Risky choice - this could lead to rejection.',
          score: 20,
          consequences: ['High chance of loan denial', 'Client loses time and confidence']
        },
        {
          id: 'suggest-alternative',
          text: 'Suggest an alternative loan product',
          outcome: 'Unnecessary - SBA Express could work with proper documentation.',
          score: 60,
          consequences: ['Client may get suboptimal terms', 'Missed opportunity for SBA benefits']
        }
      ]
    },
    {
      id: 'final-presentation',
      title: 'Final Presentation',
      description: 'You\'re ready to present the loan package to the decision committee',
      context: `All documentation is complete and the application looks strong. 
                You need to present Sarah's case to the lending committee.`,
      challenge: 'What is your key focus in the presentation?',
      options: [
        {
          id: 'emphasize-strengths',
          text: 'Emphasize business strengths and growth potential',
          outcome: 'Excellent strategy! A positive narrative helps approval.',
          score: 100,
          consequences: ['Committee sees the opportunity', 'Client gets favorable terms']
        },
        {
          id: 'address-concerns',
          text: 'Focus on addressing potential concerns',
          outcome: 'Defensive approach - better to lead with strengths.',
          score: 70,
          consequences: ['Committee may focus on negatives', 'Creates unnecessary doubt']
        },
        {
          id: 'stick-to-facts',
          text: 'Present just the facts without interpretation',
          outcome: 'Too neutral - you need to advocate for your client.',
          score: 50,
          consequences: ['Missed opportunity to influence', 'Committee lacks guidance']
        }
      ]
    }
  ];

  const currentScenario = scenarios[currentStep];
  const progress = ((currentStep + 1) / scenarios.length) * 100;

  const handleChoice = (choiceId: string) => {
    const choice = currentScenario.options.find(opt => opt.id === choiceId);
    if (!choice) return;

    const newChoices = [...selectedChoices, choiceId];
    setSelectedChoices(newChoices);
    setTotalScore(totalScore + choice.score);
    setShowOutcome(true);

    // Show outcome toast
    toast({
      title: choice.score >= 80 ? "Great choice!" : choice.score >= 60 ? "Good choice" : "Consider alternatives",
      description: choice.outcome,
      variant: choice.score >= 60 ? "default" : "destructive"
    });
  };

  const handleNext = () => {
    if (currentStep < scenarios.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowOutcome(false);
    } else {
      // Complete simulation
      const finalScore = totalScore / scenarios.length;
      setIsComplete(true);
      onScore(finalScore);
      
      toast({
        title: "Simulation Complete!",
        description: `You achieved an average score of ${Math.round(finalScore)}%`,
        variant: finalScore >= 70 ? "default" : "destructive"
      });
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedChoices([]);
    setShowOutcome(false);
    setTotalScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const finalScore = totalScore / scenarios.length;
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h3 className="text-2xl font-bold">Simulation Complete!</h3>
          <p className="text-muted-foreground">
            You've successfully navigated the SBA Express loan scenario.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Score</span>
              <span className={`text-lg px-3 py-1 font-medium ${finalScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(finalScore)}%
              </span>
            </div>
            
            <div className="space-y-3">
              {scenarios.map((scenario, index) => {
                const choice = scenario.options.find(opt => opt.id === selectedChoices[index]);
                return (
                  <div key={scenario.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{scenario.title}</span>
                    <span className={`text-sm ${choice && choice.score >= 70 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {choice?.score || 0}%
                    </span>
                  </div>
                );
              })}
            </div>

            <Button onClick={handleRestart} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{element.title}</h3>
        <p className="text-muted-foreground">{element.description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>Step {currentStep + 1} of {scenarios.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {currentScenario.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Scenario Context</h4>
            <p className="text-sm text-blue-800">{currentScenario.context}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Challenge
            </h4>
            <p className="text-sm text-yellow-800">{currentScenario.challenge}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h4 className="font-semibold">What do you do?</h4>
            {currentScenario.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleChoice(option.id)}
                disabled={showOutcome}
              >
                <div>
                  <div className="font-medium">{option.text}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Outcome */}
          {showOutcome && (
            <div className="space-y-4">
              {(() => {
                const selectedChoice = currentScenario.options.find(
                  opt => opt.id === selectedChoices[selectedChoices.length - 1]
                );
                return selectedChoice ? (
                  <>
                    <div className={`p-4 rounded-lg ${
                      selectedChoice.score >= 80 ? 'bg-green-50' : 
                      selectedChoice.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <h4 className="font-semibold mb-2">Outcome</h4>
                      <p className="text-sm">{selectedChoice.outcome}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Consequences</h4>
                      <ul className="space-y-1">
                        {selectedChoice.consequences.map((consequence, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                            {consequence}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <span className={`text-sm font-medium ${selectedChoice.score >= 70 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        Score: {selectedChoice.score}%
                      </span>
                      <Button onClick={handleNext}>
                        {currentStep === scenarios.length - 1 ? 'Complete Simulation' : 'Next Scenario'}
                      </Button>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Score */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Score</span>
            <span className="text-sm text-muted-foreground">
              {selectedChoices.length > 0 ? Math.round(totalScore / selectedChoices.length) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};