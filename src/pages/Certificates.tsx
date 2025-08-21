import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Calendar, CheckCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CertificatesPage = () => {
  const navigate = useNavigate();
  const certificates = [
    {
      name: "Business Finance Foundations",
      status: "available",
      description: "Fundamental concepts in business finance and financial analysis"
    },
    {
      name: "Capital Markets Specialist",
      status: "locked",
      description: "Advanced understanding of capital markets and investment strategies"
    },
    {
      name: "SBA Loan Expert",
      status: "locked",
      description: "Comprehensive knowledge of SBA loan programs and application processes"
    },
    {
      name: "Conventional Lending Specialist",
      status: "locked",
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
        <h1 className="text-2xl font-bold text-foreground">My Certificates & Credentials</h1>
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
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">1</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">7</div>
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
              {certificate.status === "available" && (
                <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
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