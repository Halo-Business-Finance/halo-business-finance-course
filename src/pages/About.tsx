import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, BookOpen, Award, TrendingUp, Clock, Users2 } from "lucide-react";
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
      <div className="relative h-96 overflow-hidden">
        <img 
          src={aboutHero} 
          alt="Professional team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">About Us</Badge>
            <h1 className="text-4xl font-bold mb-4">About Halo Business Finance</h1>
            <p className="text-lg max-w-3xl mx-auto px-4">
              We're dedicated to advancing careers in commercial lending through our comprehensive 
              FinPilot training program, providing world-class education for finance professionals.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {companyInfo.map((info, index) => {
          const Icon = info.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-halo-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-halo-orange" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-foreground mb-1">{info.value}</div>
                  <div className="text-sm font-medium text-primary mb-2">{info.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{info.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-foreground text-center mb-8">Our Story</h2>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Halo Business Finance created the FinPilot course to address the growing need for specialized training in commercial lending. 
                    With over 15 years of experience in capital markets, SBA, and commercial lending, we recognized that 
                    traditional training methods weren't adequately preparing professionals for the complexities of 
                    modern commercial lending.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our comprehensive curriculum combines theoretical knowledge with practical, hands-on training that 
                    reflects current industry practices. We're committed to providing finance professionals with the 
                    skills and confidence they need to excel in commercial lending, from basic principles to advanced 
                    deal structuring and portfolio management.
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
        <h2 className="text-3xl font-bold text-foreground text-center mb-8">Leadership Team</h2>
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
                <p className="text-sm text-muted-foreground">{member.background}</p>
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