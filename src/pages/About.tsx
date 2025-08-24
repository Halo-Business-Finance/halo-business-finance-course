import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, BookOpen, Award, TrendingUp, Clock, Users2, FileText, Crown } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <img 
          src={aboutHero} 
          alt="Professional team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Badge className="mb-3 md:mb-4 bg-white/20 text-white border-white/30 text-sm">About Us</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">About Halo Business Finance</h1>
            <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              We're dedicated to advancing careers in commercial lending through our comprehensive 
              FinPilot training program, providing world-class education for finance professionals.
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
                <div className="w-12 h-12 bg-halo-navy rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-halo-orange" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-foreground mb-1">{info.value}</div>
                  <div className="text-sm font-medium text-primary mb-2">{info.label}</div>
                  <div className="text-xs text-black leading-relaxed">{info.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-12 md:mb-16">
        <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-halo-navy rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-halo-orange" />
          </div>
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
                  <p className="text-black leading-relaxed">
                    Our curriculum combines theoretical knowledge with practical, hands-on training that reflects current 
                    industry practices. We're committed to providing finance professionals with the skills and confidence 
                    they need to excel in commercial lending.
                  </p>
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

      <div>
        <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-halo-navy rounded-lg flex items-center justify-center">
            <Crown className="h-5 w-5 md:h-6 md:w-6 text-halo-orange" />
          </div>
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
  );
};

export default About;