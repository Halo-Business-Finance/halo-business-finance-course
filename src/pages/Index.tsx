import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Play, CheckCircle, Star, Zap, Target, Building, DollarSign, BarChart3, Shield, Check, Key } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { DemoVideoModal } from "@/components/DemoVideoModal";
import { CurriculumModal } from "@/components/CurriculumModal";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import heroBusinessTraining from "@/assets/commercial-lending-hero.jpg";
import businessTeam from "@/assets/business-team.jpg";
const learningPathsImage = "/lovable-uploads/49422402-b861-468e-8955-3f3cdaf3530c.png";
const softwareTrainingImage = "/lovable-uploads/49422402-b861-468e-8955-3f3cdaf3530c.png";
import careerSuccessImage from "@/assets/career-success.jpg";
const Index = () => {
  const {
    user
  } = useAuth();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState<any>(null);

  // If user is logged in, redirect to dashboard using React Router
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  const testimonials = [{
    name: "Sarah Johnson",
    role: "Senior Loan Officer",
    company: "First National Bank",
    content: "The FinPilot program transformed my understanding of commercial lending. I received a promotion within 6 months of completion.",
    rating: 5
  }, {
    name: "Michael Chen",
    role: "Business Development Manager",
    company: "Capital Solutions Group",
    content: "Exceptional curriculum and real-world case studies. This program gave me the confidence to handle complex deals.",
    rating: 5
  }, {
    name: "Emily Rodriguez",
    role: "Credit Analyst",
    company: "Metro Commercial Finance",
    content: "The interactive tools and expert instructors made complex concepts easy to understand and apply immediately.",
    rating: 5
  }];
  const learningPaths = [{
    title: "Business Finance Foundations",
    duration: "4 weeks",
    modules: 8,
    description: "Master the fundamentals of business finance, financial analysis, and lending principles.",
    features: ["Financial Statement Analysis", "Cash Flow Management", "Risk Assessment", "Industry Best Practices"]
  }, {
    title: "Commercial Lending Mastery",
    duration: "6 weeks",
    modules: 12,
    description: "Advanced commercial lending strategies, underwriting, and portfolio management.",
    features: ["Advanced Underwriting", "Deal Structuring", "Portfolio Management", "Regulatory Compliance"]
  }, {
    title: "SBA Loan Specialist",
    duration: "3 weeks",
    modules: 6,
    description: "Comprehensive training on SBA loan programs, application processes, and compliance.",
    features: ["SBA Program Guide", "Application Process", "Documentation", "Compliance Requirements"]
  }];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "FinPilot",
    "description": "Professional business finance training and certification platform for commercial lending professionals",
    "url": "https://finpilot.com",
    "logo": "https://finpilot.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "offers": [{
      "@type": "Course",
      "name": "Business Finance Foundations",
      "description": "Master the fundamentals of business finance, financial analysis, and lending principles",
      "provider": {
        "@type": "Organization",
        "name": "FinPilot"
      }
    }, {
      "@type": "Course",
      "name": "Commercial Lending Mastery",
      "description": "Advanced commercial lending strategies, underwriting, and portfolio management",
      "provider": {
        "@type": "Organization",
        "name": "FinPilot"
      }
    }]
  };
  return <>
      <SEOHead title="FinPilot - Master Business Finance & Commercial Lending | Professional Training" description="Transform your career with FinPilot's comprehensive business finance and commercial lending program. 96% certification success rate. Join 10,000+ professionals who've advanced their careers." keywords="business finance training, commercial lending certification, SBA loans, credit analysis, financial training, lending education, finance courses" structuredData={structuredData} canonicalUrl="https://finpilot.com" />
      <div className="min-h-screen bg-background">

        {/* Hero Section */}
        <div className="relative py-20 sm:py-24 md:py-28 lg:py-32">
          <div className="absolute inset-0 bg-cover" style={{
            backgroundImage: `url(${businessTeam})`,
            backgroundPosition: 'center 20%'
          }} />
          <div className="absolute inset-0 bg-black/20" />
          <div className="mobile-container relative z-10">
            <div className="max-w-4xl mx-auto text-left">
              <h1 className="text-responsive-3xl font-bold mb-4 sm:mb-6 text-white">
                Master Business Finance & Commercial Lending
              </h1>
              <p className="text-responsive-xl mb-3 sm:mb-4 text-white">
                Professional Training Platform for Finance Excellence
              </p>
              <p className="text-responsive-sm mb-6 sm:mb-8 text-white max-w-4xl">Transform your career with our comprehensive business finance and commercial lending program. Experience Stanford-level curriculum designed by industry experts.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-halo-navy hover:bg-white/90 font-semibold">
                    <Key className="mr-2 h-5 w-5 text-yellow-500" />
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Paths Section */}
        <section className="mobile-section bg-background" aria-labelledby="learning-paths-heading">
          <div className="mobile-container">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-8 md:mb-12">
              <div className="order-2 lg:order-1">
                <img src="/lovable-uploads/49422402-b861-468e-8955-3f3cdaf3530c.png" alt="Professional conference room meeting discussing real estate properties and commercial lending" className="w-full h-auto rounded-xl shadow-elevated" />
              </div>
              <div className="text-center lg:text-left space-y-4 order-1 lg:order-2">
                <h2 id="learning-paths-heading" className="text-responsive-3xl font-bold text-halo-navy">
                  Choose Your Path to Success
                </h2>
                <Badge className="inline-flex items-center gap-2 bg-white text-halo-orange text-sm md:text-base px-3 py-1 border-0 transition-none hover:bg-white hover:text-halo-orange">
                  <Target className="h-4 w-4" />
                  Structured Learning Paths
                </Badge>
                <p className="text-responsive-sm text-foreground max-w-3xl mx-auto lg:mx-0">
                  <span className="font-medium text-primary">From Novice to Expert: We Train You Right.</span> Comprehensive training programs designed to meet you where you are and take you where you want to go.
                </p>
              </div>
            </div>

            <div className="mobile-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {learningPaths.map((path, index) => (
                <Card key={index} className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated group">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-end">
                      <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-halo-orange" />
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {path.title}
                    </CardTitle>
                    <Badge className="text-xs text-halo-orange bg-white border-0 w-fit">
                      {path.duration} • {path.modules} modules
                    </Badge>
                    <CardDescription className="text-responsive-sm leading-relaxed text-foreground">
                      {path.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {path.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-responsive-sm text-black">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full bg-halo-navy hover:bg-halo-navy/90 text-white group-hover:shadow-md transition-all" 
                      onClick={() => {
                        setSelectedLearningPath(path);
                        setIsCurriculumModalOpen(true);
                      }}
                    >
                      View Curriculum
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mobile-section bg-gradient-to-br from-muted/30 to-background" aria-labelledby="features-heading">
          <div className="mobile-container">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-8 md:mb-12">
              <div className="text-center lg:text-left space-y-4">
                <h2 id="features-heading" className="text-responsive-3xl font-bold text-halo-navy">
                  The #1 Course for Tomorrow's Lending Leaders
                </h2>
                <Badge className="inline-flex items-center gap-2 bg-white text-halo-orange text-sm md:text-base px-3 py-1 border-0 transition-none hover:bg-white hover:text-halo-orange">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">The Gold Standard in Commercial Lending Software Training</span>
                  <span className="sm:hidden">Gold Standard Training</span>
                </Badge>
                <p className="text-responsive-sm text-foreground max-w-3xl mx-auto lg:mx-0">
                  <span className="font-medium text-black">The Definitive Course for Commercial Lending Software.</span> Building Tomorrow's Lending Experts Today through industry-leading curriculum designed to accelerate your success.
                </p>
              </div>
              <div>
                <img src={softwareTrainingImage} alt="Professional conference room meeting discussing commercial lending and financial services" className="w-full h-auto rounded-xl shadow-elevated" />
              </div>
            </div>

            <div className="mobile-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[{
                icon: BookOpen,
                title: "Expert Curriculum",
                description: "Master Lending Software. Minimize Complications. 8 comprehensive modules covering everything from credit analysis to portfolio management.",
                color: "primary"
              }, {
                icon: Users,
                title: "Industry Experts",
                description: "Knowledge is Power. We Teach You How to Use It. Learn from seasoned professionals with decades of experience in business lending.",
                color: "accent"
              }, {
                icon: Award,
                title: "Certification",
                description: "Confidence in Every Commercial Lending Deal. Earn recognized certificates that validate your expertise in business finance.",
                color: "primary"
              }, {
                icon: TrendingUp,
                title: "Career Growth",
                description: "Level Up Your Lending Career. Advance your career with in-demand skills that employers are actively seeking.",
                color: "accent"
              }].map((feature, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated group animate-fade-in" style={{
                  animationDelay: `${index * 0.1}s`
                }}>
                  <CardHeader>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-responsive-sm leading-relaxed text-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8 md:mt-12">
              <Link to="/signup">
                <Button size="lg" className="bg-halo-navy hover:bg-halo-navy/90 text-white shadow-elevated hover:shadow-hero">
                  <Key className="mr-2 h-4 w-4 text-yellow-500" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mobile-section bg-background" aria-labelledby="testimonials-heading">
          <div className="mobile-container">
            <div className="text-center space-y-4 mb-12 md:mb-16">
              <h2 id="testimonials-heading" className="text-responsive-3xl font-bold text-halo-navy">
                What Our Graduates Say
              </h2>
              <Badge className="inline-flex items-center gap-2 bg-white text-halo-orange border-0">
                <Star className="h-4 w-4" />
                Success Stories
              </Badge>
            </div>

            <div className="mobile-grid grid-cols-1 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated">
                  <CardContent className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed italic text-responsive-sm">
                      "{testimonial.content}"
                    </p>
                    <div className="pt-4 border-t">
                      <div className="font-semibold text-halo-navy text-responsive-sm">{testimonial.name}</div>
                      <div className="text-responsive-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="mobile-section bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-halo-navy/90 to-halo-navy/70" />
        <div className="mobile-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image - shows first on mobile/tablet */}
            <div className="order-1 lg:order-2">
              <img src={careerSuccessImage} alt="Professional career success and advancement" className="w-full h-auto rounded-xl shadow-hero" />
            </div>
            
            {/* Content - shows second on mobile/tablet */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="text-responsive-xl font-bold">
                  Transform Your Skills. Transform Your Career.
                </h2>
                <p className="text-responsive-sm opacity-90 leading-relaxed">
                  <span className="block mb-2 font-medium">Unlock Your Potential in Commercial Lending.</span>
                  Join thousands of professionals who have advanced their careers through our comprehensive training program. 
                  Financial Success, Simplified.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/course-catalog">
                  <Button variant="outline" className="w-full sm:w-auto border-white text-white bg-transparent hover:bg-white hover:text-halo-navy">
                    <Shield className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col justify-start items-start gap-4 pt-6 md:pt-8 text-white text-responsive-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-halo-orange" />
                  <span>Free 3-Day Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-halo-orange" />
                  <span>Advance Your Career</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-halo-orange" />
                  <span>Industry-Recognized Certification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-halo-orange" />
                  <span>No Risk, 30-Day Money Back Guarantee</span>
                </div>
                <Link to="/signup" className="mt-2">
                  <Button className="bg-halo-navy hover:bg-halo-navy/90 text-white border border-white shadow-hero group">
                    <Key className="mr-2 h-3 w-3 text-yellow-500" />
                    <ArrowRight className="mr-2 h-3 w-3 text-white group-hover:scale-110 transition-transform" />
                    Start Free Trial Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FinPilotBrandFooter />
      
      {/* Demo Video Modal */}
      <DemoVideoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      
      {/* Curriculum Modal */}
      {selectedLearningPath && <CurriculumModal open={isCurriculumModalOpen} onOpenChange={setIsCurriculumModalOpen} learningPath={selectedLearningPath} />}
    </div>
    </>;
};
export default Index;