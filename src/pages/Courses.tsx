import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, AlertCircle, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { CourseFilterSidebar } from "@/components/CourseFilterSidebar";
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
  lessons?: { title: string; order_index: number; type: 'video' | 'article' | 'assessment' }[];
  totalLessons?: number;
}

const Courses = () => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [titleFilter, setTitleFilter] = useState<string>('');
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
      
      // Fetch lesson data for each module
      let modulesWithLessons = data || [];
      if (data) {
        modulesWithLessons = await Promise.all(
          data.map(async (module) => {
            console.log(`Fetching lessons for module: ${module.module_id}`);
            
            // Fetch videos
            const { data: videos } = await supabase
              .from('course_videos')
              .select('title, order_index')
              .eq('module_id', module.module_id)
              .eq('is_active', true)
              .order('order_index', { ascending: true });
            
            // Fetch articles
            const { data: articles } = await supabase
              .from('course_articles')
              .select('title, order_index')
              .eq('module_id', module.module_id)
              .eq('is_published', true)
              .order('order_index', { ascending: true });
            
            // Fetch assessments
            const { data: assessments } = await supabase
              .from('course_assessments')
              .select('title, order_index')
              .eq('module_id', module.module_id)
              .order('order_index', { ascending: true });
            
            // Combine all lessons and sort by order_index
            const allLessons = [
              ...(videos || []).map(v => ({ ...v, type: 'video' })),
              ...(articles || []).map(a => ({ ...a, type: 'article' })),
              ...(assessments || []).map(a => ({ ...a, type: 'assessment' }))
            ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            
            console.log(`Lessons for ${module.module_id}:`, allLessons);
            
            return {
              ...module,
              lessons: allLessons,
              totalLessons: allLessons.length
            };
          })
        );
      }
      
      setModules(modulesWithLessons);
      
      // Check enrollment status for each module if user is logged in
      if (user && modulesWithLessons) {
        const enrollmentChecks = await Promise.all(
          modulesWithLessons.map(async (module) => {
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

  // Filter modules based on selected level and title
  const filteredModules = modules.filter(module => {
    const matchesLevel = selectedLevel === 'all' || module.skill_level === selectedLevel;
    const matchesTitle = titleFilter === '' || module.title.toLowerCase().includes(titleFilter.toLowerCase());
    return matchesLevel && matchesTitle;
  });

  // Calculate counts for each skill level
  const skillLevelCounts = {
    all: modules.length,
    beginner: modules.filter(m => m.skill_level === 'beginner').length,
    intermediate: modules.filter(m => m.skill_level === 'intermediate').length,
    expert: modules.filter(m => m.skill_level === 'expert' || m.skill_level === 'advanced').length,
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
        canonicalUrl="https://finpilot.com/course-catalog"
      />
      <div className="bg-white min-h-screen">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-halo-navy to-halo-navy/90 text-white py-16 sm:py-20 md:py-24 lg:py-32">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${coursesHero})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-halo-navy/50 to-halo-navy/30" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold mb-4 sm:mb-6 text-white">
                Master Commercial Finance
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white">
                Expert-Led Courses for Finance Professionals
              </p>
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white max-w-2xl mx-auto">
                Advance your career with industry-recognized certifications in commercial lending, 
                credit analysis, and risk management. Join 10,000+ professionals who trust FinPilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-halo-navy hover:bg-white/90 font-semibold px-6 sm:px-8 py-3">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      
      {/* Content Section with Sidebar Layout */}
      <div className="container mx-auto px-4 py-12">
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
                    ? `Available Courses (${filteredModules.length})` 
                    : `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Courses (${filteredModules.length})`
                  }
                </h2>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {filteredModules.map((module, index) => (
                  <Card key={module.id} className="hover:shadow-lg transition-all group">
                    <div className="relative">
                      <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                        <img 
                          src={getCourseImage(index)} 
                          alt={`Professional instructor for ${module.title}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <CardHeader>
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
                              <div className="flex items-center gap-1 text-black">
                                <Clock className="h-4 w-4" />
                                {module.duration || 'Self-paced'}
                              </div>
                              <div className="flex items-center gap-1 text-black">
                                <BookOpen className="h-4 w-4" />
                                {module.totalLessons || module.lessons_count || 0} lessons
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-black">
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
                          
                          {/* Course Lessons - Only for authenticated users */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Course Content ({module.totalLessons || 0} items):
                            </h4>
                            {module.lessons && module.lessons.length > 0 ? (
                              <ul className="text-xs text-black space-y-1 max-h-24 overflow-y-auto">
                                {module.lessons.slice(0, 5).map((lesson, lessonIndex) => (
                                  <li key={lessonIndex} className="flex items-center gap-2">
                                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                                      lesson.type === 'video' ? 'bg-red-500' : 
                                      lesson.type === 'article' ? 'bg-blue-500' : 
                                      'bg-green-500'
                                    }`} />
                                    <span className="truncate">{lesson.title}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${
                                      lesson.type === 'video' ? 'bg-red-500' : 
                                      lesson.type === 'article' ? 'bg-blue-500' : 
                                      'bg-green-500'
                                    }`}>
                                      {lesson.type === 'video' ? '▶' : 
                                       lesson.type === 'article' ? '📄' : 
                                       '📝'}
                                    </span>
                                  </li>
                                ))}
                                {module.lessons.length > 5 && (
                                  <li className="text-muted-foreground italic text-xs">
                                    + {module.lessons.length - 5} more items...
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <ul className="text-xs text-black space-y-1">
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span>Course introduction video</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white bg-red-500">▶</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span>Key concepts & principles</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white bg-blue-500">📄</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  <span>Knowledge assessment</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white bg-green-500">📝</span>
                                </li>
                              </ul>
                            )}
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
                              className="w-full bg-halo-navy hover:bg-halo-navy/90 text-white"
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
                              <div className="flex items-center gap-1 text-black">
                                <Clock className="h-4 w-4" />
                                {module.duration || 'Self-paced'}
                              </div>
                              <div className="flex items-center gap-1 text-black">
                                <BookOpen className="h-4 w-4" />
                                {module.totalLessons || module.lessons_count || 0} lessons
                              </div>
                            </div>
                          </div>

                          {/* Course Lessons */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2">Course Lessons:</h4>
                            {module.lessons && module.lessons.length > 0 ? (
                              <ul className="text-xs text-black space-y-2">
                                {module.lessons.slice(0, 4).map((lesson, lessonIndex) => (
                                  <li key={lessonIndex}>
                                    <div className="font-medium">{lesson.title}</div>
                                    <div className="text-muted-foreground text-xs">
                                      Learn key concepts and practical applications
                                    </div>
                                  </li>
                                ))}
                                {module.lessons.length > 4 && (
                                  <li className="text-muted-foreground italic text-xs">
                                    + {module.lessons.length - 4} more lessons...
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <ul className="text-xs text-black space-y-2">
                                {getCourseSpecificLessons(module.module_id, module.title).map((lesson, index) => (
                                  <li key={index}>
                                    <div className="font-medium">{lesson.title}</div>
                                    <div className="text-muted-foreground text-xs">
                                      {lesson.description}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          
                          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg mb-4">
                            <p className="text-sm text-center text-black">
                              Sign up to unlock full course details and start learning
                            </p>
                          </div>
                        
                          <Link to="/signup">
                            <Button className="w-full bg-halo-navy hover:bg-halo-navy/90 text-white">
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