import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Building } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for individuals getting started",
      features: [
        "Access to 5 courses",
        "Basic support",
        "Certificate of completion",
        "Mobile app access",
        "Community access"
      ],
      popular: false,
      icon: Sparkles,
      gradient: "from-blue-500 to-cyan-500",
      buttonVariant: "outline" as const
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
        "Custom learning paths",
        "1-on-1 mentoring",
        "Advanced analytics"
      ],
      popular: true,
      icon: Crown,
      gradient: "from-purple-500 via-violet-500 to-pink-500",
      buttonVariant: "default" as const
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
        "Custom branding",
        "White-label solution",
        "24/7 phone support"
      ],
      popular: false,
      icon: Building,
      gradient: "from-emerald-500 to-teal-500",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            <Badge className="inline-flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30 mb-6 text-lg px-6 py-2">
              <Sparkles className="h-5 w-5" />
              Special Launch Pricing
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Choose Your Success Path
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Unlock your potential with our world-class business finance training. 
              <span className="block mt-2 font-semibold text-white">Transform your career today.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-20 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 group ${
                  plan.popular 
                    ? 'border-2 border-purple-200 shadow-2xl shadow-purple-500/25 scale-105 lg:scale-110' 
                    : 'border border-gray-200 hover:border-purple-300 shadow-xl hover:shadow-2xl'
                } bg-white/80 backdrop-blur-sm animate-fade-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <Badge className={`bg-gradient-to-r ${plan.gradient} text-white border-0 px-6 py-2 text-sm font-semibold shadow-lg`}>
                      🔥 Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                <CardHeader className="text-center pb-8 pt-8 relative">
                  <div className={`w-20 h-20 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 text-lg">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                        {plan.price}
                      </span>
                      <span className="text-gray-500 text-lg">/{plan.period.split(' ')[1] || plan.period}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className={`w-5 h-5 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full text-lg py-6 font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl hover:shadow-purple-500/25 border-0` 
                        : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl border-0`
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Trust Indicators */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-gray-600 mb-8 text-lg">Trusted by 10,000+ professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">FORTUNE 500</div>
            <div className="text-2xl font-bold text-gray-400">STANFORD</div>
            <div className="text-2xl font-bold text-gray-400">HARVARD</div>
            <div className="text-2xl font-bold text-gray-400">MIT</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;