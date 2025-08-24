import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Play, CheckCircle, Star, Zap, Target, Building, DollarSign, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { DemoVideoModal } from "@/components/DemoVideoModal";
import { CurriculumModal } from "@/components/CurriculumModal";
import { useState } from "react";
import heroBusinessTraining from "@/assets/commercial-lending-hero.jpg";
const learningPathsImage = "/lovable-uploads/49422402-b861-468e-8955-3f3cdaf3530c.png";
const softwareTrainingImage = "/lovable-uploads/78cb3c25-cbc5-4554-bba1-11cf532ee81d.png";
import careerSuccessImage from "@/assets/career-success.jpg";

const Index = () => {
  const { user } = useAuth();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState<any>(null);

  // If user is logged in, redirect to dashboard
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  const stats = [
    { label: "Industry Professionals Trained", value: "10,000+", icon: Users },
    { label: "Certification Success Rate", value: "96%", icon: Award },
    { label: "Course Completion Rate", value: "94%", icon: Target },
    { label: "Career Advancement Rate", value: "87%", icon: TrendingUp }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Loan Officer",
      company: "First National Bank",
      content: "The FinPilot program transformed my understanding of commercial lending. I received a promotion within 6 months of completion.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Business Development Manager",
      company: "Capital Solutions Group",
      content: "Exceptional curriculum and real-world case studies. This program gave me the confidence to handle complex deals.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Credit Analyst",
      company: "Metro Commercial Finance",
      content: "The interactive tools and expert instructors made complex concepts easy to understand and apply immediately.",
      rating: 5
    }
  ];

  const learningPaths = [
    {
      title: "Business Finance Foundations",
      duration: "4 weeks",
      modules: 8,
      description: "Master the fundamentals of business finance, financial analysis, and lending principles.",
      features: ["Financial Statement Analysis", "Cash Flow Management", "Risk Assessment", "Industry Best Practices"]
    },
    {
      title: "Commercial Lending Mastery",
      duration: "6 weeks", 
      modules: 12,
      description: "Advanced commercial lending strategies, underwriting, and portfolio management.",
      features: ["Advanced Underwriting", "Deal Structuring", "Portfolio Management", "Regulatory Compliance"]
    },
    {
      title: "SBA Loan Specialist",
      duration: "3 weeks",
      modules: 6,
      description: "Comprehensive training on SBA loan programs, application processes, and compliance.",
      features: ["SBA Program Guide", "Application Process", "Documentation", "Compliance Requirements"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border/50 z-50">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <span className="font-playfair font-semibold text-lg md:text-xl text-halo-navy">FinPilot</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" className="text-black hover:bg-black/10 border border-black/20 text-sm md:text-base px-3 md:px-4">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-black text-white hover:bg-black/90 shadow-elevated text-sm md:text-base px-3 md:px-6">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get Started</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-halo-light-blue/20 to-background pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-12 lg:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
              <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left">
                
                <div className="space-y-3 md:space-y-4 lg:space-y-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-playfair font-bold leading-tight text-navy-blue">
                    Master Business Finance
                    <span className="block text-navy-blue">
                      & Commercial Lending
                    </span>
                  </h1>
                  
                  <div className="flex items-center justify-center lg:justify-start">
                    <Badge className="inline-flex items-center gap-1 md:gap-2 bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90 text-xs md:text-sm px-2 md:px-3 py-1">
                      <Zap className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Accelerate Your Career with the Industry's Top Course</span>
                      <span className="sm:hidden">Top Industry Course</span>
                    </Badge>
                  </div>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-black max-w-2xl mx-auto lg:mx-0">
                    Transform your career with our comprehensive business finance and commercial lending program. 
                    <span className="block mt-1 md:mt-2 font-medium text-black">Your Pathway to Lending Excellence.</span>
                    <span className="hidden md:inline">Developed by industry experts and delivered through Stanford-level curriculum.</span>
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-11 text-sm md:text-base lg:text-lg px-8 py-2 bg-gradient-primary text-white shadow-hero hover:shadow-elevated transition-all duration-300 group">
                      <span className="sm:hidden">Start Learning</span>
                      <span className="hidden sm:inline">Start Learning Today</span>
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto h-11 text-sm md:text-base lg:text-lg px-8 py-2 border-primary/20 hover:bg-primary/5 group"
                    onClick={() => setIsDemoModalOpen(true)}
                  >
                    <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Watch Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </Button>
                </div>

              </div>

              <div className="relative order-first lg:order-last">
                <img 
                  src={heroBusinessTraining} 
                  alt="Commercial lending training classroom with professionals learning loan underwriting" 
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-auto object-cover rounded-lg md:rounded-xl lg:rounded-2xl shadow-hero mx-auto lg:mx-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg md:rounded-xl lg:rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-halo-navy">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center text-white animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-halo-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Icon className="h-6 w-6 md:h-8 md:w-8 text-halo-orange" />
                  </div>
                  <div className="text-xl md:text-3xl font-bold font-playfair mb-1 md:mb-2">{stat.value}</div>
                  <div className="text-white/80 text-xs md:text-sm leading-tight">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <img 
                src={learningPathsImage} 
                alt="FinPilot dashboard showing course progress and modules"
                className="w-full h-auto rounded-xl md:rounded-2xl shadow-elevated"
              />
            </div>
            <div className="text-center lg:text-left space-y-4 order-1 lg:order-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-playfair font-bold text-halo-navy">
                Choose Your Path to Success
              </h2>
              <div className="flex items-center justify-center lg:justify-start">
                <Badge className="inline-flex items-center gap-2 bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90 text-xs md:text-sm px-3 py-1">
                  <Target className="h-3 w-3 md:h-4 md:w-4" />
                  Structured Learning Paths
                </Badge>
              </div>
              <p className="text-sm md:text-base text-foreground max-w-3xl mx-auto lg:mx-0">
                <span className="font-medium text-primary">From Novice to Expert: We Train You Right.</span> Comprehensive training programs designed to meet you where you are and take you where you want to go.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {learningPaths.map((path, index) => (
              <Card key={index} className="relative border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated group">
                <CardHeader className="space-y-4 p-4 md:p-6">
                  <div className="flex items-center justify-end">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg md:text-xl font-playfair group-hover:text-primary transition-colors">
                    {path.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90 w-fit">
                    {path.duration} • {path.modules} modules
                  </Badge>
                  <CardDescription className="text-sm leading-relaxed text-foreground">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 md:p-6 pt-0">
                  <div className="space-y-3">
                    {path.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-black">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-gradient-primary text-white group-hover:shadow-md transition-all text-sm md:text-base"
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
            <div className="text-center lg:text-left space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-playfair font-bold text-halo-navy">
                The #1 Course for Tomorrow's Lending Leaders
              </h2>
              <Badge className="inline-flex items-center gap-2 bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90 mt-4 text-xs md:text-sm px-3 py-1">
                <Star className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">The Gold Standard in Commercial Lending Software Training</span>
                <span className="sm:hidden">Gold Standard Training</span>
              </Badge>
              <p className="text-sm md:text-base text-foreground max-w-3xl mx-auto lg:mx-0">
                <span className="font-medium text-accent">The Definitive Course for Commercial Lending Software.</span> Building Tomorrow's Lending Experts Today through industry-leading curriculum designed to accelerate your success.
              </p>
            </div>
            <div>
              <img 
                src={softwareTrainingImage} 
                alt="Learning platform showing SBA loan courses and skill-based modules" 
                className="w-full h-auto rounded-xl md:rounded-2xl shadow-elevated"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: BookOpen,
                title: "Expert Curriculum",
                description: "Master Lending Software. Minimize Complications. 8 comprehensive modules covering everything from credit analysis to portfolio management.",
                color: "primary"
              },
              {
                icon: Users,
                title: "Industry Experts", 
                description: "Knowledge is Power. We Teach You How to Use It. Learn from seasoned professionals with decades of experience in business lending.",
                color: "accent"
              },
              {
                icon: Award,
                title: "Certification",
                description: "Confidence in Every Commercial Lending Deal. Earn recognized certificates that validate your expertise in business finance.",
                color: "primary"
              },
              {
                icon: TrendingUp,
                title: "Career Growth",
                description: "Level Up Your Lending Career. Advance your career with in-demand skills that employers are actively seeking.",
                color: "accent"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className={`w-16 h-16 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-playfair group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-halo-navy">
              What Our Graduates Say
            </h2>
            <Badge className="inline-flex items-center gap-2 bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90">
              <Star className="h-4 w-4" />
              Success Stories
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="pt-4 border-t">
                    <div className="font-semibold text-halo-navy">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
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
      <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-halo-navy/90 to-halo-navy/70" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-playfair font-bold">
                  Transform Your Skills. Transform Your Career.
                </h2>
                <p className="text-base opacity-90 leading-relaxed">
                  <span className="block mb-2 font-medium">Unlock Your Potential in Commercial Lending.</span>
                  Join thousands of professionals who have advanced their careers through our comprehensive training program. 
                  Financial Success, Simplified.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button className="text-base px-6 py-3 bg-white text-halo-navy hover:bg-white/90 shadow-hero group">
                    <Zap className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" className="text-base px-6 py-3 border-white text-white bg-transparent hover:bg-white hover:text-halo-navy">
                    <Shield className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex justify-center items-center gap-8 pt-8 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-halo-orange" />
                  <span>No Risk, 30-Day Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-halo-orange" />
                  <span>Industry Recognized Certification</span>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src={careerSuccessImage} 
                alt="Professional career success and advancement" 
                className="w-full h-auto rounded-2xl shadow-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FinPilotBrandFooter />
      
      {/* Demo Video Modal */}
      <DemoVideoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
      
      {/* Curriculum Modal */}
      {selectedLearningPath && (
        <CurriculumModal
          open={isCurriculumModalOpen}
          onOpenChange={setIsCurriculumModalOpen}
          learningPath={selectedLearningPath}
        />
      )}
    </div>
  );
};

export default Index;
