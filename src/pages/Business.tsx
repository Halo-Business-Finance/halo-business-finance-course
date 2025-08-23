import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, Award, HeadphonesIcon } from "lucide-react";

const Business = () => {
  const features = [
    {
      icon: Building2,
      title: "Enterprise Solutions",
      description: "Scalable learning management system designed for organizations of all sizes."
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Advanced user management with role-based access and progress tracking."
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reporting",
      description: "Comprehensive insights into team performance and learning outcomes."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance and data protection."
    },
    {
      icon: Award,
      title: "Custom Certifications",
      description: "Create branded certificates and learning paths tailored to your organization."
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Support",
      description: "24/7 priority support with dedicated customer success manager."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Badge className="mb-4">For Business</Badge>
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Transform Your Team's Skills</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Empower your organization with our comprehensive learning platform. Scale your team's expertise 
          with industry-leading courses and enterprise features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-blue-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of organizations that trust our platform to develop their teams. 
          Contact our sales team for a custom demo and pricing.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Schedule Demo</Button>
          <Button size="lg" variant="outline">Contact Sales</Button>
        </div>
      </div>
    </div>
  );
};

export default Business;