import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award, Globe } from "lucide-react";

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
      background: "Former VP of Learning at Fortune 500 company"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      background: "15+ years in EdTech and enterprise software"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Curriculum",
      background: "PhD in Education, former university professor"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Badge className="mb-4">About Us</Badge>
        <h1 className="text-4xl font-bold text-foreground mb-4">Our Mission</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We're dedicated to democratizing professional education by providing world-class training 
          programs that help individuals and organizations unlock their full potential.
        </p>
      </div>

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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
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
                <div className="mx-auto w-20 h-20 bg-muted rounded-full mb-4"></div>
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
    </div>
  );
};

export default About;