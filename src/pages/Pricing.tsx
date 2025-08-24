import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Mail, Star } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { useState } from "react";
import pricingHero from "@/assets/pricing-hero.jpg";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      annualPrice: "$290",
      annualPeriod: "per year",
      description: "Perfect for individuals getting started in finance",
      features: [
        "Access to 5 foundational courses",
        "Basic email support (48h response)",
        "Certificate of completion",
        "Mobile app access",
        "Basic progress tracking",
        "Community forum access"
      ],
      popular: false,
      savings: "Save $58 annually"
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month", 
      annualPrice: "$790",
      annualPeriod: "per year",
      description: "Best for professionals and small teams",
      features: [
        "Access to ALL 25+ courses",
        "Priority support (12h response)",
        "Advanced certificates with LinkedIn integration",
        "Live Q&A sessions with instructors",
        "Advanced progress tracking & analytics",
        "Custom learning paths",
        "Downloadable resources & templates",
        "Practice assessments & simulations",
        "Career guidance consultations",
        "Networking events access"
      ],
      popular: true,
      savings: "Save $158 annually"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      annualPrice: "Custom",
      annualPeriod: "volume pricing",
      description: "For organizations and large teams (10+ users)",
      features: [
        "Everything in Professional",
        "Custom course development & branding",
        "Dedicated customer success manager",
        "Advanced team analytics & reporting",
        "Single Sign-On (SSO) integration",
        "API access for LMS integration",
        "Custom user roles & permissions",
        "White-label platform options",
        "On-site training sessions",
        "Compliance reporting & tracking",
        "24/7 phone support",
        "Service Level Agreement (SLA)"
      ],
      popular: false,
      savings: "Volume discounts available"
    }
  ];

  const faqs = [
    {
      question: "Can I switch plans at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 3-day free trial for the Professional plan. No credit card required to start."
    },
    {
      question: "What's included in the certificate?",
      answer: "Our certificates include your name, course completion date, skills acquired, and are verifiable with a unique ID. Professional and Enterprise certificates integrate with LinkedIn."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
    },
    {
      question: "Can I pay annually?",
      answer: "Yes! Annual payments offer significant savings - 2 months free for Basic and Professional plans."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
    }
  ];

  const testimonials = [
    {
      name: "Jennifer Martinez",
      role: "Senior Credit Analyst",
      company: "Regional Bank",
      quote: "The Professional plan gave me everything I needed to advance my career. The live sessions were invaluable.",
      rating: 5
    },
    {
      name: "Robert Chen", 
      role: "VP of Training",
      company: "Credit Union",
      quote: "Our Enterprise plan implementation was seamless. The custom reporting helps us track our team's progress perfectly.",
      rating: 5
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Image */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <img 
          src={pricingHero} 
          alt="Professional learning online with computer" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Badge className="mb-3 md:mb-4 bg-white/20 text-white border-white/30 text-sm">Pricing Plans</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">Choose Your Learning Plan</h1>
            <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Invest in your future with our comprehensive finance and lending education programs. 
              Start with a 3-day free trial and see the difference quality training makes.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-halo-navy text-halo-orange px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
            <Check className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">30-day money-back guarantee • Cancel anytime</span>
            <span className="sm:hidden">30-day guarantee</span>
          </div>
        </div>

      {/* Pricing Toggle */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="inline-flex gap-8">
          <button 
            className={`px-4 py-2 text-sm md:text-base font-medium transition-all ${
              !isAnnual ? 'text-halo-orange underline underline-offset-4 decoration-2 decoration-halo-navy' : 'text-halo-orange hover:scale-105'
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </button>
          <button 
            className={`px-4 py-2 text-sm md:text-base font-medium transition-all ${
              isAnnual ? 'text-halo-orange underline underline-offset-4 decoration-2 decoration-halo-navy' : 'text-halo-orange hover:scale-105'
            }`}
            onClick={() => setIsAnnual(true)}
          >
            <span className="hidden sm:inline">Annual (Save up to 20%)</span>
            <span className="sm:hidden">Annual</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 md:mb-16">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/20' : 'border-2 border-halo-navy shadow-md'}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-black">{plan.name}</CardTitle>
              <CardDescription className="text-sm text-black">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-black">
                  {isAnnual ? plan.annualPrice : plan.price}
                </span>
                <span className="text-black ml-2 text-sm">
                  {isAnnual ? plan.annualPeriod : plan.period}
                </span>
              </div>
              {plan.savings && isAnnual && (
                <div className="text-sm text-black font-medium mt-1">{plan.savings}</div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-black">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full flex items-center gap-2 bg-halo-navy text-halo-orange hover:bg-halo-navy/90 border-halo-navy hover:text-halo-orange" 
                variant="outline"
              >
                {plan.name === "Enterprise" ? (
                  <>
                    <Mail className="h-4 w-4" />
                    Contact Sales
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {plan.name === "Professional" ? "Start Free Trial" : "Get Started"}
                  </>
                )}
              </Button>
              {plan.name === "Professional" && (
                <p className="text-xs text-center text-black mt-2">
                  3-day free trial, no credit card required
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testimonials Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">What Our Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <FinPilotBrandFooter />
      </div>
    </div>
  );
};

export default Pricing;