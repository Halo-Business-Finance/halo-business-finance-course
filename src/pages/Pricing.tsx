import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Building, Zap, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      originalPrice: "$49",
      period: "month",
      description: "Perfect for individuals starting their journey",
      features: [
        "5 Premium Courses",
        "Certificate of Completion",
        "Mobile & Desktop Access",
        "Community Support",
        "Basic Analytics"
      ],
      popular: false,
      icon: Sparkles,
      gradient: "from-blue-800 to-blue-900", // Navy blue gradient
      bgGradient: "from-blue-50 to-blue-100", // Light Tarheel blue background
      borderColor: "border-blue-300"
    },
    {
      name: "Professional",
      price: "$79",
      originalPrice: "$129",
      period: "month",
      description: "Most popular choice for professionals",
      features: [
        "Unlimited Course Access",
        "Advanced Certifications",
        "Priority Expert Support",
        "Live Masterclass Sessions",
        "Custom Learning Paths",
        "Advanced Analytics",
        "1-on-1 Mentoring Sessions",
        "Career Advancement Tools"
      ],
      popular: true,
      icon: Crown,
      gradient: "from-blue-600 to-blue-700", // Royal blue gradient
      bgGradient: "from-blue-50 to-orange-50", // Tarheel blue to light orange
      borderColor: "border-blue-500"
    },
    {
      name: "Enterprise",
      price: "Custom",
      originalPrice: null,
      period: "tailored",
      description: "Comprehensive solution for organizations",
      features: [
        "Everything in Professional",
        "Custom Content Development",
        "Dedicated Success Manager",
        "Team Analytics Dashboard",
        "API & Integrations",
        "White-label Solutions",
        "Advanced Security & Compliance",
        "24/7 Premium Support"
      ],
      popular: false,
      icon: Building,
      gradient: "from-orange-500 to-orange-600", // Orange gradient
      bgGradient: "from-orange-50 to-blue-50", // Light orange to Tarheel blue
      borderColor: "border-orange-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Elegant Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-orange-500/10"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40">
            <div className="h-full w-full" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0 hover:from-blue-700 hover:to-orange-600 mb-6 px-4 py-2 text-xs font-medium shadow-lg">
              <Star className="h-3 w-3" />
              Limited Time: 40% Off All Plans
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent">
                Success Plan
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-700 max-w-2xl mx-auto leading-relaxed mb-8">
              Accelerate your career with our world-class business finance training.
              <span className="block mt-2 font-semibold text-blue-800">Join 50,000+ successful professionals.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Premium Pricing Cards */}
      <div className="container mx-auto px-6 pb-16 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative group animate-fade-in ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0 px-4 py-2 text-xs font-bold shadow-xl">
                        <Crown className="h-3 w-3 mr-1" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  </>
                )}
                
                <Card className={`relative bg-white/90 backdrop-blur-xl ${plan.borderColor} border-2 ${
                  plan.popular ? 'shadow-2xl shadow-blue-500/20' : 'shadow-xl hover:shadow-2xl'
                } rounded-2xl overflow-hidden transition-all duration-500 hover:scale-102 group-hover:border-opacity-60 ${
                  plan.popular ? 'border-blue-400' : ''
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-40`}></div>
                  
                  <CardHeader className="relative text-center pt-8 pb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:rotate-3`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-blue-900 mb-3">{plan.name}</CardTitle>
                    <CardDescription className="text-blue-700 text-base leading-relaxed px-2">{plan.description}</CardDescription>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {plan.originalPrice && (
                          <span className="text-lg text-blue-400 line-through font-medium">${plan.originalPrice}</span>
                        )}
                        <span className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                          {plan.price}
                        </span>
                      </div>
                      <div className="text-blue-600 text-base">
                        {plan.price !== "Custom" ? `per ${plan.period}` : plan.period}
                      </div>
                      {plan.originalPrice && (
                        <Badge className="mt-3 bg-orange-100 text-orange-800 border-orange-200 px-3 py-1 text-xs">
                          Save {Math.round(((parseInt(plan.originalPrice) - parseInt(plan.price)) / parseInt(plan.originalPrice)) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative px-6 pb-6">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 group/item">
                          <div className={`w-5 h-5 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mt-0.5 group-hover/item:scale-125 transition-all duration-300 shadow-lg`}>
                            <Check className="h-3 w-3 text-white font-bold" />
                          </div>
                          <span className="text-blue-800 text-base group-hover/item:text-blue-900 transition-colors leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full text-base py-4 font-bold transition-all duration-300 rounded-xl ${
                        plan.popular 
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl hover:shadow-blue-500/20 border-0 hover:scale-102` 
                          : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg border-0 hover:scale-102`
                      } shadow-lg`}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Start Learning"}
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                    
                    {plan.popular && (
                      <p className="text-center text-xs text-blue-600 mt-3">
                        Join 35,000+ professionals who chose this plan
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Trust & Guarantee Section */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="max-w-4xl mx-auto">
            <Badge className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 border-orange-200 mb-6 px-4 py-2 text-sm font-medium">
              <Check className="h-4 w-4" />
              30-Day Money-Back Guarantee
            </Badge>
            
            <p className="text-blue-700 mb-8 text-lg">Trusted by professionals at top companies worldwide</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center opacity-60">
              {['Microsoft', 'Google', 'Amazon', 'Apple'].map((company, idx) => (
                <div key={idx} className="text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;