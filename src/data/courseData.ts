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

// Sample quiz questions for all courses (each course will have 20 quiz questions and 50 final test questions)
const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the maximum SBA 7(a) loan amount?",
    options: ["$1 million", "$3 million", "$5 million", "$10 million"],
    correctAnswer: 2,
    explanation: "The maximum SBA 7(a) loan amount is $5 million."
  },
  {
    id: "q2", 
    question: "What is the minimum debt service coverage ratio typically required?",
    options: ["1.00x", "1.25x", "1.50x", "2.00x"],
    correctAnswer: 1,
    explanation: "Most lenders require a minimum debt service coverage ratio of 1.25x."
  },
  // ... 18 more questions would be added for each module
];

const sampleFinalTestQuestions: QuizQuestion[] = [
  // ... 50 comprehensive questions covering all module topics
];

export const courseData: CourseData = {
  totalProgress: 0,
  completedModules: 0,
  totalModules: 273, // 13 course types x 3 levels x 7 modules each = 273 modules
  modules: [],
  allCourses: [
    // BEGINNER LEVEL COURSES
    {
      id: "sba-7a-loans-beginner",
      title: "SBA 7(a) Loans - Beginner",
      description: "Introduction to SBA 7(a) loan programs, basic eligibility, and fundamental concepts.",
      level: "beginner",
      modules: [
        {
          id: "sba7a-fundamentals-beginner",
          title: "SBA 7(a) Program Fundamentals", 
          description: "Foundation knowledge of SBA 7(a) loan program structure, eligibility requirements, and key features",
          duration: "3 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "SBA 7(a) Program Overview",
            "Basic Eligibility Requirements",
            "Size Standards Introduction",
            "Simple Use of Proceeds",
            "Government Guarantee Basics",
            "Interest Rate Guidelines",
            "Basic Loan Terms"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-fund-quiz-beginner",
            moduleId: "sba7a-fundamentals-beginner",
            title: "SBA 7(a) Fundamentals Quiz - Beginner",
            description: "Test your basic SBA 7(a) program knowledge",
            questions: sampleQuizQuestions,
            passingScore: 75,
            maxAttempts: 3,
            timeLimit: 20
          }
        }
      ]
    },
    {
      id: "commercial-real-estate-beginner",
      title: "Commercial Real Estate Financing - Beginner",
      description: "Introduction to commercial real estate loans, basic property analysis, and fundamental market concepts.",
      level: "beginner",
      modules: [
        {
          id: "cre-fundamentals-beginner",
          title: "CRE Financing Fundamentals",
          description: "Basic understanding of commercial real estate financing structures and requirements",
          duration: "3 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "Commercial Property Types Introduction",
            "Basic Income Property Analysis",
            "Simple Cap Rate Calculations",
            "Loan-to-Value Basics",
            "Basic Environmental Considerations",
            "Appraisal Requirements Overview",
            "Zoning and Use Basics"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "cre-fund-quiz-beginner",
            moduleId: "cre-fundamentals-beginner",
            title: "CRE Financing Quiz - Beginner", 
            description: "Test your basic commercial real estate knowledge",
            questions: sampleQuizQuestions,
            passingScore: 75,
            maxAttempts: 3,
            timeLimit: 20
          }
        }
      ]
    },
    {
      id: "sba-express-loans-beginner",
      title: "SBA Express Loans - Beginner",
      description: "Introduction to fast-track SBA financing with basic processing knowledge.",
      level: "beginner",
      modules: [
        {
          id: "sba-express-fundamentals-beginner",
          title: "SBA Express Program Basics",
          description: "Understanding the basic SBA Express loan program and its advantages",
          duration: "2.5 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "SBA Express Program Overview",
            "Basic Approval Process",
            "Simple Documentation Requirements",
            "Basic Interest Rate Structure",
            "Program Benefits Introduction",
            "Basic Eligibility",
            "Simple Processing Steps"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba-express-fund-quiz-beginner",
            moduleId: "sba-express-fundamentals-beginner",
            title: "SBA Express Fundamentals Quiz - Beginner", 
            description: "Test your basic SBA Express knowledge",
            questions: sampleQuizQuestions,
            passingScore: 75,
            maxAttempts: 3,
            timeLimit: 20
          }
        }
      ]
    },

    // INTERMEDIATE LEVEL COURSES
    {
      id: "sba-7a-loans-intermediate", 
      title: "SBA 7(a) Loans - Intermediate",
      description: "Advanced SBA 7(a) loan underwriting, complex eligibility scenarios, and risk assessment.",
      level: "intermediate",
      modules: [
        {
          id: "sba7a-fundamentals-intermediate",
          title: "SBA 7(a) Intermediate Analysis",
          description: "Advanced SBA 7(a) loan concepts and complex underwriting scenarios",
          duration: "4.5 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Complex Eligibility Scenarios",
            "Advanced Underwriting Techniques", 
            "Risk Assessment Methods",
            "Portfolio Management Basics",
            "Secondary Market Analysis",
            "Loan Structuring Strategies",
            "Performance Analytics",
            "Regulatory Compliance"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-quiz-intermediate",
            moduleId: "sba7a-fundamentals-intermediate", 
            title: "SBA 7(a) Intermediate Quiz",
            description: "Test your intermediate SBA knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "commercial-real-estate-intermediate",
      title: "Commercial Real Estate Financing - Intermediate",
      description: "Advanced property analysis, market evaluation, and complex CRE transaction structuring.",
      level: "intermediate",
      modules: [
        {
          id: "cre-fundamentals-intermediate",
          title: "Advanced CRE Analysis",
          description: "Complex commercial real estate financing and advanced market analysis",
          duration: "4.5 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Advanced Property Valuation",
            "Complex Income Analysis",
            "Market Cycle Analysis",
            "Advanced Risk Assessment",
            "Sophisticated Deal Structuring",
            "Environmental Risk Management",
            "Advanced Appraisal Review",
            "Market Trend Analysis"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "cre-quiz-intermediate",
            moduleId: "cre-fundamentals-intermediate",
            title: "CRE Financing Quiz - Intermediate",
            description: "Test your intermediate CRE knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },

    // EXPERT LEVEL COURSES
    {
      id: "sba-7a-loans-expert",
      title: "SBA 7(a) Loans - Expert", 
      description: "Expert-level SBA 7(a) loan management, portfolio optimization, and advanced risk mitigation strategies.",
      level: "expert",
      modules: [
        {
          id: "sba7a-fundamentals-expert",
          title: "SBA 7(a) Expert Mastery",
          description: "Expert-level SBA 7(a) loan portfolio management and optimization strategies",
          duration: "6 hours", 
          lessons: 10,
          progress: 0,
          status: "available",
          topics: [
            "Portfolio Optimization Strategies",
            "Advanced Risk Mitigation",
            "Regulatory Change Management",
            "Market Analysis & Forecasting",
            "Complex Problem Resolution",
            "Stakeholder Management",
            "Industry Leadership",
            "Innovation & Best Practices",
            "Advanced Analytics",
            "Strategic Planning"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-quiz-expert",
            moduleId: "sba7a-fundamentals-expert",
            title: "SBA 7(a) Expert Quiz", 
            description: "Test your expert SBA knowledge",
            questions: sampleQuizQuestions,
            passingScore: 85,
            maxAttempts: 2,
            timeLimit: 45
          },
          finalTest: {
            id: "sba7a-final-test-expert",
            moduleId: "sba7a-fundamentals-expert",
            title: "SBA 7(a) Expert Final Test",
            description: "Comprehensive expert-level SBA assessment",
            questions: sampleFinalTestQuestions,
            passingScore: 85,
            maxAttempts: 2,
            timeLimit: 90
          }
        }
      ]
    },
    {
      id: "commercial-real-estate-expert",
      title: "Commercial Real Estate Financing - Expert",
      description: "Master-level CRE portfolio management, complex structuring, and market leadership strategies.",
      level: "expert",
      modules: [
        {
          id: "cre-fundamentals-expert",
          title: "CRE Expert Mastery",
          description: "Expert-level commercial real estate financing and market leadership",
          duration: "6 hours",
          lessons: 10,
          progress: 0,
          status: "available",
          topics: [
            "Master-Level Property Analysis",
            "Advanced Portfolio Management",
            "Complex Deal Structuring",
            "Market Leadership Strategies",
            "Risk Innovation Methods",
            "Regulatory Expertise",
            "Industry Thought Leadership",
            "Advanced Technology Integration",
            "Strategic Market Positioning",
            "Executive Decision Making"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "cre-quiz-expert",
            moduleId: "cre-fundamentals-expert",
            title: "CRE Financing Quiz - Expert",
            description: "Test your expert CRE knowledge",
            questions: sampleQuizQuestions,
            passingScore: 85,
            maxAttempts: 2,
            timeLimit: 45
          },
          finalTest: {
            id: "cre-final-test-expert",
            moduleId: "cre-fundamentals-expert", 
            title: "CRE Expert Final Test",
            description: "Comprehensive expert-level CRE assessment",
            questions: sampleFinalTestQuestions,
            passingScore: 85,
            maxAttempts: 2,
            timeLimit: 90
          }
        }
      ]
    }
  ]
};

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