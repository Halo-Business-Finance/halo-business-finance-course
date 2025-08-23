import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinancialCalculator } from "./FinancialCalculator";
import { ROICalculator } from "./ROICalculator";
import { CreditScoreSimulator } from "./CreditScoreSimulator";
import { LoanComparisonTool } from "./LoanComparisonTool";

interface ToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolType: string;
  toolTitle: string;
}

export const ToolModal = ({ open, onOpenChange, toolType, toolTitle }: ToolModalProps) => {
  const renderTool = () => {
    switch (toolType) {
      case "calculator":
        if (toolTitle.toLowerCase().includes("financial") || toolTitle.toLowerCase().includes("finance")) {
          return <FinancialCalculator />;
        }
        if (toolTitle.toLowerCase().includes("roi")) {
          return <ROICalculator />;
        }
        return <FinancialCalculator />;
      case "simulator":
        if (toolTitle.toLowerCase().includes("credit")) {
          return <CreditScoreSimulator />;
        }
        return <CreditScoreSimulator />;
      case "web_tool":
        if (toolTitle.toLowerCase().includes("comparison")) {
          return <LoanComparisonTool />;
        }
        return <LoanComparisonTool />;
      default:
        return <FinancialCalculator />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{toolTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderTool()}
        </div>
      </DialogContent>
    </Dialog>
  );
};