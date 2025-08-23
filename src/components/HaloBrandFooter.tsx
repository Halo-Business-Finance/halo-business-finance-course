import { Building2, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FinPilotBrandFooter = () => {
  return (
    <Card className="mt-12 bg-halo-navy text-white border-none">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-halo-orange" />
              <h3 className="text-lg font-semibold">FinPilot</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Navigate your financial future with expert guidance through comprehensive 
              professional development and certification programs.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3 text-halo-orange">Contact Information</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>www.finpilot.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>training@finpilot.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-FINPILOT</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3 text-halo-orange">Training Program</h4>
            <div className="text-sm text-white/80 space-y-1">
              <p>Professional Certification</p>
              <p>Commercial Lending Excellence</p>
              <p>Business Finance Mastery</p>
              <p>Industry-Leading Curriculum</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/20 text-center">
          <p className="text-xs text-white/60">
            © 2025 FinPilot. All rights reserved. | Training Platform powered by advanced learning technologies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};