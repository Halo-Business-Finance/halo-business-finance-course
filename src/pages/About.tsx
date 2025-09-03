import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, BookOpen, Award, TrendingUp, Clock, Users2, FileText, Crown, Shield, Lock, Zap, Monitor, Cloud, CheckCircle, Smartphone, Globe, Database, Cpu, Server, ArrowRight, Play } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import aboutHero from "@/assets/about-hero.jpg";
import companStory from "@/assets/company-story.jpg";
import teamSarah from "@/assets/team-sarah.jpg";
import teamMichael from "@/assets/team-michael.jpg";
import teamEmily from "@/assets/team-emily.jpg";

const About = () => {
  const companyInfo = [
    { 
      label: "Industry Focus", 
      value: "Commercial Lending", 
      icon: Building,
      description: "Specialized training for commercial finance professionals"
    },
    { 
      label: "Learning Modules", 
      value: "12+", 
      icon: BookOpen,
      description: "Comprehensive curriculum covering all aspects of business finance"
    },
    { 
      label: "Certification Rate", 
      value: "96%", 
      icon: Award,
      description: "Students successfully completing our certification program"
    },
    { 
      label: "Career Advancement", 
      value: "87%", 
      icon: TrendingUp,
      description: "Graduates reporting career growth within 6 months"
    },
    { 
      label: "Course Duration", 
      value: "4-6 weeks", 
      icon: Clock,
      description: "Flexible learning paths designed for working professionals"
    },
    { 
      label: "Expert Instructors", 
      value: "15+", 
      icon: Users2,
      description: "Industry veterans with decades of lending experience"
    }
  ];

  const platformFeatures = [
    {
      title: "Interactive Learning Management System",
      description: "Modern LMS with progress tracking, real-time assessments, and personalized learning paths",
      icon: Monitor,
      features: ["Progress Analytics", "Adaptive Learning", "Real-time Feedback", "Mobile Access"]
    },
    {
      title: "Cloud-Based Infrastructure",
      description: "Scalable, reliable platform with 99.9% uptime and global accessibility",
      icon: Cloud,
      features: ["Global CDN", "Auto Scaling", "24/7 Monitoring", "Backup & Recovery"]
    },
    {
      title: "AI-Powered Recommendations",
      description: "Machine learning algorithms provide personalized course recommendations and study plans",
      icon: Cpu,
      features: ["Smart Recommendations", "Learning Analytics", "Performance Prediction", "Content Optimization"]
    }
  ];

  const securityFeatures = [
    {
      title: "Enterprise-Grade Security",
      description: "Bank-level security protocols protecting sensitive financial training data",
      icon: Shield,
      details: ["AES-256 Encryption", "Multi-Factor Authentication", "SOC 2 Compliance", "GDPR Compliant"]
    },
    {
      title: "Data Protection & Privacy",
      description: "Comprehensive data protection measures ensuring student privacy and regulatory compliance",
      icon: Lock,
      details: ["End-to-End Encryption", "Privacy Controls", "Data Anonymization", "Secure APIs"]
    },
    {
      title: "Secure Infrastructure",
      description: "Robust infrastructure with advanced threat detection and prevention systems",
      icon: Server,
      details: ["DDoS Protection", "Intrusion Detection", "Security Monitoring", "Vulnerability Scanning"]
    }
  ];

  const platformAdvantages = [
    {
      title: "Flexible Learning Experience",
      description: "Learn at your own pace with mobile-friendly design and offline capabilities",
      icon: Smartphone,
      benefits: ["Self-Paced Learning", "Mobile Optimization", "Offline Access", "Cross-Device Sync"]
    },
    {
      title: "Industry Integration",
      description: "Direct connections to leading financial institutions and lending software providers",
      icon: Globe,
      benefits: ["Partner Network", "Job Placement Assistance", "Industry Connections", "Real-World Projects"]
    },
    {
      title: "Advanced Analytics",
      description: "Comprehensive learning analytics and performance insights for continuous improvement",
      icon: Database,
      benefits: ["Learning Insights", "Performance Metrics", "Progress Tracking", "Skill Assessment"]
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      background: "Former VP of Learning at Fortune 500 company",
      image: teamSarah
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      background: "15+ years in EdTech and enterprise software",
      image: teamMichael
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Curriculum",
      background: "PhD in Education, former university professor",
      image: teamEmily
    }
  ];

  return (
    <>
      <SEOHead 
        title="About FinPilot | Professional Commercial Lending Training Platform"
        description="Learn about FinPilot's mission to advance careers in commercial lending through comprehensive training programs. Professional development for finance professionals."
        keywords="Halo Business Finance, commercial lending training company, FinPilot program, business finance education, lending professionals"
        canonicalUrl="https://finpilot.com/about"
      />
      <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[28rem] md:h-[32rem] lg:h-[32rem] overflow-hidden">
        <img 
          src={aboutHero} 
          alt="Professional team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Badge className="mb-3 md:mb-4 bg-white/20 text-white border-white/30 text-sm">About Us</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">About FinPilot</h1>
            <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              FinPilot is a comprehensive training platform designed to advance careers in commercial lending and business finance. 
              We provide world-class education and certification programs for finance professionals seeking to excel in today's competitive market.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
        {companyInfo.map((info, index) => {
          const Icon = info.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-halo-navy" />
                </div>
                <div className="flex-1">
                  {info.label === "Industry Focus" && (
                    <div className="text-2xl font-bold text-foreground mb-1">Business Finance</div>
                  )}
                  <div className="text-2xl font-bold text-foreground mb-1">{info.value}</div>
                  <div className="text-sm font-medium text-primary mb-2">{info.label}</div>
                  <div className="text-xs text-black leading-relaxed">{info.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center mb-12 md:mb-16">
        <Button size="lg" asChild className="bg-halo-navy hover:bg-halo-navy/90 text-white">
          <Link to="/signup" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mb-12 md:mb-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Our Story</h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8">
                  <p className="text-black leading-relaxed mb-6">
                    With over 15 years of experience in capital markets, SBA, and commercial lending, Halo Business Finance 
                    created the FinPilot course to address the growing need for specialized training in commercial lending. 
                    We recognized that traditional training methods weren't adequately preparing professionals for modern 
                    commercial lending complexities.
                  </p>
                  <p className="text-black leading-relaxed mb-6">
                    Our curriculum combines theoretical knowledge with practical, hands-on training that reflects current 
                    industry practices. We're committed to providing finance professionals with the skills and confidence 
                    they need to excel in commercial lending.
                  </p>
                  <Button size="lg" asChild className="bg-halo-navy hover:bg-halo-navy/90 text-white">
                    <Link to="/signup" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="h-64 lg:h-auto">
                  <img 
                    src={companStory} 
                    alt="Halo Business Finance team collaboration" 
                    className="w-full h-full object-cover rounded-r-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Platform Features */}
      <div className="mb-12 md:mb-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Advanced Learning Platform</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {platformFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-halo-navy" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-black">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-halo-orange" />
                        <span className="text-sm text-black">{feat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="bg-gradient-to-r from-halo-navy/5 to-halo-orange/5">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Our Platform Stands Out</h3>
              <p className="text-black leading-relaxed max-w-4xl mx-auto mb-6">
                Our cutting-edge learning management system combines the latest in educational technology with 
                practical commercial lending expertise. Built specifically for finance professionals, our platform 
                delivers personalized learning experiences that adapt to your pace and learning style, ensuring 
                maximum retention and real-world application.
              </p>
              <Button size="lg" asChild className="bg-halo-navy hover:bg-halo-navy/90 text-white">
                <Link to="/signup" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <div className="mb-12 md:mb-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Enterprise Security & Compliance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {securityFeatures.map((security, index) => {
            const Icon = security.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-halo-orange/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-halo-navy" />
                  </div>
                  <CardTitle className="text-xl">{security.title}</CardTitle>
                  <CardDescription className="text-black">{security.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {security.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-halo-orange" />
                        <span className="text-sm text-black font-medium">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="bg-halo-navy text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Financial-Grade Security</h3>
              <p className="leading-relaxed max-w-4xl mx-auto mb-6">
                We understand that financial training involves sensitive data. That's why we've implemented 
                bank-level security measures including end-to-end encryption, multi-factor authentication, 
                and compliance with SOC 2 and GDPR standards. Your learning data and personal information 
                are protected with the same level of security used by major financial institutions.
              </p>
              <Button size="lg" asChild className="bg-white text-halo-navy hover:bg-gray-100">
                <Link to="/signup" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Advantages */}
      <div className="mb-12 md:mb-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Platform Advantages</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {platformAdvantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-halo-navy" />
                  </div>
                  <CardTitle className="text-xl">{advantage.title}</CardTitle>
                  <CardDescription className="text-black">{advantage.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {advantage.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-halo-orange" />
                        <span className="text-sm text-black">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-halo-orange/10 to-halo-navy/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-halo-navy" />
                Global Accessibility
              </h3>
              <p className="text-black leading-relaxed">
                Access your training materials from anywhere in the world with our cloud-based platform. 
                Our global content delivery network ensures fast loading times regardless of your location, 
                making professional development accessible to finance professionals worldwide.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-halo-navy/10 to-halo-orange/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-halo-navy" />
                Continuous Innovation
              </h3>
              <p className="text-black leading-relaxed">
                Our platform continuously evolves with regular updates, new features, and enhanced 
                capabilities. We stay ahead of industry trends and incorporate the latest educational 
                technologies to ensure you're always learning with the most advanced tools available.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Button size="lg" asChild className="bg-halo-navy hover:bg-halo-navy/90 text-white">
            <Link to="/signup" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Leadership Team</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index}>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full mb-4 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={`${member.name} - ${member.role}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription className="font-medium text-primary">{member.role}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-black">{member.background}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <FinPilotBrandFooter />
      </div>
    </div>
    </>
  );
};

export default About;