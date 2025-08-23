import { Building2, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HaloBrandFooter = () => {
  return (
    <Card className="mt-12 bg-halo-navy text-white border-none">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-halo-orange" />
              <h3 className="text-lg font-semibold">Halo Business Finance</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Empowering businesses through strategic finance solutions and comprehensive 
              professional development programs.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3 text-halo-orange">Contact Information</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>www.halobusinessfinance.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>training@halobusinessfinance.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-HALO-BIZ</span>
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
            © 2025 Halo Business Finance. All rights reserved. | Training Platform powered by advanced learning technologies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};