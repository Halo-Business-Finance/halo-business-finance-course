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
        
        <div className="relative container mx-auto px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0 hover:from-blue-700 hover:to-orange-600 mb-8 px-6 py-3 text-sm font-medium shadow-lg">
              <Star className="h-4 w-4" />
              Limited Time: 40% Off All Plans
            </Badge>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent">
                Success Plan
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-700 max-w-3xl mx-auto leading-relaxed mb-12">
              Accelerate your career with our world-class business finance training.
              <span className="block mt-2 font-semibold text-blue-800">Join 50,000+ successful professionals.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Premium Pricing Cards */}
      <div className="container mx-auto px-6 pb-24 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-8xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative group animate-fade-in ${plan.popular ? 'lg:scale-110 lg:-mt-8' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0 px-8 py-3 text-sm font-bold shadow-xl">
                        <Crown className="h-4 w-4 mr-2" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  </>
                )}
                
                <Card className={`relative bg-white/90 backdrop-blur-xl ${plan.borderColor} border-2 ${
                  plan.popular ? 'shadow-2xl shadow-blue-500/20' : 'shadow-xl hover:shadow-2xl'
                } rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 group-hover:border-opacity-60 ${
                  plan.popular ? 'border-blue-400' : ''
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-40`}></div>
                  
                  <CardHeader className="relative text-center pt-12 pb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:rotate-3`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    
                    <CardTitle className="text-3xl font-bold text-blue-900 mb-4">{plan.name}</CardTitle>
                    <CardDescription className="text-blue-700 text-lg leading-relaxed px-4">{plan.description}</CardDescription>
                    
                    <div className="mt-8">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {plan.originalPrice && (
                          <span className="text-2xl text-blue-400 line-through font-medium">${plan.originalPrice}</span>
                        )}
                        <span className={`text-6xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                          {plan.price}
                        </span>
                      </div>
                      <div className="text-blue-600 text-lg">
                        {plan.price !== "Custom" ? `per ${plan.period}` : plan.period}
                      </div>
                      {plan.originalPrice && (
                        <Badge className="mt-4 bg-orange-100 text-orange-800 border-orange-200 px-4 py-1">
                          Save {Math.round(((parseInt(plan.originalPrice) - parseInt(plan.price)) / parseInt(plan.originalPrice)) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative px-8 pb-8">
                    <ul className="space-y-5 mb-10">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-4 group/item">
                          <div className={`w-6 h-6 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mt-0.5 group-hover/item:scale-125 transition-all duration-300 shadow-lg`}>
                            <Check className="h-3.5 w-3.5 text-white font-bold" />
                          </div>
                          <span className="text-blue-800 text-lg group-hover/item:text-blue-900 transition-colors leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full text-lg py-6 font-bold transition-all duration-300 rounded-2xl ${
                        plan.popular 
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-2xl hover:shadow-blue-500/30 border-0 hover:scale-105` 
                          : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl border-0 hover:scale-105`
                      } shadow-lg`}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Start Learning"}
                      <Zap className="ml-3 h-5 w-5" />
                    </Button>
                    
                    {plan.popular && (
                      <p className="text-center text-sm text-blue-600 mt-4">
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
        <div className="text-center mt-20 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="max-w-4xl mx-auto">
            <Badge className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 border-orange-200 mb-8 px-6 py-3 text-lg font-medium">
              <Check className="h-5 w-5" />
              30-Day Money-Back Guarantee
            </Badge>
            
            <p className="text-blue-700 mb-12 text-xl">Trusted by professionals at top companies worldwide</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center opacity-60">
              {['Microsoft', 'Google', 'Amazon', 'Apple'].map((company, idx) => (
                <div key={idx} className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
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