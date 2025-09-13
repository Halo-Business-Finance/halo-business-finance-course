import { CheckCircle, TrendingUp, AlertTriangle, BookOpen, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CorporateContentDisplayProps {
  lesson: {
    id: string;
    title: string;
    type: string;
  };
  content: {
    description: string;
    objectives: string[];
    keyPoints: string[];
    scenario?: {
      title: string;
      description: string;
      details: string[];
    };
  };
}

export const CorporateContentDisplay = ({ lesson, content }: CorporateContentDisplayProps) => {
  const getIndustryInsights = (title: string) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('equipment')) {
      return {
        marketData: [
          "Equipment financing market size: $1.2 trillion annually",
          "Average approval rate: 78% for qualified borrowers",
          "Typical terms: 24-84 months depending on equipment type"
        ],
        trends: [
          "Increasing demand for technology and healthcare equipment",
          "Growth in green energy equipment financing",
          "Digital transformation driving equipment upgrades"
        ],
        regulations: [
          "UCC filing requirements for equipment security interests",
          "Section 179 tax deduction benefits for businesses",
          "FASB lease accounting standards (ASC 842)"
        ]
      };
    }
    
    if (titleLower.includes('sba')) {
      return {
        marketData: [
          "SBA 7(a) loans: $28.2 billion in FY2023",
          "Average loan size: $538,000 for 7(a) loans",
          "Success rate: 85% of SBA borrowers remain in business"
        ],
        trends: [
          "Increased focus on underserved markets",
          "Digital lending platforms integration",
          "Enhanced minority business support programs"
        ],
        regulations: [
          "SBA Standard Operating Procedures (SOPs)",
          "Patriot Act compliance requirements",
          "Fair Credit Reporting Act (FCRA) obligations"
        ]
      };
    }
    
    return {
      marketData: [
        "Commercial lending market overview and statistics",
        "Industry growth trends and projections",
        "Key performance indicators and benchmarks"
      ],
      trends: [
        "Digital transformation in commercial lending",
        "Regulatory changes and compliance updates",
        "Market consolidation and competition"
      ],
      regulations: [
        "Federal and state compliance requirements",
        "Risk management and documentation standards",
        "Consumer and business protection laws"
      ]
    };
  };

  const industryData = getIndustryInsights(lesson.title);

  return (
    <div className="space-y-6">
      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Primary Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="jp-card-elegant">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Core Learning Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="jp-body text-base leading-relaxed">
                  {content.description}
                </p>
                
                {/* Enhanced Content Sections */}
                <Tabs defaultValue="fundamentals" className="mt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
                    <TabsTrigger value="application">Application</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Topics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fundamentals" className="space-y-4">
                    <div className="jp-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-primary">
                      <h4 className="jp-subheading mb-3 text-navy-900">Essential Principles</h4>
                      <ul className="space-y-2">
                        {content.objectives.slice(0, 2).map((objective, index) => (
                          <li key={index} className="flex items-start gap-2 jp-body text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="jp-card p-4">
                      <h5 className="jp-subheading mb-2">Key Definitions</h5>
                      <div className="grid gap-3">
                        <div className="border-l-2 border-l-primary pl-3">
                          <p className="jp-body text-sm font-medium">Loan-to-Value (LTV)</p>
                          <p className="jp-caption">The ratio of loan amount to asset value, typically 70-90%</p>
                        </div>
                        <div className="border-l-2 border-l-primary pl-3">
                          <p className="jp-body text-sm font-medium">Debt Service Coverage Ratio (DSCR)</p>
                          <p className="jp-caption">Cash flow available to service debt obligations</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="application" className="space-y-4">
                    {content.scenario && (
                      <div className="jp-card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
                        <h4 className="jp-subheading mb-3 text-green-800">Real-World Application</h4>
                        <h5 className="font-semibold text-green-700 mb-2">{content.scenario.title}</h5>
                        <p className="jp-body text-sm text-green-600 mb-3">{content.scenario.description}</p>
                        
                        <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                          <h6 className="jp-subheading mb-2 text-green-800">Case Details</h6>
                          <ul className="space-y-1">
                            {content.scenario.details.map((detail, index) => (
                              <li key={index} className="jp-caption text-green-700 flex items-start gap-2">
                                <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div className="jp-card p-4">
                      <h5 className="jp-subheading mb-3 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        Financial Analysis Framework
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <p className="jp-body text-sm font-medium">Step 1: Credit Assessment</p>
                          <p className="jp-caption">Evaluate borrower creditworthiness and capacity</p>
                        </div>
                        <div className="space-y-2">
                          <p className="jp-body text-sm font-medium">Step 2: Cash Flow Analysis</p>
                          <p className="jp-caption">Review historical and projected financial performance</p>
                        </div>
                        <div className="space-y-2">
                          <p className="jp-body text-sm font-medium">Step 3: Collateral Valuation</p>
                          <p className="jp-caption">Assess asset value and marketability</p>
                        </div>
                        <div className="space-y-2">
                          <p className="jp-body text-sm font-medium">Step 4: Risk Mitigation</p>
                          <p className="jp-caption">Structure terms and guarantees appropriately</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="jp-card p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
                      <h4 className="jp-subheading mb-3 text-purple-800">Advanced Considerations</h4>
                      <div className="space-y-3">
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                          <h5 className="jp-body font-semibold text-purple-700 mb-2">Risk Management</h5>
                          <p className="jp-caption text-purple-600">
                            Advanced portfolio management techniques, concentration limits, and stress testing methodologies.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                          <h5 className="jp-body font-semibold text-purple-700 mb-2">Regulatory Compliance</h5>
                          <p className="jp-caption text-purple-600">
                            Current regulatory landscape, upcoming changes, and compliance best practices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-4">
          {/* Market Intelligence */}
          <Card className="jp-card">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {industryData.marketData.map((data, index) => (
                <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                  <p className="jp-caption">{data}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Industry Trends */}
          <Card className="jp-card">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900 text-sm">Current Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {industryData.trends.map((trend, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {index + 1}
                  </Badge>
                  <p className="jp-caption">{trend}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Alert */}
          <Card className="jp-card border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="jp-heading text-orange-800 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Compliance Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {industryData.regulations.map((reg, index) => (
                <p key={index} className="jp-caption text-orange-700 text-xs">
                  • {reg}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card className="jp-card bg-gradient-to-b from-primary/5 to-navy-900/5">
            <CardHeader>
              <CardTitle className="jp-heading text-navy-900 text-sm">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="jp-caption">Max LTV</span>
                <Badge variant="outline" className="text-xs">90%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="jp-caption">Min DSCR</span>
                <Badge variant="outline" className="text-xs">1.25x</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="jp-caption">Typical Terms</span>
                <Badge variant="outline" className="text-xs">2-7 yrs</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};