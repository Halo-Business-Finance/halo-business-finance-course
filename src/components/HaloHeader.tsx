import { Building2, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HaloHeaderProps {
  title?: string;
  subtitle?: string;
  showCompanyInfo?: boolean;
}

export const HaloHeader = ({ 
  title = "Halo Business Finance Training Platform", 
  subtitle = "Professional Development & Certification Program",
  showCompanyInfo = true 
}: HaloHeaderProps) => {
  return (
    <Card className="mb-6 bg-gradient-hero border-none text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 text-blue-900">{title}</h1>
              <p className="text-white/90 text-sm">{subtitle}</p>
            </div>
          </div>
          
          {showCompanyInfo && (
            <div className="text-right hidden md:block">
              <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                <Globe className="h-4 w-4" />
                <span>www.halobusinessfinance.com</span>
              </div>
              <div className="text-white/80 text-xs">
                Empowering Business Growth Through Strategic Finance Solutions
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