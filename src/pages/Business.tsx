import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, Award, HeadphonesIcon } from "lucide-react";
import businessHero from "@/assets/business-hero.jpg";
import enterpriseFeatures from "@/assets/enterprise-features.jpg";
import businessCta from "@/assets/business-cta.jpg";
import businessBgPattern from "@/assets/business-bg-pattern.jpg";

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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={businessHero} 
          alt="Professional corporate training environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">For Business</Badge>
            <h1 className="text-4xl font-bold mb-4">Transform Your Team's Skills</h1>
            <p className="text-lg">
              Empower your organization with our comprehensive learning platform. Scale your team's expertise 
              with industry-leading courses and enterprise features.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${businessBgPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="relative container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="relative">
                    <div 
                      className="absolute inset-0 opacity-5 rounded-t-lg"
                      style={{
                        backgroundImage: `url(${enterpriseFeatures})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="relative">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Call to Action Section */}
          <div className="relative rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${businessCta})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-6 max-w-2xl mx-auto opacity-90">
                Join thousands of organizations that trust our platform to develop their teams. 
                Contact our sales team for a custom demo and pricing.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">Schedule Demo</Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Business;