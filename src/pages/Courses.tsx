import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, AlertCircle, Check, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { CourseFilterSidebar } from "@/components/CourseFilterSidebar";
import PublicModuleCard from "@/components/PublicModuleCard";
import { courseData } from "@/data/courseData";
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

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'expert';
  modules: any[];
}

const Courses = () => {
  const [loading, setLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [titleFilter, setTitleFilter] = useState<string>('');
  const { user } = useAuth();

  // Use courseData directly for courses instead of individual modules
  const allCourses = courseData.allCourses;

  useEffect(() => {
    if (user) {
      checkEnrollmentStatus();
    }
  }, [user]);

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    
    try {
      const enrollmentChecks = await Promise.all(
        allCourses.map(async (course) => {
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .eq('status', 'active')
            .single();
          
          return { courseId: course.id, isEnrolled: !!enrollment };
        })
      );

      const statusMap = enrollmentChecks.reduce((acc, { courseId, isEnrolled }) => {
        acc[courseId] = isEnrolled;
        return acc;
      }, {} as Record<string, boolean>);

      setEnrollmentStatus(statusMap);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnroll = async (courseId: string) => {
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
          course_id: courseId,
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

      setEnrollmentStatus(prev => ({ ...prev, [courseId]: true }));
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

  // Generate course-specific lesson content
  const getCourseSpecificLessons = (moduleId: string, title: string) => {
    const lessonTemplates = {
      'sba-7a-loans': [
        { title: 'SBA 7(a) Program Overview', description: 'Understanding the SBA\'s flagship loan program and eligibility requirements' },
        { title: 'Loan Amounts & Terms', description: 'Maximum loan amounts up to $5 million and repayment terms' },
        { title: 'Eligible Uses & Restrictions', description: 'What businesses can and cannot use SBA 7(a) funds for' },
        { title: 'Application Process & Documentation', description: 'Step-by-step guide through the SBA 7(a) application process' }
      ],
      'sba-504-loans': [
        { title: 'SBA 504 Program Structure', description: 'Understanding the three-party loan structure and 10% down payment' },
        { title: 'Real Estate & Equipment Financing', description: 'Fixed-rate financing for owner-occupied commercial real estate' },
        { title: 'Certified Development Companies', description: 'Working with CDCs to secure 504 loan approval' },
        { title: 'Job Creation Requirements', description: 'Meeting employment and community development standards' }
      ],
      'capital-markets': [
        { title: 'Capital Markets Fundamentals', description: 'Introduction to debt and equity capital market structures' },
        { title: 'Commercial Finance Products', description: 'Overview of institutional lending and investment banking' },
        { title: 'Market Analysis & Trends', description: 'Current market conditions and financing opportunities' },
        { title: 'Deal Structuring Basics', description: 'Key principles in structuring commercial finance transactions' }
      ],
      'usda-bi-loans': [
        { title: 'USDA B&I Program Overview', description: 'Rural business development financing backed by USDA guarantee' },
        { title: 'Rural Area Eligibility', description: 'Determining if your business location qualifies for USDA funding' },
        { title: 'Loan Amounts & Guarantees', description: 'Up to $25 million with government backing for rural businesses' },
        { title: 'Application & Approval Process', description: 'Navigating USDA requirements and documentation' }
      ],
      'working-capital': [
        { title: 'Working Capital Essentials', description: 'Understanding cash flow gaps and operational funding needs' },
        { title: 'Revolving Credit Lines', description: 'Flexible access to capital for day-to-day business operations' },
        { title: 'Seasonal Business Financing', description: 'Managing cash flow for businesses with seasonal variations' },
        { title: 'Invoice Factoring & AR Finance', description: 'Converting receivables into immediate working capital' }
      ],
      'business-line-of-credit': [
        { title: 'Line of Credit Fundamentals', description: 'How revolving credit lines work and when to use them' },
        { title: 'Draw Periods & Repayment', description: 'Understanding interest-only payments and repayment terms' },
        { title: 'Collateral & Personal Guarantees', description: 'Security requirements and personal liability considerations' },
        { title: 'Credit Line Management', description: 'Best practices for utilizing and maintaining your credit line' }
      ],
      'term-loans': [
        { title: 'Term Loan Structures', description: 'Fixed-rate financing for major investments and growth initiatives' },
        { title: 'Loan Terms & Amortization', description: 'Understanding repayment schedules and interest calculations' },
        { title: 'Collateral Requirements', description: 'Asset-based lending and security for term loan approval' },
        { title: 'Use of Funds & Restrictions', description: 'Approved uses for term loan proceeds and compliance' }
      ],
      'lending-process': [
        { title: 'Credit Analysis Framework', description: 'Comprehensive evaluation of borrower creditworthiness' },
        { title: 'Underwriting Standards', description: 'Risk assessment methodologies and approval criteria' },
        { title: 'Due Diligence Process', description: 'Financial statement analysis and business verification' },
        { title: 'Loan Documentation & Closing', description: 'Legal requirements and loan agreement finalization' }
      ]
    };

    return lessonTemplates[moduleId as keyof typeof lessonTemplates] || [
      { title: 'Course Introduction', description: 'Overview of fundamental concepts and objectives' },
      { title: 'Core Principles', description: 'Essential knowledge and industry best practices' },
      { title: 'Practical Application', description: 'Real-world scenarios and case studies' },
      { title: 'Assessment & Certification', description: 'Test your knowledge and earn certification' }
    ];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      
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

  // Filter courses based on selected level and title
  const filteredCourses = allCourses.filter(course => {
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesTitle = titleFilter === '' || course.title.toLowerCase().includes(titleFilter.toLowerCase());
    return matchesLevel && matchesTitle;
  });

  // Calculate counts for each skill level
  const skillLevelCounts = {
    all: allCourses.length,
    beginner: allCourses.filter(c => c.level === 'beginner').length,
    
    expert: allCourses.filter(c => c.level === 'expert').length,
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
      title: "AI-Powered Adaptive Learning",
      description: "Personalized content that adapts to your learning style and pace",
      icon: "🤖"
    },
    {
      title: "Interactive Simulations",
      description: "Hands-on practice with real-world loan scenarios and financial tools",
      icon: "⚡"
    },
    {
      title: "Gamified Progress",
      description: "Achievement badges, progress tracking, and competitive learning elements",
      icon: "🎯"
    },
    {
      title: "Adaptive Assessments", 
      description: "Smart quizzes that adjust difficulty based on your performance",
      icon: "📊"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Adaptive Interactive Learning | AI-Powered Finance Training | FinPilot"
        description="Experience revolutionary adaptive interactive learning with AI-powered personalization, real-time assessments, and gamified content for commercial lending and finance professionals."
        keywords="adaptive learning, interactive finance courses, AI-powered training, personalized learning paths, gamified education, commercial lending training"
        canonicalUrl="https://finpilot.com/course-catalog"
      />
      <div className="bg-white min-h-screen">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-halo-navy to-halo-navy/90 text-white py-16 sm:py-20 md:py-16 lg:py-20">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${coursesHero})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-halo-navy/50 to-halo-navy/30" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold mb-4 sm:mb-6 text-white">
                Adaptive Interactive Learning Platform
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white">
                {user ? "AI-Powered Personalized Finance Training" : "Revolutionary Adaptive Learning for Finance Professionals"}
              </p>
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white max-w-2xl mx-auto">
                Experience personalized learning paths with AI-driven content adaptation, interactive simulations, 
                and real-time progress tracking. Master finance through gamified, adaptive experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-halo-navy hover:bg-white/90 font-semibold px-6 sm:px-8 py-3">
                    Start Adaptive Learning
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      
      {/* Content Section with Sidebar Layout */}
      <div className="container mx-auto px-4 py-12">
      {!user && (
        <Alert className="mb-6 border-primary bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <Link to="/auth" className="ml-2 font-medium text-primary hover:underline">
              Sign up now to access our comprehensive training programs →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {allCourses.length === 0 && !user ? (
        <div className="text-center py-12 space-y-6">
          <Shield className="h-24 w-24 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-2xl font-bold mb-2">Secure Course Access</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our military-grade security system protects all educational content. 
              Enroll now to access our comprehensive training programs.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Shield className="h-5 w-5" />
                Get Secure Access
              </Button>
            </Link>
          </div>
        </div>
      ) : allCourses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                Courses will appear here once they are added by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters - Mobile sheet, Desktop sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <CourseFilterSidebar
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                titleFilter={titleFilter}
                onTitleFilterChange={setTitleFilter}
                counts={skillLevelCounts}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {selectedLevel === 'all' 
                    ? `Available Courses (${filteredCourses.length})` 
                    : `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Courses (${filteredCourses.length})`
                  }
                </h2>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {filteredCourses.map((course, index) => (
                  <Card key={course.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getCourseImage(index)} 
                        alt={course.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-900 mb-4 line-clamp-3">
                        {course.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.modules.length} modules</span>
                        </div>
                         <Badge className={getLevelColor(course.level)}>
                           {course.level}
                         </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        {user ? (
                          enrollmentStatus[course.id] ? (
                            <Link to={`/module/${course.modules[0]?.id}`} className="w-full">
                              <Button className="w-full gap-2">
                                <Check className="h-4 w-4" />
                                Continue Learning
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              onClick={() => handleEnroll(course.id)}
                              className="w-full"
                            >
                              Enroll Now
                            </Button>
                          )
                        ) : (
                          <Link to="/auth" className="w-full">
                            <Button className="w-full gap-2 bg-halo-navy text-white hover:bg-halo-navy/90">
                              <Lock className="h-4 w-4" />
                              Sign In to Enroll
                            </Button>
                          </Link>
                        )}
                      </div>
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
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup">
                      <Button size="lg" className="bg-halo-navy hover:bg-halo-navy/90 text-white">
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <FinPilotBrandFooter />
    </div>
    </>
  );
};

export default Courses;