import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, BookOpen, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface LearningPath {
  title: string;
  duration: string;
  modules: number;
  description: string;
  features: string[];
}

interface CurriculumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningPath: LearningPath;
}

const getCurriculumDetails = (title: string) => {
  const curriculumMap: Record<string, {
    overview: string;
    modules: Array<{ title: string; description: string; duration: string }>;
    outcomes: string[];
  }> = {
    "Business Finance Foundations": {
      overview: "Build a solid foundation in business finance fundamentals. This comprehensive program covers essential concepts from financial statement analysis to risk assessment, preparing you for success in commercial lending.",
      modules: [
        { title: "Introduction to Business Finance", description: "Core principles and financial markets overview", duration: "3 hours" },
        { title: "Financial Statement Analysis", description: "Reading and interpreting financial statements", duration: "4 hours" },
        { title: "Cash Flow Management", description: "Understanding cash flow patterns and projections", duration: "3.5 hours" },
        { title: "Credit Risk Assessment", description: "Evaluating borrower creditworthiness", duration: "4 hours" },
        { title: "Loan Pricing & Structures", description: "Interest rate mechanics and loan structures", duration: "3 hours" },
        { title: "Industry Analysis", description: "Sector-specific lending considerations", duration: "3.5 hours" },
        { title: "Regulatory Framework", description: "Banking regulations and compliance", duration: "3 hours" },
        { title: "Best Practices & Case Studies", description: "Real-world applications and scenarios", duration: "4 hours" }
      ],
      outcomes: [
        "Master financial statement analysis techniques",
        "Understand cash flow evaluation methods",
        "Develop risk assessment skills",
        "Learn industry best practices",
        "Gain confidence in lending decisions"
      ]
    },
    "Commercial Lending Mastery": {
      overview: "Advanced training for experienced professionals ready to excel in commercial lending. Master complex deal structures, portfolio management, and advanced underwriting techniques.",
      modules: [
        { title: "Advanced Underwriting", description: "Complex credit analysis and decision making", duration: "5 hours" },
        { title: "Deal Structuring", description: "Creative financing solutions and structures", duration: "4.5 hours" },
        { title: "Portfolio Management", description: "Managing loan portfolios and risk", duration: "4 hours" },
        { title: "Commercial Real Estate", description: "CRE lending fundamentals and analysis", duration: "5 hours" },
        { title: "Equipment Financing", description: "Asset-based lending strategies", duration: "3.5 hours" },
        { title: "Working Capital Solutions", description: "Lines of credit and cash flow lending", duration: "4 hours" },
        { title: "Syndicated Lending", description: "Large deal structures and participation", duration: "4.5 hours" },
        { title: "Problem Loan Management", description: "Workout strategies and loss mitigation", duration: "4 hours" },
        { title: "Regulatory Compliance", description: "Advanced regulatory requirements", duration: "3.5 hours" },
        { title: "Market Analysis", description: "Economic factors and market trends", duration: "3 hours" },
        { title: "Customer Relationship Management", description: "Building lasting client relationships", duration: "3.5 hours" },
        { title: "Capstone Project", description: "Comprehensive deal analysis and presentation", duration: "6 hours" }
      ],
      outcomes: [
        "Execute complex commercial deals",
        "Develop sophisticated risk management skills",
        "Master portfolio optimization techniques",
        "Lead deal structuring initiatives",
        "Advance to senior lending roles"
      ]
    },
    "SBA Loan Specialist": {
      overview: "Become an expert in SBA lending programs. This specialized training covers all major SBA loan programs, application processes, and compliance requirements for successful SBA lending.",
      modules: [
        { title: "SBA Program Overview", description: "Understanding SBA mission and programs", duration: "2.5 hours" },
        { title: "7(a) Loan Program", description: "Most popular SBA loan program details", duration: "4 hours" },
        { title: "504 Loan Program", description: "Real estate and equipment financing", duration: "3.5 hours" },
        { title: "Application Process", description: "Step-by-step application guidance", duration: "3 hours" },
        { title: "Documentation Requirements", description: "Required forms and supporting documents", duration: "2.5 hours" },
        { title: "Compliance & Servicing", description: "Ongoing compliance and loan servicing", duration: "3 hours" }
      ],
      outcomes: [
        "Navigate all major SBA programs",
        "Streamline application processes",
        "Ensure regulatory compliance",
        "Increase SBA loan approval rates",
        "Become the go-to SBA specialist"
      ]
    }
  };

  return curriculumMap[title] || curriculumMap["Business Finance Foundations"];
};

export const CurriculumModal = ({ open, onOpenChange, learningPath }: CurriculumModalProps) => {
  const curriculum = getCurriculumDetails(learningPath.title);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-playfair text-halo-navy">
                {learningPath.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {learningPath.duration}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {learningPath.modules} modules
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base leading-relaxed text-foreground">
            {curriculum.overview}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Course Modules */}
          <div>
            <h3 className="text-lg font-semibold text-halo-navy mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Modules
            </h3>
            <div className="grid gap-3">
              {curriculum.modules.map((module, index) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-primary">Module {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {module.duration}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-halo-navy mb-1">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <h3 className="text-lg font-semibold text-halo-navy mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Learning Outcomes
            </h3>
            <div className="grid gap-3">
              {curriculum.outcomes.map((outcome, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Join 10,000+ professionals who have advanced their careers
            </div>
            <div className="space-y-3">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary text-white shadow-elevated">
                  Start Learning Today
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Sign up now to access the full curriculum and start your journey
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};