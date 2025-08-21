export interface LoanExample {
  title: string;
  scenario: string;
  loanAmount: string;
  loanType: string;
  borrowerProfile: string;
  keyLearningPoints: string[];
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
}

export interface CourseData {
  modules: Module[];
  totalProgress: number;
  completedModules: number;
  totalModules: number;
}

export const courseData: CourseData = {
  totalProgress: 0,
  completedModules: 0,
  totalModules: 8,
  modules: [
    {
      id: "foundations",
      title: "Business Finance Foundations",
      description: "Establish a solid foundation in business finance principles, financial statement analysis, and fundamental concepts essential for understanding modern corporate finance.",
      duration: "2.5 hours",
      lessons: 12,
      progress: 0,
      status: "available",
      topics: ["Financial Statement Analysis", "Time Value of Money", "Risk and Return", "Working Capital Management", "Financial Ratios", "Cash Flow Analysis"],
      loanExamples: [
        {
          title: "Working Capital Analysis",
          scenario: "TechStart Inc., a software company, needs $150,000 to manage seasonal cash flow gaps during their growth phase.",
          loanAmount: "$150,000",
          loanType: "Working Capital Line of Credit",
          borrowerProfile: "2-year-old technology startup with $500K annual revenue",
          keyLearningPoints: [
            "Calculate working capital needs using cash flow analysis",
            "Evaluate current ratio and quick ratio for liquidity assessment",
            "Understand seasonal business patterns impact on financing needs"
          ]
        },
        {
          title: "Equipment Financing Basics",
          scenario: "Green Valley Restaurant wants to purchase new kitchen equipment worth $75,000 to expand their catering services.",
          loanAmount: "$75,000",
          loanType: "Equipment Term Loan",
          borrowerProfile: "Established restaurant with 5 years in business, stable cash flow",
          keyLearningPoints: [
            "Apply time value of money concepts to loan payments",
            "Analyze debt service coverage ratio",
            "Evaluate equipment as collateral and depreciation impact"
          ]
        }
      ]
    },
    {
      id: "capital-markets",
      title: "Capital Markets & Financial Systems",
      description: "Comprehensive study of capital markets, including equity and debt markets, market efficiency, institutional investors, and the role of financial intermediaries in the economy.",
      duration: "3 hours",
      lessons: 15,
      progress: 0,
      status: "available",
      topics: ["Primary vs Secondary Markets", "Equity Markets", "Bond Markets", "Market Efficiency Theory", "Institutional Investors", "Trading Systems", "Market Regulation"],
      loanExamples: [
        {
          title: "Corporate Bond Issuance",
          scenario: "Manufacturing Corp needs $2 million for expansion and chooses to issue corporate bonds rather than traditional bank financing.",
          loanAmount: "$2,000,000",
          loanType: "Corporate Bond Issuance",
          borrowerProfile: "Mid-size manufacturing company with strong credit rating",
          keyLearningPoints: [
            "Compare cost of capital between bank loans and bond financing",
            "Understand credit rating impact on borrowing costs",
            "Analyze market timing for debt issuance",
            "Evaluate covenants and restrictions in bond agreements"
          ]
        },
        {
          title: "Private Placement Debt",
          scenario: "Regional Healthcare System seeks $5 million through private placement to avoid public market requirements.",
          loanAmount: "$5,000,000",
          loanType: "Private Placement Note",
          borrowerProfile: "Healthcare organization with predictable revenue streams",
          keyLearningPoints: [
            "Compare private vs public debt markets",
            "Understand institutional investor requirements",
            "Analyze pricing differences between market types"
          ]
        }
      ]
    },
    {
      id: "sba-loans",
      title: "SBA Loan Programs & Structures",
      description: "Deep dive into Small Business Administration loan programs, including 7(a), 504, and microloans. Learn eligibility requirements, application processes, and risk assessment.",
      duration: "2 hours",
      lessons: 10,
      progress: 0,
      status: "available",
      topics: ["SBA 7(a) Loans", "SBA 504 Programs", "SBA Microloans", "Eligibility Criteria", "Application Process", "Guarantee Structure", "Risk Assessment", "Documentation Requirements"],
      loanExamples: [
        {
          title: "SBA 7(a) General Purpose Loan",
          scenario: "ABC Auto Repair needs $350,000 to purchase a competing shop and expand operations in their market.",
          loanAmount: "$350,000",
          loanType: "SBA 7(a) Standard Loan",
          borrowerProfile: "Family-owned auto repair shop, 8 years in business, good credit",
          keyLearningPoints: [
            "Navigate SBA eligibility requirements and size standards",
            "Structure loan with SBA guarantee to reduce lender risk",
            "Prepare comprehensive business plan and financial projections",
            "Understand personal guarantee requirements and collateral"
          ]
        },
        {
          title: "SBA 504 Real Estate Purchase",
          scenario: "Metro Dental Practice wants to buy their office building for $800,000 instead of continuing to rent.",
          loanAmount: "$800,000",
          loanType: "SBA 504 Real Estate Loan",
          borrowerProfile: "Dental practice with 10 years operating history, strong cash flow",
          keyLearningPoints: [
            "Structure three-way financing: bank loan, SBA debenture, owner injection",
            "Evaluate owner-occupied real estate requirements",
            "Calculate job creation/retention requirements",
            "Understand fixed-rate SBA debenture benefits"
          ]
        },
        {
          title: "SBA Microloan Program",
          scenario: "Fresh Foods Catering, a startup, needs $25,000 for initial equipment and working capital to launch their business.",
          loanAmount: "$25,000",
          loanType: "SBA Microloan",
          borrowerProfile: "New business owner with culinary experience but limited business credit",
          keyLearningPoints: [
            "Work with Community Development Financial Institutions (CDFIs)",
            "Understand microloan size limitations and terms",
            "Access business coaching and technical assistance",
            "Navigate startup lending when conventional financing isn't available"
          ]
        }
      ]
    },
    {
      id: "conventional-loans",
      title: "Conventional Business Lending",
      description: "Master traditional bank lending products including term loans, lines of credit, equipment financing, and commercial real estate loans. Understand underwriting standards and pricing.",
      duration: "2.5 hours",
      lessons: 13,
      progress: 0,
      status: "available",
      topics: ["Term Loans", "Lines of Credit", "Equipment Financing", "Commercial Real Estate", "Underwriting Standards", "Credit Analysis", "Loan Pricing", "Collateral Requirements"],
      loanExamples: [
        {
          title: "Commercial Real Estate Acquisition",
          scenario: "Industrial Partners LLC wants to purchase a warehouse facility for $1.2 million to consolidate their distribution operations.",
          loanAmount: "$1,200,000",
          loanType: "Commercial Real Estate Term Loan",
          borrowerProfile: "Established distribution company with 15 years in business",
          keyLearningPoints: [
            "Analyze debt service coverage ratio requirements (typically 1.25x minimum)",
            "Evaluate loan-to-value ratios for commercial real estate (typically 75-80%)",
            "Structure amortization and balloon payment terms",
            "Assess environmental and appraisal requirements"
          ]
        },
        {
          title: "Manufacturing Equipment Financing",
          scenario: "Precision Manufacturing needs $500,000 to purchase new CNC machines to meet increased customer demand.",
          loanAmount: "$500,000",
          loanType: "Equipment Term Loan",
          borrowerProfile: "Manufacturing company with strong order backlog and 12 years experience",
          keyLearningPoints: [
            "Match loan term to equipment useful life",
            "Use equipment as primary collateral",
            "Evaluate technology obsolescence risk",
            "Structure seasonal payment options if applicable"
          ]
        },
        {
          title: "Business Line of Credit",
          scenario: "Seasonal Sports Retailer needs a $200,000 revolving credit facility to manage inventory purchases and seasonal cash flow variations.",
          loanAmount: "$200,000",
          loanType: "Revolving Line of Credit",
          borrowerProfile: "Seasonal retail business with 7 years operating history",
          keyLearningPoints: [
            "Structure revolving vs. non-revolving facilities",
            "Set appropriate borrowing base on accounts receivable and inventory",
            "Establish seasonal advance rates and cleanup periods",
            "Monitor covenant compliance throughout the year"
          ]
        }
      ]
    },
    {
      id: "bridge-loans",
      title: "Bridge Financing & Short-Term Solutions",
      description: "Explore bridge loans, asset-based lending, and other short-term financing solutions. Learn when and how to structure these products for optimal client outcomes.",
      duration: "1.5 hours",
      lessons: 8,
      progress: 0,
      status: "locked",
      topics: ["Bridge Loan Structures", "Asset-Based Lending", "Invoice Factoring", "Short-Term Financing", "Exit Strategies", "Risk Mitigation", "Pricing Models"],
      loanExamples: [
        {
          title: "Real Estate Bridge Loan",
          scenario: "Property Investors Group needs $750,000 to quickly close on a commercial property while arranging permanent financing.",
          loanAmount: "$750,000",
          loanType: "Commercial Bridge Loan",
          borrowerProfile: "Experienced real estate investors with strong track record",
          keyLearningPoints: [
            "Structure short-term financing (6-24 months typical)",
            "Price for higher risk with rates 2-4% above prime",
            "Require clear exit strategy and takeout financing plan",
            "Evaluate loan-to-cost vs. loan-to-value ratios"
          ]
        },
        {
          title: "Asset-Based Line of Credit",
          scenario: "Growing Distributors Inc. needs $300,000 in flexible financing based on their accounts receivable and inventory levels.",
          loanAmount: "$300,000",
          loanType: "Asset-Based Revolving Credit",
          borrowerProfile: "Fast-growing distribution company with cash flow timing issues",
          keyLearningPoints: [
            "Calculate borrowing base on eligible receivables (80%) and inventory (50%)",
            "Implement field examination and audit procedures",
            "Monitor advance rates and collateral quality",
            "Structure appropriate interest rates for higher-risk lending"
          ]
        },
        {
          title: "Invoice Factoring Solution",
          scenario: "Tech Services Company has $100,000 in outstanding invoices but needs immediate cash flow to meet payroll and expenses.",
          loanAmount: "$85,000",
          loanType: "Invoice Factoring",
          borrowerProfile: "Service company with creditworthy customers but cash timing issues",
          keyLearningPoints: [
            "Evaluate customer creditworthiness over borrower creditworthiness",
            "Structure recourse vs. non-recourse factoring",
            "Calculate factor rates and fees (typically 1-5% of invoice value)",
            "Understand collection responsibilities and customer notification"
          ]
        }
      ]
    },
    {
      id: "alternative-finance",
      title: "Alternative Financing Solutions",
      description: "Comprehensive overview of non-traditional financing options including merchant cash advances, revenue-based financing, and peer-to-peer lending platforms.",
      duration: "2 hours",
      lessons: 11,
      progress: 0,
      status: "locked",
      topics: ["Merchant Cash Advances", "Revenue-Based Financing", "P2P Lending", "Crowdfunding", "Fintech Solutions", "Alternative Credit Scoring", "Industry Trends"],
      loanExamples: [
        {
          title: "Merchant Cash Advance",
          scenario: "Downtown Deli processes $50,000 monthly in credit card sales and needs $35,000 quickly for kitchen renovation and equipment.",
          loanAmount: "$35,000",
          loanType: "Merchant Cash Advance",
          borrowerProfile: "Small restaurant with consistent credit card processing volume",
          keyLearningPoints: [
            "Calculate factor rates vs. APR (factor rates typically 1.1-1.5)",
            "Understand daily percentage collection (typically 10-20% of daily sales)",
            "Evaluate speed vs. cost trade-offs",
            "Structure holdback percentages based on seasonal variations"
          ]
        },
        {
          title: "Revenue-Based Financing",
          scenario: "Software Startup has predictable monthly recurring revenue of $40,000 and needs $200,000 for marketing and expansion.",
          loanAmount: "$200,000",
          loanType: "Revenue-Based Financing",
          borrowerProfile: "SaaS company with growing monthly recurring revenue",
          keyLearningPoints: [
            "Structure repayment as percentage of monthly revenue (typically 2-10%)",
            "Set revenue cap for total repayment (typically 1.3-2.5x loan amount)",
            "Evaluate predictable revenue streams for qualification",
            "Understand equity-free growth capital benefits"
          ]
        },
        {
          title: "P2P Lending Platform",
          scenario: "Marketing Agency needs $75,000 for new hire salaries and office expansion but doesn't qualify for traditional bank financing.",
          loanAmount: "$75,000",
          loanType: "Peer-to-Peer Business Loan",
          borrowerProfile: "Service-based business with strong revenue but limited collateral",
          keyLearningPoints: [
            "Navigate online application and approval processes",
            "Understand investor-funded loan structures",
            "Compare platform fees vs. traditional loan costs",
            "Evaluate alternative credit scoring models used by platforms"
          ]
        }
      ]
    },
    {
      id: "credit-risk",
      title: "Credit Analysis & Risk Management",
      description: "Advanced credit analysis techniques, risk assessment methodologies, and portfolio management strategies used in commercial lending and business finance.",
      duration: "2.5 hours",
      lessons: 12,
      progress: 0,
      status: "locked",
      topics: ["Financial Statement Analysis", "Cash Flow Modeling", "Industry Analysis", "Credit Scoring Models", "Portfolio Risk", "Loss Mitigation", "Regulatory Compliance"],
      loanExamples: [
        {
          title: "Turnaround Financing Analysis",
          scenario: "Manufacturing Solutions Inc. has declining profits and needs $400,000 to restructure operations and return to profitability.",
          loanAmount: "$400,000",
          loanType: "Turnaround/Workout Financing",
          borrowerProfile: "Established manufacturer experiencing temporary financial difficulties",
          keyLearningPoints: [
            "Conduct deep-dive financial statement analysis to identify core problems",
            "Build 13-week cash flow projections to ensure viability",
            "Evaluate management team's turnaround capabilities",
            "Structure enhanced monitoring and reporting requirements",
            "Assess industry trends and competitive position"
          ]
        },
        {
          title: "Multi-Location Retail Credit Analysis",
          scenario: "Regional Retail Chain wants $1.5 million to open 5 new locations but has inconsistent performance across existing stores.",
          loanAmount: "$1,500,000",
          loanType: "Multi-Location Expansion Loan",
          borrowerProfile: "Retail chain with 15 existing locations, mixed performance",
          keyLearningPoints: [
            "Analyze same-store sales trends and location-specific performance",
            "Evaluate market saturation and demographic analysis for new locations",
            "Build comprehensive cash flow model incorporating expansion timeline",
            "Assess management depth and operational scalability",
            "Structure phased funding based on performance milestones"
          ]
        },
        {
          title: "Seasonal Business Risk Assessment",
          scenario: "Holiday Decorations Warehouse needs $250,000 to fund inventory purchases, with 80% of annual sales occurring in Q4.",
          loanAmount: "$250,000",
          loanType: "Seasonal Term Loan",
          borrowerProfile: "Seasonal wholesale business with 10-year track record",
          keyLearningPoints: [
            "Model seasonal cash flow patterns and working capital needs",
            "Evaluate inventory management and obsolescence risks",
            "Structure seasonal payment schedules aligned with cash generation",
            "Assess weather and economic sensitivity impacts",
            "Build stress testing scenarios for poor seasons"
          ]
        }
      ]
    },
    {
      id: "regulatory-compliance",
      title: "Banking Regulations & Compliance",
      description: "Navigate the complex regulatory environment including BSA/AML, fair lending practices, consumer protection laws, and industry best practices for compliance management.",
      duration: "2 hours",
      lessons: 9,
      progress: 0,
      status: "locked",
      topics: ["BSA/AML Requirements", "Fair Lending Laws", "UDAAP Prevention", "Consumer Protection", "Documentation Standards", "Audit Preparation", "Regulatory Reporting"],
      loanExamples: [
        {
          title: "BSA/AML Compliance Case",
          scenario: "International Import/Export Company requests $500,000 credit facility, requiring enhanced due diligence for money laundering prevention.",
          loanAmount: "$500,000",
          loanType: "Commercial Line of Credit",
          borrowerProfile: "Import/export business with international transactions and cash-intensive operations",
          keyLearningPoints: [
            "Conduct enhanced customer due diligence (CDD) procedures",
            "File Suspicious Activity Reports (SARs) when appropriate",
            "Implement ongoing monitoring for unusual transaction patterns",
            "Maintain proper BSA/AML documentation and training records",
            "Understand beneficial ownership requirements"
          ]
        },
        {
          title: "Fair Lending Compliance Review",
          scenario: "Community Bank's loan portfolio shows potential disparities in approval rates and pricing for minority-owned businesses seeking similar credit.",
          loanAmount: "Portfolio Review",
          loanType: "Fair Lending Analysis",
          borrowerProfile: "Community bank serving diverse market demographics",
          keyLearningPoints: [
            "Conduct statistical analysis of lending patterns by protected class",
            "Implement fair lending monitoring and testing procedures",
            "Document legitimate business justifications for credit decisions",
            "Train staff on prohibited basis factors and equal treatment",
            "Establish corrective action plans for identified disparities"
          ]
        },
        {
          title: "UDAAP Prevention Framework",
          scenario: "Regional Bank needs to review loan marketing materials and practices to ensure no unfair, deceptive, or abusive acts or practices.",
          loanAmount: "Compliance Program",
          loanType: "UDAAP Compliance Review",
          borrowerProfile: "Regional bank with multiple loan products and marketing channels",
          keyLearningPoints: [
            "Review loan disclosures and marketing materials for clarity and accuracy",
            "Evaluate loan pricing and fee structures for reasonableness",
            "Implement customer complaint monitoring and resolution procedures",
            "Train staff on recognizing and preventing UDAAP violations",
            "Establish ongoing compliance monitoring and testing programs"
          ]
        }
      ]
    }
  ]
};

export const statsData = [
  {
    title: "Modules Completed",
    value: 0,
    description: "out of 8 modules",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Learning Time",
    value: "0hrs",
    description: "total time invested",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Current Streak",
    value: "0 days",
    description: "consecutive learning",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Progress Score",
    value: "0%",
    description: "average quiz score",
    trend: { value: 0, isPositive: true }
  }
];