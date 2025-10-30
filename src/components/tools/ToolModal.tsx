import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FinancialCalculator } from "./FinancialCalculator";
import { ROICalculator } from "./ROICalculator";
import { CreditScoreSimulator } from "./CreditScoreSimulator";
import { LoanComparisonTool } from "./LoanComparisonTool";
import { BusinessValuationTool } from "./BusinessValuationTool";
import { CashFlowProjector } from "./CashFlowProjector";

interface ToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolType: string;
  toolTitle: string;
}

export const ToolModal = ({ open, onOpenChange, toolType, toolTitle }: ToolModalProps) => {
  const renderTool = () => {
    const title = toolTitle.toLowerCase();
    
    // Enhanced tool routing based on title and type
    if (title.includes("business") && title.includes("valuation")) {
      return <BusinessValuationTool />;
    }
    if (title.includes("cash") && title.includes("flow")) {
      return <CashFlowProjector />;
    }
    if (title.includes("credit") || title.includes("score")) {
      return <CreditScoreSimulator />;
    }
    if (title.includes("roi") || title.includes("return")) {
      return <ROICalculator />;
    }
    if (title.includes("comparison") || title.includes("compare")) {
      return <LoanComparisonTool />;
    }
    if (title.includes("financial") || title.includes("loan") || title.includes("payment")) {
      return <FinancialCalculator />;
    }
    
    // Fallback based on tool type
    switch (toolType) {
      case "calculator":
        return <FinancialCalculator />;
      case "simulator":
        return <CreditScoreSimulator />;
      case "projector":
        return <CashFlowProjector />;
      case "valuator":
        return <BusinessValuationTool />;
      case "web_tool":
      default:
        return <LoanComparisonTool />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{toolTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderTool()}
        </div>
        <div className="mt-6">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Close Calculator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};