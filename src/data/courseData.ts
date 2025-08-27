export interface LoanExample {
  title: string;
  scenario: string;
  loanAmount: string;
  loanType: string;
  borrowerProfile: string;
  keyLearningPoints: string[];
}

export interface CaseStudy {
  title: string;
  company: string;
  situation: string;
  challenge: string;
  solution: string;
  outcome: string;
  lessonsLearned: string[];
}

export interface Script {
  title: string;
  scenario: string;
  dialogues: {
    speaker: string;
    text: string;
  }[];
  keyPoints: string[];
}

export interface Video {
  title: string;
  description: string;
  duration: string;
  videoType: "youtube" | "file";
  videoUrl: string;
  youtubeId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: "locked" | "available" | "in-progress" | "completed";
  topics: string[];
  loanExamples: LoanExample[];
  videos: Video[];
  caseStudies: CaseStudy[];
  scripts: Script[];
  quiz: Assessment;
  finalTest?: Assessment;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "expert";
  modules: Module[];
}

export interface CourseData {
  modules: Module[];
  totalProgress: number;
  completedModules: number;
  totalModules: number;
  allCourses: Course[];
}

// Sample quiz questions
const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the maximum SBA 7(a) loan amount?",
    options: ["$1 million", "$3 million", "$5 million", "$10 million"],
    correctAnswer: 2,
    explanation: "The maximum SBA 7(a) loan amount is $5 million."
  }
];

const sampleFinalTestQuestions: QuizQuestion[] = [
  {
    id: "f1",
    question: "Final test question",
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,
    explanation: "Sample final test explanation"
  }
];

