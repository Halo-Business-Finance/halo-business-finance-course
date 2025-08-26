import { Building2, Mail, Phone, Globe, ArrowUpRight, Shield, Award, Users, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FinPilotBrandFooter = () => {
  return (
    <footer className="relative overflow-hidden mt-16 mx-4">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <CardContent className="p-8 lg:p-12">
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white">FinPilot</h3>
              </div>
              <p className="text-white text-base leading-relaxed mb-6 max-w-md">
                Navigate your financial future with expert guidance through comprehensive 
                professional development and certification programs trusted by industry leaders.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="group">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-2 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-white">2,500+</div>
                  <div className="text-xs text-white">Students</div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl mb-2 mx-auto group-hover:bg-accent/20 transition-colors">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-lg font-bold text-white">98%</div>
                  <div className="text-xs text-white">Success Rate</div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl mb-2 mx-auto group-hover:bg-emerald-500/20 transition-colors">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-white">5★</div>
                  <div className="text-xs text-white">Rating</div>
                </div>
              </div>
            </div>
            
            {/* Contact section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Get in Touch</h4>
              <div className="space-y-4">
                <a 
                  href="https://www.finpilot.com" 
                  className="group flex items-center gap-3 text-white hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Website</div>
                    <div className="text-xs text-white">www.finpilot.com</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                
                <a 
                  href="mailto:training@finpilot.com" 
                  className="group flex items-center gap-3 text-white hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-xs text-white">training@finpilot.com</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                
                <a 
                  href="tel:1-800-FINPILOT" 
                  className="group flex items-center gap-3 text-white hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-xs text-white">1-800-FINPILOT</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
            
            {/* Programs section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Training Programs</h4>
              <div className="space-y-3">
                {[
                  "Professional Certification",
                  "Commercial Lending Excellence", 
                  "Business Finance Mastery",
                  "Risk Management"
                ].map((program, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="group flex items-center gap-2 text-white hover:text-white transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:bg-accent transition-colors"></div>
                    <span className="text-sm">{program}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                <p className="text-sm text-white/80">Stay connected for latest updates and insights</p>
              </div>
              
              <div className="flex items-center gap-4">
                {[
                  { icon: Linkedin, href: "https://linkedin.com/company/finpilot", label: "LinkedIn", color: "hover:bg-blue-600/20" },
                  { icon: Twitter, href: "https://twitter.com/finpilot", label: "Twitter", color: "hover:bg-sky-500/20" },
                  { icon: Facebook, href: "https://facebook.com/finpilot", label: "Facebook", color: "hover:bg-blue-700/20" },
                  { icon: Instagram, href: "https://instagram.com/finpilot", label: "Instagram", color: "hover:bg-pink-500/20" }
                ].map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center justify-center w-12 h-12 bg-slate-700/30 rounded-xl ${social.color} transition-all duration-300 hover:scale-110`}
                      aria-label={social.label}
                    >
                      <IconComponent className="h-5 w-5 text-white group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="pt-8 border-t border-slate-700/50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white">
                © 2025 FinPilot. All rights reserved. Training Platform powered by advanced learning technologies.
              </p>
              
              <div className="flex items-center gap-6">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Use", href: "/terms" },
                  { label: "Data & Security", href: "/data-security" }
                ].map((link, index) => (
                  <a 
                    key={index}
                    href={link.href} 
                    className="text-sm text-white hover:text-white transition-colors relative group"
                  >
                    {link.label}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </footer>
  );
};