import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import coursesHero from "@/assets/courses-hero.jpg";
import financeCourseBg from "@/assets/finance-course-bg.jpg";
import learningBackground from "@/assets/learning-background.jpg";
import financeExpert1 from "@/assets/finance-expert-1.jpg";
import creditAnalyst2 from "@/assets/credit-analyst-2.jpg";
import commercialBanker3 from "@/assets/commercial-banker-3.jpg";
import riskSpecialist4 from "@/assets/risk-specialist-4.jpg";
import sbaSpecialist5 from "@/assets/sba-specialist-5.jpg";
import complianceOfficer6 from "@/assets/compliance-officer-6.jpg";
import financialAdvisor7 from "@/assets/financial-advisor-7.jpg";
import investmentBanker8 from "@/assets/investment-banker-8.jpg";
import loanOfficer9 from "@/assets/loan-officer-9.jpg";
import portfolioManager10 from "@/assets/portfolio-manager-10.jpg";

interface CourseModule {
  id: string;
  module_id: string;
  title: string;
  description: string;
  duration: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lessons_count: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prerequisites?: string[];
}

const Courses = () => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseModules();
  }, []);

  const fetchCourseModules = async () => {
    try {
      console.log('Fetching course modules...');
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      console.log('Course modules query result:', { data, error });

      if (error) {
        console.error('Error fetching course modules:', error);
        toast({
          title: "Error",
          description: "Failed to load course modules",
          variant: "destructive",
        });
        return;
      }

      console.log(`Found ${data?.length || 0} course modules`);
      setModules(data || []);
      
      // Check enrollment status for each module if user is logged in
      if (user && data) {
        const enrollmentChecks = await Promise.all(
          data.map(async (module) => {
            const { data: enrollment } = await supabase
              .from('course_enrollments')
              .select('id')
              .eq('user_id', user.id)
              .eq('course_id', module.module_id)
              .eq('status', 'active')
              .single();
            
            return { moduleId: module.module_id, isEnrolled: !!enrollment };
          })
        );

        const statusMap = enrollmentChecks.reduce((acc, { moduleId, isEnrolled }) => {
          acc[moduleId] = isEnrolled;
          return acc;
        }, {} as Record<string, boolean>);

        setEnrollmentStatus(statusMap);
      }
    } catch (error) {
      console.error('Error in fetchCourseModules:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (moduleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: moduleId,
          status: 'active'
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Enrollment Failed",
          description: "Failed to enroll in the course. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setEnrollmentStatus(prev => ({ ...prev, [moduleId]: true }));
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course!",
      });
    } catch (error) {
      console.error('Error in handleEnroll:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourseImage = (index: number) => {
    const images = [
      financeExpert1, 
      creditAnalyst2, 
      commercialBanker3, 
      riskSpecialist4, 
      sbaSpecialist5, 
      complianceOfficer6,
      financialAdvisor7,
      investmentBanker8,
      loanOfficer9,
      portfolioManager10
    ];
    return images[index % images.length];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  const courseCategories = [
    "All Courses",
    "Commercial Lending", 
    "Credit Analysis",
    "Risk Management",
    "SBA Loans",
    "Financial Analysis",
    "Compliance"
  ];

  const learningBenefits = [
    {
      title: "Industry-Leading Curriculum",
      description: "Developed by finance professionals with 20+ years of experience",
      icon: "🎓"
    },
    {
      title: "Practical Application",
      description: "Real-world case studies and hands-on exercises",
      icon: "💼"
    },
    {
      title: "Recognized Certification",
      description: "Certificates accepted by major financial institutions",
      icon: "🏆"
    },
    {
      title: "Career Advancement",
      description: "87% of graduates receive promotions within 12 months",
      icon: "📈"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Professional Finance Courses | Business Finance Training & Commercial Lending"
        description="Explore 25+ expert-led finance courses covering commercial lending, credit analysis, SBA loans, and risk management. Industry-recognized certifications with lifetime access."
        keywords="finance courses, commercial lending training, credit analysis certification, SBA loan courses, business finance education, professional development"
        canonicalUrl="https://finpilot.com/courses"
      />
      <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <header className="relative h-[32rem] overflow-hidden">
        <img 
          src={coursesHero} 
          alt="Professional online learning environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Course Catalog</Badge>
            <h1 className="text-4xl font-bold mb-4">Master Business Finance & Lending</h1>
            <p className="text-lg mb-6">
              Comprehensive professional training courses designed to advance your career in finance.
              Join 10,000+ professionals who've transformed their careers with our programs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>25+ Expert-Led Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Industry-Recognized Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Course Categories Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {courseCategories.map((category, index) => (
              <Badge 
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Learning Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Courses?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningBenefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {modules.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                Course modules will appear here once they are added by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Available Courses ({modules.length})</h2>
              <div className="text-sm text-muted-foreground">
                Showing all courses • Sort by: Newest First
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {modules.map((module, index) => (
              <Card key={module.id} className="hover:shadow-lg transition-all group">
                 <div className="relative">
                   <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                     <img 
                       src={getCourseImage(index)} 
                       alt={`Professional instructor for ${module.title}`}
                       className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                     />
                   </div>
                   <Badge className={`absolute top-3 right-3 ${getLevelColor(module.skill_level)}`}>
                     {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                   </Badge>
                 </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Commercial Finance</Badge>
                  </div>
                  <CardTitle className="text-xl text-blue-900 group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-black line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {module.duration || 'Self-paced'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {module.lessons_count || 0} lessons
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>2,340 students enrolled</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">(4.8)</span>
                        </div>
                      </div>
                      
                      {/* What You'll Learn */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">What you'll learn:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Financial statement analysis techniques</li>
                          <li>• Risk assessment methodologies</li>
                          <li>• Industry best practices</li>
                        </ul>
                      </div>
                      
                      {enrollmentStatus[module.module_id] ? (
                        <Link to={`/module/${module.module_id}`}>
                          <Button className="w-full" variant="outline">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleEnroll(module.module_id)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Enroll Now
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Limited preview for non-authenticated users */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {module.duration || 'Self-paced'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {module.lessons_count || 0} lessons
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg mb-4">
                        <p className="text-sm text-center text-muted-foreground">
                          Sign up to unlock full course details, enrollment, and start learning
                        </p>
                      </div>
                      
                      <Link to="/signup">
                        <Button className="w-full bg-primary text-white hover:bg-primary/90">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Sign Up to Access Course
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
            
            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of finance professionals who have advanced their careers with our comprehensive training programs.
                  Start with our most popular course or explore our full catalog.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary text-white">
                    Browse All Courses
                  </Button>
                  <Link to="/signup">
                    <Button size="lg" variant="outline">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <FinPilotBrandFooter />
    </div>
    </>
  );
};

export default Courses;