import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, AlertCircle, Check, Lock, Shield, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { DashboardCourseFilter } from "@/components/DashboardCourseFilter";
import PublicModuleCard from "@/components/PublicModuleCard";
import { useCourses, Course } from "@/hooks/useCourses";
import { useModules } from "@/hooks/useModules";
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

// Import new course-specific images (no people)
import courseSba7a from "@/assets/course-sba-7a.jpg";
import courseSbaExpress from "@/assets/course-sba-express.jpg";
import courseCommercialRealEstate from "@/assets/course-commercial-real-estate.jpg";
import courseEquipmentFinancing from "@/assets/course-equipment-financing.jpg";
import courseLinesOfCredit from "@/assets/course-lines-of-credit.jpg";
import courseInvoiceFactoring from "@/assets/course-invoice-factoring.jpg";
import courseMerchantCashAdvances from "@/assets/course-merchant-cash-advances.jpg";
import courseAssetBasedLending from "@/assets/course-asset-based-lending.jpg";
import courseConstructionLoans from "@/assets/course-construction-loans.jpg";
import courseFranchiseFinancing from "@/assets/course-franchise-financing.jpg";
import courseWorkingCapital from "@/assets/course-working-capital.jpg";
import courseHealthcareFinancing from "@/assets/course-healthcare-financing.jpg";
import courseRestaurantFinancing from "@/assets/course-restaurant-financing.jpg";
import courseBridgeLoans from "@/assets/course-bridge-loans.jpg";
import courseTermLoans from "@/assets/course-term-loans.jpg";
import courseBusinessAcquisition from "@/assets/course-business-acquisition.jpg";
interface CourseWithModules extends Course {
  modules: any[];
}
const Courses = () => {
  const [loading, setLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    user
  } = useAuth();

  // Use database-driven courses instead of static data
  const {
    courses: databaseCourses,
    loading: coursesLoading,
    getCoursesByCategory
  } = useCourses();
  const {
    modules: databaseModules,
    loading: modulesLoading
  } = useModules();

  // Combine courses with their modules from database
  const coursesWithModules: CourseWithModules[] = databaseCourses.map(course => {
    const courseModules = databaseModules.filter(module => module.course_id === course.id && module.is_active);
    return {
      ...course,
      modules: courseModules
    };
  });

  // Get all courses for display
  const allCourses = coursesWithModules;

  // Course image mapping function - maps course titles to specific images
  const getCourseImage = (courseTitle: string) => {
    // Extract the base course type from title (remove skill level)
    const baseTitle = courseTitle.replace(/ - (Beginner|Expert)$/, '');

    // Map course titles to specific images (no people)
    const imageMap: {
      [key: string]: string;
    } = {
      "SBA 7(a)": courseSba7a,
      "SBA Express": courseSbaExpress,
      "Commercial Real Estate": courseCommercialRealEstate,
      "Equipment Financing": courseEquipmentFinancing,
      "Business Lines of Credit": courseLinesOfCredit,
      "Invoice Factoring": courseInvoiceFactoring,
      "Merchant Cash Advances": courseMerchantCashAdvances,
      "Asset-Based Lending": courseAssetBasedLending,
      "Construction Loans": courseConstructionLoans,
      "Franchise Financing": courseFranchiseFinancing,
      "Working Capital": courseWorkingCapital,
      "Healthcare Financing": courseHealthcareFinancing,
      "Restaurant Financing": courseRestaurantFinancing,
      "Bridge Loans": courseBridgeLoans,
      "Term Loans": courseTermLoans,
      "Business Acquisition": courseBusinessAcquisition
    };
    return imageMap[baseTitle] || courseSba7a; // Default to SBA 7(a) image
  };
  useEffect(() => {
    if (user && allCourses.length > 0) {
      checkEnrollmentStatus();
    }
  }, [user, allCourses.length]);
  const checkEnrollmentStatus = async () => {
    if (!user) return;
    try {
      const enrollmentChecks = await Promise.all(allCourses.map(async course => {
        const {
          data: enrollment
        } = await supabase.from('course_enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).eq('status', 'active').single();
        return {
          courseId: course.id,
          isEnrolled: !!enrollment
        };
      }));
      const statusMap = enrollmentChecks.reduce((acc, {
        courseId,
        isEnrolled
      }) => {
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
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('course_enrollments').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'active'
      });
      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Enrollment Failed",
          description: "Failed to enroll in the course. Please try again.",
          variant: "destructive"
        });
        return;
      }
      setEnrollmentStatus(prev => ({
        ...prev,
        [courseId]: true
      }));
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course!"
      });
    } catch (error) {
      console.error('Error in handleEnroll:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Generate course-specific lesson content
  const getCourseSpecificLessons = (moduleId: string, title: string) => {
    const lessonTemplates = {
      'sba-7a-loans': [{
        title: 'SBA 7(a) Program Overview',
        description: 'Understanding the SBA\'s flagship loan program and eligibility requirements'
      }, {
        title: 'Loan Amounts & Terms',
        description: 'Maximum loan amounts up to $5 million and repayment terms'
      }, {
        title: 'Eligible Uses & Restrictions',
        description: 'What businesses can and cannot use SBA 7(a) funds for'
      }, {
        title: 'Application Process & Documentation',
        description: 'Step-by-step guide through the SBA 7(a) application process'
      }],
      'sba-504-loans': [{
        title: 'SBA 504 Program Structure',
        description: 'Understanding the three-party loan structure and 10% down payment'
      }, {
        title: 'Real Estate & Equipment Financing',
        description: 'Fixed-rate financing for owner-occupied commercial real estate'
      }, {
        title: 'Certified Development Companies',
        description: 'Working with CDCs to secure 504 loan approval'
      }, {
        title: 'Job Creation Requirements',
        description: 'Meeting employment and community development standards'
      }],
      'capital-markets': [{
        title: 'Capital Markets Fundamentals',
        description: 'Introduction to debt and equity capital market structures'
      }, {
        title: 'Commercial Finance Products',
        description: 'Overview of institutional lending and investment banking'
      }, {
        title: 'Market Analysis & Trends',
        description: 'Current market conditions and financing opportunities'
      }, {
        title: 'Deal Structuring Basics',
        description: 'Key principles in structuring commercial finance transactions'
      }],
      'usda-bi-loans': [{
        title: 'USDA B&I Program Overview',
        description: 'Rural business development financing backed by USDA guarantee'
      }, {
        title: 'Rural Area Eligibility',
        description: 'Determining if your business location qualifies for USDA funding'
      }, {
        title: 'Loan Amounts & Guarantees',
        description: 'Up to $25 million with government backing for rural businesses'
      }, {
        title: 'Application & Approval Process',
        description: 'Navigating USDA requirements and documentation'
      }],
      'working-capital': [{
        title: 'Working Capital Essentials',
        description: 'Understanding cash flow gaps and operational funding needs'
      }, {
        title: 'Revolving Credit Lines',
        description: 'Flexible access to capital for day-to-day business operations'
      }, {
        title: 'Seasonal Business Financing',
        description: 'Managing cash flow for businesses with seasonal variations'
      }, {
        title: 'Invoice Factoring & AR Finance',
        description: 'Converting receivables into immediate working capital'
      }],
      'business-line-of-credit': [{
        title: 'Line of Credit Fundamentals',
        description: 'How revolving credit lines work and when to use them'
      }, {
        title: 'Draw Periods & Repayment',
        description: 'Understanding interest-only payments and repayment terms'
      }, {
        title: 'Collateral & Personal Guarantees',
        description: 'Security requirements and personal liability considerations'
      }, {
        title: 'Credit Line Management',
        description: 'Best practices for utilizing and maintaining your credit line'
      }],
      'term-loans': [{
        title: 'Term Loan Structures',
        description: 'Fixed-rate financing for major investments and growth initiatives'
      }, {
        title: 'Loan Terms & Amortization',
        description: 'Understanding repayment schedules and interest calculations'
      }, {
        title: 'Collateral Requirements',
        description: 'Asset-based lending and security for term loan approval'
      }, {
        title: 'Use of Funds & Restrictions',
        description: 'Approved uses for term loan proceeds and compliance'
      }],
      'lending-process': [{
        title: 'Credit Analysis Framework',
        description: 'Comprehensive evaluation of borrower creditworthiness'
      }, {
        title: 'Underwriting Standards',
        description: 'Risk assessment methodologies and approval criteria'
      }, {
        title: 'Due Diligence Process',
        description: 'Financial statement analysis and business verification'
      }, {
        title: 'Loan Documentation & Closing',
        description: 'Legal requirements and loan agreement finalization'
      }]
    };
    return lessonTemplates[moduleId as keyof typeof lessonTemplates] || [{
      title: 'Course Introduction',
      description: 'Overview of fundamental concepts and objectives'
    }, {
      title: 'Core Principles',
      description: 'Essential knowledge and industry best practices'
    }, {
      title: 'Practical Application',
      description: 'Real-world scenarios and case studies'
    }, {
      title: 'Assessment & Certification',
      description: 'Test your knowledge and earn certification'
    }];
  };
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter courses based on selected category  
  const filteredCourses: CourseWithModules[] = selectedCategory ? allCourses.filter(course => {
    // Filter based on course title patterns that match categories
    if (selectedCategory === 'Loan Originator') {
      return course.title.toLowerCase().includes('originator') || course.title.toLowerCase().includes('sales') || course.title.toLowerCase().includes('sba');
    }
    if (selectedCategory === 'Loan Processing') {
      return course.title.toLowerCase().includes('processing') || course.title.toLowerCase().includes('equipment') || course.title.toLowerCase().includes('working capital');
    }
    if (selectedCategory === 'Loan Underwriting') {
      return course.title.toLowerCase().includes('underwriting') || course.title.toLowerCase().includes('credit') || course.title.toLowerCase().includes('analysis');
    }
    return false;
  }) : allCourses;

  // Calculate counts for each skill level
  const skillLevelCounts = {
    all: allCourses.length,
    beginner: allCourses.filter(c => c.level === 'beginner').length,
    expert: allCourses.filter(c => c.level === 'expert').length
  };

  // Update loading to use database loading states
  const isLoading = coursesLoading || modulesLoading || loading;
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>;
  }
  const courseCategories = ["All Courses", "Commercial Lending", "Credit Analysis", "Risk Management", "SBA Loans", "Financial Analysis", "Compliance"];
  const learningBenefits = [{
    title: "AI-Powered Adaptive Learning",
    description: "Personalized content that adapts to your learning style and pace",
    icon: "🤖"
  }, {
    title: "Interactive Simulations",
    description: "Hands-on practice with real-world loan scenarios and financial tools",
    icon: "⚡"
  }, {
    title: "Gamified Progress",
    description: "Achievement badges, progress tracking, and competitive learning elements",
    icon: "🎯"
  }, {
    title: "Adaptive Assessments",
    description: "Smart quizzes that adjust difficulty based on your performance",
    icon: "📊"
  }];
  return <>
      <SEOHead title="Adaptive Interactive Learning | AI-Powered Finance Training | FinPilot" description="Experience revolutionary adaptive interactive learning with AI-powered personalization, real-time assessments, and gamified content for commercial lending and finance professionals." keywords="adaptive learning, interactive finance courses, AI-powered training, personalized learning paths, gamified education, commercial lending training" canonicalUrl="https://finpilot.com/course-catalog" />
      <div className="bg-white min-h-screen">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-navy-900 to-navy-800 text-white py-12 sm:py-16 md:py-20">
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{
          backgroundImage: `url(${coursesHero})`
        }} />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/30" />
          <div className="mobile-container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-responsive-3xl font-playfair font-bold mb-4 sm:mb-6 text-white">
                Adaptive Interactive Learning Platform
              </h1>
              <p className="text-responsive-xl mb-3 sm:mb-4 text-white">
                {user ? "AI-Powered Personalized Finance Training" : "Revolutionary Adaptive Learning for Finance Professionals"}
              </p>
              <p className="text-responsive-sm mb-6 sm:mb-8 text-white max-w-2xl mx-auto">
                Experience personalized learning paths with AI-driven content adaptation, interactive simulations, 
                and real-time progress tracking. Master finance through gamified, adaptive experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-white/90 font-semibold">
                    Start Adaptive Learning
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      
      {/* Content Section with Sidebar Layout */}
      <div className="mobile-container mobile-section">
      {!user && <Alert className="mb-6 border-primary bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <Link to="/auth" className="ml-2 font-medium text-primary hover:underline">
              Sign up now to access our comprehensive training programs →
            </Link>
          </AlertDescription>
        </Alert>}

      {coursesLoading || modulesLoading ? <Card className="text-center py-12">
            <CardContent>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-lg">Loading courses...</span>
              </div>
            </CardContent>
          </Card> : allCourses.length === 0 ? <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                Courses will appear here once they are added by administrators.
              </p>
            </CardContent>
          </Card> : <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters - Mobile sheet, Desktop sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <DashboardCourseFilter selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {selectedCategory ? `${selectedCategory} Courses (${filteredCourses.length})` : `All Courses (${filteredCourses.length})`}
                </h2>
              </div>

              {/* Course Grid - Dashboard Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
                {filteredCourses.map((course, index) => {
                const courseName = course.title.split(' - ')[0];
                return <Card key={course.id} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 border hover:border-primary/30 bg-gradient-to-br from-card via-card to-secondary/5 hover:to-primary/5" style={{
                  animationDelay: `${index * 100}ms`
                }}>
                      {/* Modern gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-4 relative z-10 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-navy-900" />
                              <Badge variant="outline" className="px-3 py-1 bg-white text-black border-gray-300">
                                Course Program
                              </Badge>
                            </div>
                            
                            <CardTitle className="text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
                              {courseName}
                            </CardTitle>
                            
                            <CardDescription className="line-clamp-3 text-sm leading-relaxed text-black">
                              {course.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        {/* Enhanced Course Details */}
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-navy-900" />
                              <span className="text-primary font-medium">4-6 Hours</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="text-black">{course.modules.length} modules</span>
                            </div>
                          </div>
                          
                          {/* Key Topics with enhanced styling */}
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Topics</span>
                            <div className="flex flex-wrap gap-2">
                              {course.modules.slice(0, 3).map((module, idx) => <Badge key={idx} variant="outline" className="text-xs px-3 py-1 text-secondary-foreground border-secondary/30">
                                  {module.title.length > 20 ? module.title.substring(0, 20) + '...' : module.title}
                                </Badge>)}
                            </div>
                          </div>
                          
                          {/* Skill Levels with semantic styling */}
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available Levels</span>
                            <div className="flex gap-2">
                              <Badge variant={course.level === 'expert' ? 'default' : 'secondary'} className="text-xs px-3 py-1 bg-blue-900 text-white">
                                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 pb-6 relative z-10">
                        {user ? enrollmentStatus[course.id] ? <Link to={`/module/${course.modules[0]?.id}`} className="block">
                              <Button className="w-full touch-manipulation h-9 font-medium group-hover:shadow-lg transition-all duration-300 bg-navy-900 hover:bg-navy-800 text-white text-sm">
                                <span className="flex items-center gap-2">
                                  <Check className="h-4 w-4 mr-2" />
                                  Continue Learning
                                </span>
                              </Button>
                            </Link> : <Button onClick={() => handleEnroll(course.id)} className="w-full touch-manipulation h-9 font-medium group-hover:shadow-lg transition-all duration-300 text-sm" variant="default" disabled={loading}>
                              <span className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Start Course
                              </span>
                            </Button> : <Link to="/auth" className="block">
                            <Button className="w-full touch-manipulation h-9 font-medium group-hover:shadow-lg transition-all duration-300 text-white bg-blue-900 hover:bg-blue-800 text-xs">
                              <span className="flex items-center gap-2">
                                <Lock className="h-4 w-4 mr-2" />
                                Sign In to Enroll
                              </span>
                            </Button>
                          </Link>}
                      </CardContent>
                    </Card>;
              })}
              </div>
              
              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-navy-900/10 to-navy-800/10 border-navy-900/20">
                <CardContent className="text-center p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join thousands of finance professionals who have advanced their careers with our comprehensive training programs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup">
                       <Button variant="navy" size="lg">
                         Start Free Trial
                       </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>}
      </div>
      
      <FinPilotBrandFooter />
    </div>
    </>;
};
export default Courses;