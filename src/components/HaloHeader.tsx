import { Building2, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FinPilotHeaderProps {
  title?: string;
  subtitle?: string;
  showCompanyInfo?: boolean;
}

export const FinPilotHeader = ({ 
  title = "FinPilot Training Platform", 
  subtitle = "Professional Development & Certification Program",
  showCompanyInfo = true 
}: FinPilotHeaderProps) => {
  return (
    <Card className="mb-6 bg-gradient-hero border-none text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{color: '#1e3a8a'}}>{title}</h1>
              <p className="text-white/90 text-sm">{subtitle}</p>
            </div>
          </div>
          
          {showCompanyInfo && (
            <div className="text-right hidden md:block">
              <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                <Globe className="h-4 w-4" />
                <span>www.finpilot.com</span>
              </div>
              <div className="text-white/80 text-xs">
                Navigate Your Financial Future with Expert Guidance
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <div className="text-white/90 text-xs uppercase tracking-wide mb-1">Training Focus</div>
              <div className="text-sm font-medium">Commercial Lending Excellence</div>
            </div>
            <div>
              <div className="text-white/90 text-xs uppercase tracking-wide mb-1">Program Level</div>
              <div className="text-sm font-medium">Professional Certification</div>
            </div>
            <div>
              <div className="text-white/90 text-xs uppercase tracking-wide mb-1">Industry</div>
              <div className="text-sm font-medium">Business Finance & Lending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};