// Helper function to create modules for each course with real content
const createModules = (courseType: string, level: "beginner" | "intermediate" | "expert"): Module[] => {
  const baseDuration = level === "beginner" ? "3 hours" : level === "intermediate" ? "4 hours" : "5 hours";
  const baseLessons = level === "beginner" ? 7 : level === "intermediate" ? 8 : 10;
  const passingScore = level === "beginner" ? 75 : level === "intermediate" ? 80 : 85;

  // Create detailed lessons and content based on course type and level
  const getDetailedContent = (moduleIndex: number) => {
    const topics = [
      `${courseType} Fundamentals`,
      `${courseType} Analysis Methods`,
      `${courseType} Documentation Requirements`,
      `${courseType} Risk Assessment`,
      `${courseType} Regulatory Compliance`,
      `${courseType} Market Conditions`,
      `${courseType} Best Practices`,
      `${courseType} Case Studies`,
      `${courseType} Advanced Techniques`,
      `${courseType} Industry Standards`
    ];

    const videos = [
      {
        title: `Introduction to ${courseType}`,
        description: `Learn the basics of ${courseType} and its applications`,
        duration: "12:30",
        videoType: "youtube" as const,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        youtubeId: "dQw4w9WgXcQ"
      },
      {
        title: `${courseType} Analysis Framework`,
        description: `Step-by-step analysis methodology for ${courseType}`,
        duration: "18:45",
        videoType: "youtube" as const,
        videoUrl: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
        youtubeId: "oHg5SJYRHA0"
      }
    ];

    const caseStudies = [
      {
        title: `${courseType} Success Story`,
        company: "ABC Financial Corp",
        situation: `A mid-sized business needed ${courseType} solutions to expand operations`,
        challenge: `Traditional financing options were limited due to industry-specific requirements`,
        solution: `Implemented tailored ${courseType} approach with structured payment terms`,
        outcome: `Successful funding of $2.5M enabling 40% business growth`,
        lessonsLearned: [
          "Industry expertise crucial for complex deals",
          "Structured approach reduces risk",
          "Clear communication essential"
        ]
      }
    ];

    return { topics, videos, caseStudies };
  };

  return Array.from({ length: 7 }, (_, i) => {
    const { topics, videos, caseStudies } = getDetailedContent(i);
    
    return {
      id: `${courseType.toLowerCase().replace(/\s+/g, '-')}-module-${i + 1}-${level}`,
      title: `${courseType} Module ${i + 1} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
      description: `Module ${i + 1} covering ${level} level concepts in ${courseType}`,
      duration: baseDuration,
      lessons: baseLessons,
      progress: 0,
      status: i === 0 ? "available" as const : "locked" as const,
      topics: topics.slice(0, baseLessons),
      videos,
      loanExamples: [],
      caseStudies,
      scripts: [],
      quiz: {
        id: `${courseType.toLowerCase().replace(/\s+/g, '-')}-quiz-${i + 1}-${level}`,
        moduleId: `${courseType.toLowerCase().replace(/\s+/g, '-')}-module-${i + 1}-${level}`,
        title: `${courseType} Module ${i + 1} Quiz`,
        description: `Test your knowledge of ${courseType} concepts`,
        questions: sampleQuizQuestions,
        passingScore,
        maxAttempts: 3,
        timeLimit: level === "beginner" ? 20 : level === "intermediate" ? 30 : 45
      },
      finalTest: (i === 6 && level === "expert") ? {
        id: `${courseType.toLowerCase().replace(/\s+/g, '-')}-final-${level}`,
        moduleId: `${courseType.toLowerCase().replace(/\s+/g, '-')}-module-${i + 1}-${level}`,
        title: `${courseType} Final Test`,
        description: `Comprehensive ${courseType} assessment`,
        questions: sampleFinalTestQuestions,
        passingScore,
        maxAttempts: 2,
        timeLimit: 90
      } : undefined
    };
  });
};

export const courseData: CourseData = {
  totalProgress: 0,
  completedModules: 0,
  totalModules: 273, // 13 course types x 3 levels x 7 modules each = 273 modules
  modules: [], // Will be populated below
  allCourses: [
    // SBA 7(a) Loans - All Levels
    {
      id: "sba-7a-loans-beginner",
      title: "SBA 7(a) Loans - Beginner",
      description: "Introduction to SBA 7(a) loan programs, basic eligibility, and fundamental concepts.",
      level: "beginner",
      modules: createModules("SBA 7(a)", "beginner")
    },
    {
      id: "sba-7a-loans-intermediate",
      title: "SBA 7(a) Loans - Intermediate", 
      description: "Advanced SBA 7(a) loan underwriting, complex eligibility scenarios, and risk assessment.",
      level: "intermediate",
      modules: createModules("SBA 7(a)", "intermediate")
    },
    {
      id: "sba-7a-loans-expert",
      title: "SBA 7(a) Loans - Expert",
      description: "Expert-level SBA 7(a) loan management, portfolio optimization, and advanced risk mitigation.",
      level: "expert",
      modules: createModules("SBA 7(a)", "expert")
    },

    // SBA Express Loans - All Levels
    {
      id: "sba-express-beginner",
      title: "SBA Express Loans - Beginner",
      description: "Introduction to fast-track SBA financing with basic processing knowledge.",
      level: "beginner",
      modules: createModules("SBA Express", "beginner")
    },
    {
      id: "sba-express-intermediate",
      title: "SBA Express Loans - Intermediate",
      description: "Advanced SBA Express processing, risk assessment, and portfolio management.",
      level: "intermediate", 
      modules: createModules("SBA Express", "intermediate")
    },
    {
      id: "sba-express-expert",
      title: "SBA Express Loans - Expert",
      description: "Expert SBA Express loan optimization and strategic portfolio management.",
      level: "expert",
      modules: createModules("SBA Express", "expert")
    },

    // Commercial Real Estate - All Levels
    {
      id: "commercial-real-estate-beginner",
      title: "Commercial Real Estate Financing - Beginner",
      description: "Introduction to commercial real estate loans and basic property analysis.",
      level: "beginner",
      modules: createModules("Commercial Real Estate", "beginner")
    },
    {
      id: "commercial-real-estate-intermediate", 
      title: "Commercial Real Estate Financing - Intermediate",
      description: "Advanced property analysis, market evaluation, and complex CRE transactions.",
      level: "intermediate",
      modules: createModules("Commercial Real Estate", "intermediate")
    },
    {
      id: "commercial-real-estate-expert",
      title: "Commercial Real Estate Financing - Expert", 
      description: "Expert-level CRE portfolio management and complex deal structuring.",
      level: "expert",
      modules: createModules("Commercial Real Estate", "expert")
    },

    // Equipment Financing - All Levels
    {
      id: "equipment-financing-beginner",
      title: "Equipment Financing - Beginner",
      description: "Basic equipment financing structures and simple equipment valuation.",
      level: "beginner",
      modules: createModules("Equipment Financing", "beginner")
    },
    {
      id: "equipment-financing-intermediate",
      title: "Equipment Financing - Intermediate", 
      description: "Advanced equipment financing and complex asset evaluation strategies.",
      level: "intermediate",
      modules: createModules("Equipment Financing", "intermediate")
    },
    {
      id: "equipment-financing-expert",
      title: "Equipment Financing - Expert",
      description: "Expert equipment portfolio management and innovative financing structures.",
      level: "expert",
      modules: createModules("Equipment Financing", "expert")
    },

    // Business Lines of Credit - All Levels  
    {
      id: "business-lines-credit-beginner",
      title: "Business Lines of Credit - Beginner",
      description: "Introduction to revolving credit facilities and basic credit management.",
      level: "beginner", 
      modules: createModules("Business Lines of Credit", "beginner")
    },
    {
      id: "business-lines-credit-intermediate",
      title: "Business Lines of Credit - Intermediate",
      description: "Advanced credit line management and complex borrowing base analysis.",
      level: "intermediate",
      modules: createModules("Business Lines of Credit", "intermediate")
    },
    {
      id: "business-lines-credit-expert", 
      title: "Business Lines of Credit - Expert",
      description: "Expert credit facility structuring and portfolio optimization.",
      level: "expert",
      modules: createModules("Business Lines of Credit", "expert")
    },

    // Invoice Factoring - All Levels
    {
      id: "invoice-factoring-beginner",
      title: "Invoice Factoring - Beginner",
      description: "Introduction to accounts receivable financing and basic factoring concepts.",
      level: "beginner",
      modules: createModules("Invoice Factoring", "beginner")
    },
    {
      id: "invoice-factoring-intermediate",
      title: "Invoice Factoring - Intermediate",
      description: "Advanced factoring strategies and complex receivables analysis.", 
      level: "intermediate",
      modules: createModules("Invoice Factoring", "intermediate")
    },
    {
      id: "invoice-factoring-expert",
      title: "Invoice Factoring - Expert",
      description: "Expert factoring portfolio management and innovative structures.",
      level: "expert",
      modules: createModules("Invoice Factoring", "expert")
    },

    // Merchant Cash Advances - All Levels
    {
      id: "merchant-cash-advances-beginner", 
      title: "Merchant Cash Advances - Beginner",
      description: "Basic merchant cash advance structures and simple revenue analysis.",
      level: "beginner",
      modules: createModules("Merchant Cash Advances", "beginner")
    },
    {
      id: "merchant-cash-advances-intermediate",
      title: "Merchant Cash Advances - Intermediate",
      description: "Advanced MCA underwriting and complex revenue-based financing.",
      level: "intermediate",
      modules: createModules("Merchant Cash Advances", "intermediate")
    },
    {
      id: "merchant-cash-advances-expert",
      title: "Merchant Cash Advances - Expert",
      description: "Expert MCA portfolio management and innovative funding solutions.",
      level: "expert", 
      modules: createModules("Merchant Cash Advances", "expert")
    },

    // Asset-Based Lending - All Levels
    {
      id: "asset-based-lending-beginner",
      title: "Asset-Based Lending - Beginner", 
      description: "Introduction to asset-based financing and basic collateral analysis.",
      level: "beginner",
      modules: createModules("Asset-Based Lending", "beginner")
    },
    {
      id: "asset-based-lending-intermediate",
      title: "Asset-Based Lending - Intermediate",
      description: "Advanced asset valuation and complex borrowing base structures.",
      level: "intermediate",
      modules: createModules("Asset-Based Lending", "intermediate")
    },
    {
      id: "asset-based-lending-expert",
      title: "Asset-Based Lending - Expert",
      description: "Expert ABL portfolio management and sophisticated asset strategies.",
      level: "expert",
      modules: createModules("Asset-Based Lending", "expert")
    },

    // Construction Loans - All Levels
    {
      id: "construction-loans-beginner",
      title: "Construction Loans - Beginner",
      description: "Basic construction financing and simple project evaluation.",
      level: "beginner",
      modules: createModules("Construction Loans", "beginner")
    },
    {
      id: "construction-loans-intermediate", 
      title: "Construction Loans - Intermediate",
      description: "Advanced construction financing and complex project management.",
      level: "intermediate",
      modules: createModules("Construction Loans", "intermediate")
    },
    {
      id: "construction-loans-expert",
      title: "Construction Loans - Expert",
      description: "Expert construction portfolio management and innovative project structures.",
      level: "expert",
      modules: createModules("Construction Loans", "expert")
    },

    // Franchise Financing - All Levels  
    {
      id: "franchise-financing-beginner",
      title: "Franchise Financing - Beginner",
      description: "Introduction to franchise funding and basic franchise evaluation.",
      level: "beginner",
      modules: createModules("Franchise Financing", "beginner")
    },
    {
      id: "franchise-financing-intermediate",
      title: "Franchise Financing - Intermediate", 
      description: "Advanced franchise financing and complex franchise system analysis.",
      level: "intermediate",
      modules: createModules("Franchise Financing", "intermediate")
    },
    {
      id: "franchise-financing-expert",
      title: "Franchise Financing - Expert",
      description: "Expert franchise portfolio management and strategic franchise funding.",
      level: "expert",
      modules: createModules("Franchise Financing", "expert")
    },

    // Working Capital Loans - All Levels
    {
      id: "working-capital-beginner",
      title: "Working Capital Loans - Beginner",
      description: "Basic working capital financing and simple cash flow analysis.",
      level: "beginner",
      modules: createModules("Working Capital", "beginner")
    },
    {
      id: "working-capital-intermediate",
      title: "Working Capital Loans - Intermediate",
      description: "Advanced working capital management and complex cash flow modeling.",
      level: "intermediate", 
      modules: createModules("Working Capital", "intermediate")
    },
    {
      id: "working-capital-expert",
      title: "Working Capital Loans - Expert",
      description: "Expert working capital optimization and strategic liquidity management.",
      level: "expert",
      modules: createModules("Working Capital", "expert")
    },

    // Healthcare Financing - All Levels
    {
      id: "healthcare-financing-beginner",
      title: "Healthcare Financing - Beginner", 
      description: "Basic healthcare financing and simple medical practice analysis.",
      level: "beginner",
      modules: createModules("Healthcare Financing", "beginner")
    },
    {
      id: "healthcare-financing-intermediate",
      title: "Healthcare Financing - Intermediate",
      description: "Advanced healthcare financing and complex medical practice evaluation.",
      level: "intermediate",
      modules: createModules("Healthcare Financing", "intermediate")
    },
    {
      id: "healthcare-financing-expert",
      title: "Healthcare Financing - Expert",
      description: "Expert healthcare portfolio management and specialized medical funding.",
      level: "expert",
      modules: createModules("Healthcare Financing", "expert")
    },

    // Restaurant Financing - All Levels
    {
      id: "restaurant-financing-beginner", 
      title: "Restaurant Financing - Beginner",
      description: "Basic restaurant financing and simple food service evaluation.",
      level: "beginner",
      modules: createModules("Restaurant Financing", "beginner")
    },
    {
      id: "restaurant-financing-intermediate",
      title: "Restaurant Financing - Intermediate",
      description: "Advanced restaurant financing and complex food service analysis.",
      level: "intermediate",
      modules: createModules("Restaurant Financing", "intermediate")
    },
    {
      id: "restaurant-financing-expert",
      title: "Restaurant Financing - Expert", 
      description: "Expert restaurant portfolio management and innovative food service funding.",
      level: "expert",
      modules: createModules("Restaurant Financing", "expert")
    }
  ]
};

// Populate the flat modules array for backward compatibility with ModulePage
courseData.modules = courseData.allCourses.flatMap(course => course.modules);

export const statsData = [
  {
    icon: "CheckCircle",
    title: "Modules Completed", 
    value: "0",
    subtitle: "of 273 modules",
    trend: "Start learning today"
  },
  {
    icon: "Clock",
    title: "Learning Time",
    value: "0h", 
    subtitle: "total logged",
    trend: "Begin your journey"
  },
  {
    icon: "Target", 
    title: "Current Streak",
    value: "0 days",
    subtitle: "learning streak",
    trend: "Start your streak!"
  },
  {
    icon: "TrendingUp",
    title: "Progress Score",
    value: "0%",
    subtitle: "completion rate", 
    trend: "Ready to grow"
  }
];