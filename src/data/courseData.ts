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
  totalModules: 91, // 13 courses x 7 modules each
  modules: [],
  allCourses: [
    {
      id: "sba-7a-loans",
      title: "SBA 7(a) Loans Mastery",
      description: "Master America's most popular SBA loan program. Learn underwriting, processing, and servicing of SBA 7(a) loans up to $5 million with government backing.",
      modules: [
        {
          id: "sba7a-fundamentals",
          title: "SBA 7(a) Program Fundamentals", 
          description: "Foundation knowledge of SBA 7(a) loan program structure, eligibility requirements, and key features",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "SBA 7(a) Program Overview and History",
            "Eligibility Requirements for Borrowers", 
            "Size Standards and Industry Classifications",
            "Use of Proceeds Regulations",
            "Government Guarantee Structure",
            "Interest Rate Guidelines and Pricing",
            "Loan Terms and Maturity Schedules",
            "Program Benefits vs. Conventional Loans"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-fund-quiz",
            moduleId: "sba7a-fundamentals",
            title: "SBA 7(a) Fundamentals Quiz",
            description: "Test your knowledge of SBA 7(a) program basics",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-underwriting",
          title: "SBA 7(a) Underwriting Process",
          description: "Comprehensive training on SBA 7(a) loan underwriting standards and procedures",
          duration: "4 hours", 
          lessons: 7,
          progress: 0,
          status: "locked",
          topics: [
            "Credit Analysis and Risk Assessment",
            "Cash Flow Analysis and Projections",
            "Collateral Evaluation and Appraisal",
            "Personal Guaranty Requirements",
            "SBA Form 1919 and Documentation",
            "Environmental and Compliance Reviews",
            "Loan Committee Presentation Skills"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-underwriting-quiz",
            moduleId: "sba7a-underwriting", 
            title: "SBA 7(a) Underwriting Quiz",
            description: "Test your underwriting knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-processing",
          title: "SBA 7(a) Loan Processing",
          description: "Step-by-step loan processing procedures from application to closing",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "locked",
          topics: [
            "Application Intake and Initial Review",
            "Document Collection and Verification",
            "SBA Authorization Process",
            "Loan Closing Procedures",
            "Funding and Disbursement",
            "Post-Closing Requirements",
            "Quality Control and Compliance",
            "Customer Communication Throughout Process"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-processing-quiz",
            moduleId: "sba7a-processing",
            title: "SBA 7(a) Processing Quiz", 
            description: "Test your processing knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-servicing",
          title: "SBA 7(a) Loan Servicing", 
          description: "Ongoing loan administration and portfolio management for SBA 7(a) loans",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "locked",
          topics: [
            "Payment Processing and Collections",
            "Annual Renewal and Monitoring",
            "Modification and Workout Procedures",
            "Default Prevention Strategies",
            "SBA Liquidation Process",
            "Guaranty Purchase Procedures",
            "Portfolio Reporting Requirements"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-servicing-quiz", 
            moduleId: "sba7a-servicing",
            title: "SBA 7(a) Servicing Quiz",
            description: "Test your servicing knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-compliance",
          title: "SBA 7(a) Compliance & Regulations",
          description: "Regulatory compliance requirements and SBA oversight procedures",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "locked",
          topics: [
            "SBA Standard Operating Procedures",
            "Regulatory Compliance Requirements",
            "SBA Review and Examination Process",
            "Record Keeping and Documentation",
            "Fair Lending and CRA Compliance",
            "BSA/AML Requirements for SBA Loans",
            "Audit Preparation and Response"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-compliance-quiz",
            moduleId: "sba7a-compliance",
            title: "SBA 7(a) Compliance Quiz",
            description: "Test your compliance knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-marketing",
          title: "SBA 7(a) Marketing & Business Development",
          description: "Strategies for marketing SBA 7(a) loans and building referral relationships",
          duration: "3 hours",
          lessons: 7,
          progress: 0,
          status: "locked", 
          topics: [
            "Target Market Identification",
            "Referral Source Development",
            "SBA Advantage Marketing",
            "Competitive Positioning",
            "Customer Education Strategies",
            "Digital Marketing for SBA Loans",
            "Professional Network Building"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-marketing-quiz",
            moduleId: "sba7a-marketing",
            title: "SBA 7(a) Marketing Quiz",
            description: "Test your marketing knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        {
          id: "sba7a-advanced",
          title: "Advanced SBA 7(a) Strategies",
          description: "Advanced techniques for complex SBA 7(a) loan scenarios and portfolio optimization",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "locked",
          topics: [
            "Complex Transaction Structuring",
            "Multi-Location Business Financing",
            "Franchise Financing Strategies", 
            "Acquisition and Expansion Loans",
            "Refinancing and Debt Consolidation",
            "International Trade Financing",
            "Portfolio Risk Management",
            "Advanced Credit Enhancement Techniques"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba7a-advanced-quiz",
            moduleId: "sba7a-advanced",
            title: "Advanced SBA 7(a) Quiz",
            description: "Test your advanced knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          },
          finalTest: {
            id: "sba7a-final-test",
            moduleId: "sba7a-advanced",
            title: "SBA 7(a) Loans Final Certification Test",
            description: "Comprehensive 50-question test covering all SBA 7(a) course material",
            questions: sampleFinalTestQuestions,
            passingScore: 80,
            maxAttempts: 2,
            timeLimit: 90
          }
        }
      ]
    },
    {
      id: "sba-504-loans", 
      title: "SBA 504 Loans Expertise",
      description: "Master SBA 504 real estate and equipment financing up to $20 million with CDC partnerships and long-term fixed rates.",
      modules: [
        {
          id: "sba504-fundamentals",
          title: "SBA 504 Program Structure",
          description: "Understanding the three-party structure and fixed-rate advantages of SBA 504 financing",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "SBA 504 Three-Party Structure",
            "CDC Partnership Requirements",
            "Real Estate Financing Focus",
            "Equipment Financing Guidelines", 
            "Owner-Occupancy Requirements",
            "Job Creation and Retention Goals",
            "Fixed Rate Debenture Structure",
            "Blended Rate Calculations"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba504-fund-quiz",
            moduleId: "sba504-fundamentals",
            title: "SBA 504 Fundamentals Quiz",
            description: "Test your SBA 504 program knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        // ... 6 more modules for SBA 504
        {
          id: "sba504-advanced",
          title: "Advanced SBA 504 Strategies",
          description: "Complex SBA 504 transactions and portfolio management techniques",
          duration: "4 hours",
          lessons: 7,
          progress: 0,
          status: "locked",
          topics: [
            "Complex Real Estate Transactions",
            "Multi-Property Financing",
            "Historic Tax Credit Integration",
            "New Market Tax Credits",
            "Portfolio Diversification",
            "Risk Mitigation Strategies",
            "Advanced Underwriting Techniques"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba504-advanced-quiz",
            moduleId: "sba504-advanced", 
            title: "Advanced SBA 504 Quiz",
            description: "Test advanced SBA 504 knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          },
          finalTest: {
            id: "sba504-final-test",
            moduleId: "sba504-advanced",
            title: "SBA 504 Loans Final Certification Test",
            description: "Comprehensive 50-question test covering all SBA 504 material",
            questions: sampleFinalTestQuestions,
            passingScore: 80,
            maxAttempts: 2,
            timeLimit: 90
          }
        }
      ]
    },
    {
      id: "sba-express-loans",
      title: "SBA Express Loans Mastery", 
      description: "Fast-track SBA financing with 36-hour approval timelines and streamlined processing up to $500,000.",
      modules: [
        {
          id: "sba-express-fundamentals",
          title: "SBA Express Program Basics",
          description: "Understanding the expedited SBA Express loan program and its advantages",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "SBA Express Program Overview",
            "36-Hour Approval Process",
            "Streamlined Documentation",
            "Revolving Credit Options",
            "Interest Rate Structure",
            "Reduced SBA Guarantee",
            "Competitive Advantages"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba-express-fund-quiz",
            moduleId: "sba-express-fundamentals",
            title: "SBA Express Fundamentals Quiz", 
            description: "Test your SBA Express knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        },
        // ... 5 more modules
        {
          id: "sba-express-advanced",
          title: "Advanced SBA Express Strategies",
          description: "Optimizing SBA Express loan portfolios and advanced processing techniques",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "locked",
          topics: [
            "Portfolio Optimization",
            "Advanced Risk Assessment",
            "Technology Integration",
            "Automated Underwriting",
            "Customer Retention Strategies",
            "Cross-Selling Opportunities",
            "Performance Analytics"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "sba-express-advanced-quiz",
            moduleId: "sba-express-advanced",
            title: "Advanced SBA Express Quiz",
            description: "Test advanced SBA Express knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          },
          finalTest: {
            id: "sba-express-final-test",
            moduleId: "sba-express-advanced", 
            title: "SBA Express Final Certification Test",
            description: "Comprehensive test covering all SBA Express material",
            questions: sampleFinalTestQuestions,
            passingScore: 80,
            maxAttempts: 2,
            timeLimit: 90
          }
        }
      ]
    },
    {
      id: "usda-bi-loans",
      title: "USDA B&I Loans Expertise",
      description: "Rural business financing backed by USDA guarantee up to $25 million for qualifying rural area businesses.",
      modules: [
        // ... 7 modules with similar structure
        {
          id: "usda-bi-fundamentals",
          title: "USDA B&I Program Foundation",
          description: "Understanding USDA Business & Industry loan guarantees for rural development",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "USDA B&I Program Overview",
            "Rural Area Eligibility Requirements",
            "Business Industry Focus Areas", 
            "USDA Guarantee Structure",
            "Economic Development Goals",
            "Environmental Compliance",
            "Community Impact Assessment",
            "Job Creation Requirements"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "usda-bi-fund-quiz",
            moduleId: "usda-bi-fundamentals",
            title: "USDA B&I Fundamentals Quiz",
            description: "Test your USDA B&I knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "conventional-loans",
      title: "Conventional Commercial Loans", 
      description: "Traditional commercial financing for established businesses with strong credit profiles and faster approval processes.",
      modules: [
        // ... 7 modules
        {
          id: "conventional-fundamentals",
          title: "Conventional Loan Fundamentals",
          description: "Understanding traditional commercial lending without government guarantees",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available", 
          topics: [
            "Commercial Lending Principles",
            "Credit Analysis Framework",
            "Risk Assessment Methods",
            "Collateral Evaluation",
            "Pricing and Rate Structure",
            "Loan Documentation",
            "Regulatory Compliance",
            "Portfolio Management"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "conventional-fund-quiz",
            moduleId: "conventional-fundamentals",
            title: "Conventional Loan Fundamentals Quiz",
            description: "Test your conventional lending knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "working-capital",
      title: "Working Capital Solutions",
      description: "Bridge cash flow gaps and fund day-to-day business operations with revolving credit and flexible capital solutions.", 
      modules: [
        // ... 7 modules
        {
          id: "working-capital-fundamentals",
          title: "Working Capital Fundamentals",
          description: "Understanding working capital needs and financing solutions",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "Working Capital Definition and Components",
            "Cash Flow Cycle Analysis",
            "Seasonal Financing Needs",
            "Revolving Credit Structures",
            "Asset-Based Lending",
            "Invoice Factoring Options",
            "Line of Credit Management"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "working-capital-fund-quiz",
            moduleId: "working-capital-fundamentals",
            title: "Working Capital Fundamentals Quiz",
            description: "Test your working capital knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "business-line-credit",
      title: "Business Lines of Credit",
      description: "Flexible revolving credit lines allowing businesses to draw funds as needed and pay interest only on used funds.",
      modules: [
        // ... 7 modules
        {
          id: "line-credit-fundamentals",
          title: "Line of Credit Fundamentals",
          description: "Understanding revolving credit facilities and their applications",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "Revolving Credit Structure",
            "Draw and Repayment Mechanics",
            "Interest Rate Calculations",
            "Credit Limit Determinations",
            "Collateral Requirements",
            "Monitoring and Compliance",
            "Renewal Procedures"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "line-credit-fund-quiz",
            moduleId: "line-credit-fundamentals",
            title: "Line of Credit Fundamentals Quiz",
            description: "Test your line of credit knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "term-loans",
      title: "Business Term Loans",
      description: "Fixed-rate business loans for major investments and growth initiatives with competitive rates and predictable payments.",
      modules: [
        // ... 7 modules
        {
          id: "term-loans-fundamentals", 
          title: "Term Loan Fundamentals",
          description: "Understanding fixed-rate term financing for business investments",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Term Loan Structure and Features",
            "Fixed vs Variable Rate Options",
            "Amortization Schedules",
            "Prepayment Considerations",
            "Use of Proceeds Analysis",
            "Credit Enhancement Options",
            "Covenant Structures",
            "Maturity Matching"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "term-loans-fund-quiz",
            moduleId: "term-loans-fundamentals",
            title: "Term Loan Fundamentals Quiz",
            description: "Test your term loan knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "factoring-financing",
      title: "Factoring-Based Financing",
      description: "Convert outstanding invoices into immediate working capital through factoring with 1-3% factor rates.",
      modules: [
        // ... 7 modules
        {
          id: "factoring-fundamentals",
          title: "Invoice Factoring Fundamentals",
          description: "Understanding accounts receivable factoring and its applications",
          duration: "3.5 hours",
          lessons: 7,
          progress: 0,
          status: "available",
          topics: [
            "Factoring vs Traditional Lending",
            "Invoice Verification Process",
            "Factor Rate Calculations",
            "Recourse vs Non-Recourse",
            "Customer Credit Analysis",
            "Collection Procedures",
            "Industry Applications"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "factoring-fund-quiz",
            moduleId: "factoring-fundamentals", 
            title: "Factoring Fundamentals Quiz",
            description: "Test your factoring knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "equipment-financing",
      title: "Equipment Financing Solutions",
      description: "Fund machinery and equipment purchases to help businesses grow and stay competitive in their industry.",
      modules: [
        // ... 7 modules
        {
          id: "equipment-fundamentals",
          title: "Equipment Financing Fundamentals",
          description: "Understanding equipment loans and leases for business assets",
          duration: "4 hours", 
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Equipment Loan vs Lease Options",
            "Collateral Valuation Methods",
            "Depreciation and Tax Implications",
            "Technology Equipment Considerations",
            "Used Equipment Financing",
            "Vendor Financing Programs",
            "Equipment Remarketing",
            "Industry-Specific Requirements"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "equipment-fund-quiz",
            moduleId: "equipment-fundamentals",
            title: "Equipment Financing Quiz",
            description: "Test your equipment financing knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "commercial-real-estate",
      title: "Commercial Real Estate Financing",
      description: "Property acquisition, refinancing, and development financing for office buildings, retail spaces, and warehouses.",
      modules: [
        // ... 7 modules
        {
          id: "cre-fundamentals",
          title: "CRE Financing Fundamentals",
          description: "Understanding commercial real estate financing structures and requirements",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Commercial Property Types",
            "Income Property Analysis",
            "Cap Rate Calculations",
            "Loan-to-Value Considerations",
            "Environmental Due Diligence",
            "Appraisal Requirements",
            "Zoning and Use Restrictions",
            "Market Analysis Methods"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "cre-fund-quiz",
            moduleId: "cre-fundamentals",
            title: "CRE Financing Quiz", 
            description: "Test your commercial real estate knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "healthcare-medical",
      title: "Healthcare & Medical Practice Financing", 
      description: "Specialized financing for medical practices, dental offices, and healthcare facilities including equipment and expansion loans.",
      modules: [
        // ... 7 modules
        {
          id: "healthcare-fundamentals",
          title: "Healthcare Financing Fundamentals",
          description: "Understanding specialized financing needs of medical practices and healthcare facilities",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Medical Practice Valuation",
            "Insurance Reimbursement Analysis",
            "Medical Equipment Financing",
            "Practice Acquisition Loans",
            "Regulatory Compliance Issues",
            "HIPAA and Privacy Considerations",
            "Specialty Practice Requirements",
            "Healthcare Real Estate"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "healthcare-fund-quiz",
            moduleId: "healthcare-fundamentals",
            title: "Healthcare Financing Quiz",
            description: "Test your healthcare financing knowledge",
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          }
        }
      ]
    },
    {
      id: "restaurant-food-service",
      title: "Restaurant & Food Service Financing",
      description: "Complete financing solutions for restaurants, cafes, and food service businesses including kitchen equipment and acquisition loans.",
      modules: [
        // ... 7 modules with final test in last module
        {
          id: "restaurant-fundamentals",
          title: "Restaurant Financing Fundamentals", 
          description: "Understanding the unique financing needs of restaurant and food service businesses",
          duration: "4 hours",
          lessons: 8,
          progress: 0,
          status: "available",
          topics: [
            "Restaurant Industry Overview",
            "Food Service Business Models",
            "Kitchen Equipment Financing",
            "Franchise vs Independent Operations",
            "Seasonal Cash Flow Management",
            "Food Cost Analysis",
            "Location and Lease Considerations",
            "Health Department Compliance"
          ],
          videos: [],
          loanExamples: [],
          caseStudies: [],
          scripts: [],
          quiz: {
            id: "restaurant-fund-quiz",
            moduleId: "restaurant-fundamentals",
            title: "Restaurant Financing Quiz",
            description: "Test your restaurant financing knowledge", 
            questions: sampleQuizQuestions,
            passingScore: 80,
            maxAttempts: 3,
            timeLimit: 30
          },
          finalTest: {
            id: "restaurant-final-test",
            moduleId: "restaurant-fundamentals",
            title: "Restaurant Financing Final Test",
            description: "Comprehensive test covering restaurant financing",
            questions: sampleFinalTestQuestions,
            passingScore: 80,
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
    subtitle: "of 91 modules",
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