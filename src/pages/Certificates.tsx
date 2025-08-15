import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Calendar, CheckCircle, Lock } from "lucide-react";

const CertificatesPage = () => {
  const certificates = [
    {
      name: "Business Finance Foundations",
      status: "earned",
      earnedDate: "2024-07-15",
      credentialId: "HBF-2024-001",
      description: "Fundamental concepts in business finance and financial analysis"
    },
    {
      name: "Capital Markets Specialist",
      status: "earned",
      earnedDate: "2024-07-22",
      credentialId: "HBF-2024-002",
      description: "Advanced understanding of capital markets and investment strategies"
    },
    {
      name: "SBA Loan Expert",
      status: "in-progress",
      progress: 65,
      description: "Comprehensive knowledge of SBA loan programs and application processes"
    },
    {
      name: "Conventional Lending Specialist",
      status: "available",
      description: "Traditional lending practices and risk assessment methodologies"
    },
    {
      name: "Bridge Financing Expert",
      status: "locked",
      description: "Short-term financing solutions and bridge loan structuring"
    },
    {
      name: "Alternative Finance Specialist",
      status: "locked",
      description: "Non-traditional financing options and innovative funding solutions"
    },
    {
      name: "Credit Risk Analyst",
      status: "locked",
      description: "Advanced credit analysis and risk management techniques"
    },
    {
      name: "Regulatory Compliance Expert",
      status: "locked",
      description: "Financial regulations and compliance requirements"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "earned":
        return <Badge variant="completed" className="gap-1"><CheckCircle className="h-3 w-3" />Earned</Badge>;
      case "in-progress":
        return <Badge variant="progress">In Progress</Badge>;
      case "locked":
        return <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Locked</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Certificates & Credentials</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Certification Summary
          </CardTitle>
          <CardDescription>
            Your progress toward becoming a certified Halo Business Finance professional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">2</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">1</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">4</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="grid gap-4">
        {certificates.map((certificate, index) => (
          <Card key={certificate.name} className={certificate.status === "earned" ? "border-accent/20 bg-accent/5" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{certificate.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {certificate.description}
                  </CardDescription>
                </div>
                {getStatusBadge(certificate.status)}
              </div>
            </CardHeader>
            <CardContent>
              {certificate.status === "earned" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Earned: {formatDate(certificate.earnedDate)}
                    </div>
                    <div>
                      Credential ID: {certificate.credentialId}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" size="sm">
                      View Credential
                    </Button>
                  </div>
                </div>
              )}
              
              {certificate.status === "in-progress" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to certification</span>
                    <span className="font-medium">{certificate.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${certificate.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {certificate.status === "available" && (
                <Button size="sm" variant="outline">
                  Start Learning Path
                </Button>
              )}

              {certificate.status === "locked" && (
                <p className="text-sm text-muted-foreground">
                  Complete prerequisite modules to unlock this certification
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CertificatesPage;