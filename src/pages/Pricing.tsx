import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Mail } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      description: "Perfect for individuals getting started",
      features: [
        "Access to 5 courses",
        "Basic support",
        "Certificate of completion",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "Best for professionals and teams",
      features: [
        "Access to all courses",
        "Priority support",
        "Advanced certificates",
        "Live sessions",
        "Progress tracking",
        "Custom learning paths"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For organizations and large teams",
      features: [
        "Everything in Professional",
        "Custom course development",
        "Dedicated account manager",
        "Advanced analytics",
        "API access",
        "Custom branding"
      ],
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
        <p className="text-lg text-black max-w-4xl mx-auto whitespace-nowrap">
          Select the perfect plan for your learning journey. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full flex items-center gap-2" 
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.name === "Enterprise" ? (
                  <>
                    <Mail className="h-4 w-4" />
                    Contact Sales
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Pricing;