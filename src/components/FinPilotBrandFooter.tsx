import { Building2, Mail, Phone, Globe, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

export const FinPilotBrandFooter = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold text-black">FinPilot</h3>
              </div>
              <p className="text-black text-sm leading-relaxed mb-6 max-w-md">
                Navigate your financial future with expert guidance through comprehensive 
                professional development and certification programs.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a href="https://linkedin.com" className="text-black hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a href="https://twitter.com" className="text-black hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="https://facebook.com" className="text-black hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://instagram.com" className="text-black hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-black">
                  <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>www.finpilot.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-black">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>training@finpilot.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-black">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>1-800-FINPILOT</span>
                </div>
              </div>
            </div>

            {/* Training Programs */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">Programs</h4>
              <div className="space-y-2">
                <a href="/courses" className="block text-sm text-black hover:text-primary transition-colors">
                  Professional Certification
                </a>
                <a href="/courses" className="block text-sm text-black hover:text-primary transition-colors">
                  Commercial Lending Excellence
                </a>
                <a href="/courses" className="block text-sm text-black hover:text-primary transition-colors">
                  Business Finance Mastery
                </a>
                <a href="/courses" className="block text-sm text-black hover:text-primary transition-colors">
                  Industry-Leading Curriculum
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-black">
              © 2025 FinPilot. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a 
                href="/privacy" 
                className="text-xs text-black hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-xs text-black hover:text-primary transition-colors"
              >
                Terms of Use
              </a>
              <a 
                href="/data-security" 
                className="text-xs text-black hover:text-primary transition-colors"
              >
                Data & Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};