import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award, Globe } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import aboutHero from "@/assets/about-hero.jpg";
import companStory from "@/assets/company-story.jpg";
import teamSarah from "@/assets/team-sarah.jpg";
import teamMichael from "@/assets/team-michael.jpg";
import teamEmily from "@/assets/team-emily.jpg";

const About = () => {
  const stats = [
    { label: "Students Trained", value: "50,000+", icon: Users },
    { label: "Courses Available", value: "200+", icon: Award },
    { label: "Countries Served", value: "45", icon: Globe },
    { label: "Success Rate", value: "95%", icon: Target }
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
            <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
            <p className="text-lg max-w-3xl mx-auto px-4">
              We're dedicated to democratizing professional education by providing world-class training 
              programs that help individuals and organizations unlock their full potential.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
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
                    Founded in 2018, our platform was born from the recognition that traditional training methods 
                    weren't keeping pace with the rapidly evolving business landscape. Our founders, drawing from 
                    decades of experience in finance, technology, and education, set out to create a learning 
                    platform that would bridge the gap between theoretical knowledge and practical application.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Today, we serve thousands of learners worldwide, from individual professionals seeking to 
                    advance their careers to large enterprises looking to upskill their workforce. Our commitment 
                    to excellence, innovation, and student success remains at the heart of everything we do.
                  </p>
                </div>
                <div className="h-64 lg:h-auto">
                  <img 
                    src={companStory} 
                    alt="Team collaboration in modern office" 
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