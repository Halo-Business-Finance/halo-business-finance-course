import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Shield, Award, HeadphonesIcon, CheckCircle, Star, BarChart3, Globe, Clock, Zap, GraduationCap } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import businessHero from "@/assets/business-hero.jpg";
import businessCta from "@/assets/business-cta.jpg";
import businessMeeting from "@/assets/business-meeting.jpg";
import businessAnalytics from "@/assets/business-analytics.jpg";
import businessTeam from "@/assets/business-team.jpg";
import enterpriseSolutions from "@/assets/enterprise-solutions.jpg";
import teamManagement from "@/assets/team-management.jpg";
import analyticsReporting from "@/assets/analytics-reporting.jpg";
import securityCompliance from "@/assets/security-compliance.jpg";
import customCertifications from "@/assets/custom-certifications.jpg";
import dedicatedSupport from "@/assets/dedicated-support.jpg";
import LeadIntakeModal from "@/components/LeadIntakeModal";

const Business = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const features = [
    {
      icon: Building2,
      title: "Enterprise Solutions",
      description: "Scalable learning management system designed for organizations of all sizes, from startups to Fortune 500 companies.",
      benefits: ["Custom branding", "White-label options", "API integrations", "Unlimited users"],
      image: enterpriseSolutions
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Advanced user management with role-based access, automated reporting, and comprehensive progress tracking.",
      benefits: ["Role-based permissions", "Bulk user management", "Team analytics", "Automated notifications"],
      image: teamManagement
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reporting",
      description: "Comprehensive insights into team performance, learning outcomes, and ROI measurement with real-time dashboards.",
      benefits: ["Real-time dashboards", "Custom reports", "ROI tracking", "Performance metrics"],
      image: analyticsReporting
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 Type II compliance, GDPR compliance, and advanced data protection.",
      benefits: ["SOC 2 certified", "GDPR compliant", "End-to-end encryption", "Audit trails"],
      image: securityCompliance
    },
    {
      icon: Award,
      title: "Custom Certifications",
      description: "Create branded certificates and learning paths tailored to your organization's specific needs and industry requirements.",
      benefits: ["Custom certificates", "Branded learning paths", "Industry-specific content", "Accreditation tracking"],
      image: customCertifications
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Support",
      description: "24/7 priority support with dedicated customer success manager, onboarding assistance, and technical support.",
      benefits: ["24/7 support", "Dedicated CSM", "Onboarding help", "Technical assistance"],
      image: dedicatedSupport
    }
  ];

  const stats = [
    { label: "Enterprise Clients", value: "500+", icon: Building2 },
    { label: "User Satisfaction", value: "98%", icon: Star },
    { label: "Adaptive Learning", value: "100%", icon: GraduationCap },
    { label: "Career Advancement", value: "85%", icon: TrendingUp }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "VP of Human Resources",
      company: "TechCorp Industries",
      quote: "FinPilot's enterprise solution transformed our training program. We saw a 40% increase in employee engagement and measurable skill improvements across all departments.",
      rating: 5,
      logo: "TC"
    },
    {
      name: "Michael Rodriguez", 
      role: "Chief Learning Officer",
      company: "Global Finance Group",
      quote: "The analytics and reporting capabilities are outstanding. We can now track ROI on training investments and make data-driven decisions about our learning programs.",
      rating: 5,
      logo: "GF"
    },
    {
      name: "Emily Chen",
      role: "Training Director", 
      company: "Innovation Bank",
      quote: "Implementation was seamless and the ongoing support is exceptional. Our team productivity increased by 35% within the first quarter of implementation.",
      rating: 5,
      logo: "IB"
    }
  ];

  const pricingTiers = [
    {
      name: "Enterprise",
      userRange: "For organizations and large teams (10+ users)", 
      price: "Custom",
      period: "contact us",
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
      popular: false
    }
  ];

  return (
    <>
      <SEOHead 
        title="Enterprise Solutions | FinPilot for Organizations"
        description="Scale your team's finance expertise with FinPilot's enterprise learning platform. Custom branding, advanced analytics, and dedicated support for organizations of all sizes."
        keywords="enterprise training solutions, business learning platform, corporate finance training, team development, LMS for business, enterprise education"
        canonicalUrl="https://finpilot.com/enterprise"
      />
      <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <img 
          src={businessHero} 
          alt="Professional corporate training environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <Badge className="mb-3 md:mb-4 bg-white/20 text-white border-white/30 text-sm">Enterprise</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">Transform Your Team's Skills</h1>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Empower your organization with our comprehensive learning platform. Scale your team's expertise 
              with industry-leading courses and enterprise features.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4">Enterprise Features</Badge>
          <h2 className="text-3xl font-bold mb-4">Everything Your Organization Needs</h2>
          <p className="text-black max-w-3xl mx-auto">
            Our enterprise platform is designed to scale with your organization and deliver measurable results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-halo-navy rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-halo-orange" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-foreground mb-1">{feature.title}</div>
                    <div className="text-sm font-medium text-primary mb-2">Enterprise Feature</div>
                    <div className="text-xs text-black leading-relaxed mb-3">{feature.description}</div>
                    <div className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-black">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Analytics Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Badge className="mb-4">Advanced Analytics</Badge>
            <h3 className="text-2xl font-bold mb-4">Data-Driven Learning Insights</h3>
            <p className="text-black mb-6">
              Track progress, measure ROI, and optimize your training programs with comprehensive analytics and reporting tools.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Real-time progress tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>ROI measurement tools</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span>Team performance insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>Time-to-completion analytics</span>
              </div>
            </div>
          </div>
          <div>
            <img 
              src={businessAnalytics} 
              alt="Business analytics dashboard showing learning metrics and ROI data"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Team Collaboration Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <img 
              src={businessTeam} 
              alt="Business team collaborating on training programs"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
          <div className="order-1 lg:order-2">
            <Badge className="mb-4">Team Collaboration</Badge>
            <h3 className="text-2xl font-bold mb-4">Built for Modern Teams</h3>
            <p className="text-black mb-6">
              Foster collaboration and knowledge sharing across your organization with tools designed for modern workplace learning.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span>Team-based learning paths</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Department-specific content</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span>Group certifications</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <span>Automated workflows</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-halo-navy py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-6">Trusted by Leading Organizations</h2>
            <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
              Join hundreds of companies that have transformed their workforce with our enterprise learning platform.
            </p>
          </div>
          <div className="flex justify-center gap-12 md:gap-16 lg:gap-24">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center text-white">
                  <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-halo-orange/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <Icon className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-halo-orange" />
                  </div>
                  <div className="text-lg md:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/80 text-xs md:text-sm lg:text-base leading-tight">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">Enterprise Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing options designed to scale with your organization. All plans include our core curriculum and enterprise features.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className="relative border-2 border-primary shadow-xl">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{tier.userRange}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => setIsLeadModalOpen(true)}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-black">What Our Enterprise Clients Say</h2>
          <p className="text-black max-w-2xl mx-auto">
            See how leading organizations have transformed their training programs with FinPilot.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-black italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{testimonial.logo}</span>
                </div>
                <div>
                  <p className="font-semibold text-black">{testimonial.name}</p>
                  <p className="text-sm text-black">{testimonial.role}</p>
                  <p className="text-sm text-black">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Process */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-black">Seamless Implementation Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold mb-2">Discovery & Planning</h3>
                    <p className="text-muted-foreground">We analyze your needs and create a customized implementation plan.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold mb-2">Setup & Configuration</h3>
                    <p className="text-muted-foreground">Our team handles all technical setup and integrations.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold mb-2">Training & Launch</h3>
                    <p className="text-muted-foreground">Comprehensive training for administrators and end users.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold mb-2">Ongoing Support</h3>
                    <p className="text-muted-foreground">Continuous support and optimization to ensure success.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src={businessMeeting} 
                alt="Business meeting discussing implementation strategy"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative rounded-lg overflow-hidden mx-4">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${businessCta})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Organization?</h2>
          <p className="mb-8 max-w-2xl mx-auto text-lg opacity-90">
            Join thousands of organizations that trust our platform to develop their teams. 
            Schedule a personalized demo and see how FinPilot can drive results for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8" onClick={() => setIsDemoModalOpen(true)}>
              Request Schedule Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8" onClick={() => setIsLeadModalOpen(true)}>
              Contact Sales
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-75">Free consultation • No commitment required</p>
        </div>
      </div>
      
      <FinPilotBrandFooter />
      </div>

      {/* Lead Intake Modals */}
      <LeadIntakeModal
        isOpen={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        leadType="sales"
        leadSource="business_page"
      />
      <LeadIntakeModal
        isOpen={isDemoModalOpen}
        onOpenChange={setIsDemoModalOpen}
        leadType="demo"
        leadSource="business_page"
      />
    </>
  );
};
export default Business;