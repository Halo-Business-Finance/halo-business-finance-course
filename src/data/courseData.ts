export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: "locked" | "available" | "in-progress" | "completed";
  topics: string[];
}

export interface CourseData {
  modules: Module[];
  totalProgress: number;
  completedModules: number;
  totalModules: number;
}

export const courseData: CourseData = {
  totalProgress: 35,
  completedModules: 2,
  totalModules: 8,
  modules: [
    {
      id: "foundations",
      title: "Business Finance Foundations",
      description: "Establish a solid foundation in business finance principles, financial statement analysis, and fundamental concepts essential for understanding modern corporate finance.",
      duration: "2.5 hours",
      lessons: 12,
      progress: 100,
      status: "completed",
      topics: ["Financial Statement Analysis", "Time Value of Money", "Risk and Return", "Working Capital Management", "Financial Ratios", "Cash Flow Analysis"]
    },
    {
      id: "capital-markets",
      title: "Capital Markets & Financial Systems",
      description: "Comprehensive study of capital markets, including equity and debt markets, market efficiency, institutional investors, and the role of financial intermediaries in the economy.",
      duration: "3 hours",
      lessons: 15,
      progress: 100,
      status: "completed",
      topics: ["Primary vs Secondary Markets", "Equity Markets", "Bond Markets", "Market Efficiency Theory", "Institutional Investors", "Trading Systems", "Market Regulation"]
    },
    {
      id: "sba-loans",
      title: "SBA Loan Programs & Structures",
      description: "Deep dive into Small Business Administration loan programs, including 7(a), 504, and microloans. Learn eligibility requirements, application processes, and risk assessment.",
      duration: "2 hours",
      lessons: 10,
      progress: 45,
      status: "in-progress",
      topics: ["SBA 7(a) Loans", "SBA 504 Programs", "SBA Microloans", "Eligibility Criteria", "Application Process", "Guarantee Structure", "Risk Assessment", "Documentation Requirements"]
    },
    {
      id: "conventional-loans",
      title: "Conventional Business Lending",
      description: "Master traditional bank lending products including term loans, lines of credit, equipment financing, and commercial real estate loans. Understand underwriting standards and pricing.",
      duration: "2.5 hours",
      lessons: 13,
      progress: 0,
      status: "available",
      topics: ["Term Loans", "Lines of Credit", "Equipment Financing", "Commercial Real Estate", "Underwriting Standards", "Credit Analysis", "Loan Pricing", "Collateral Requirements"]
    },
    {
      id: "bridge-loans",
      title: "Bridge Financing & Short-Term Solutions",
      description: "Explore bridge loans, asset-based lending, and other short-term financing solutions. Learn when and how to structure these products for optimal client outcomes.",
      duration: "1.5 hours",
      lessons: 8,
      progress: 0,
      status: "locked",
      topics: ["Bridge Loan Structures", "Asset-Based Lending", "Invoice Factoring", "Short-Term Financing", "Exit Strategies", "Risk Mitigation", "Pricing Models"]
    },
    {
      id: "alternative-finance",
      title: "Alternative Financing Solutions",
      description: "Comprehensive overview of non-traditional financing options including merchant cash advances, revenue-based financing, and peer-to-peer lending platforms.",
      duration: "2 hours",
      lessons: 11,
      progress: 0,
      status: "locked",
      topics: ["Merchant Cash Advances", "Revenue-Based Financing", "P2P Lending", "Crowdfunding", "Fintech Solutions", "Alternative Credit Scoring", "Industry Trends"]
    },
    {
      id: "credit-risk",
      title: "Credit Analysis & Risk Management",
      description: "Advanced credit analysis techniques, risk assessment methodologies, and portfolio management strategies used in commercial lending and business finance.",
      duration: "2.5 hours",
      lessons: 12,
      progress: 0,
      status: "locked",
      topics: ["Financial Statement Analysis", "Cash Flow Modeling", "Industry Analysis", "Credit Scoring Models", "Portfolio Risk", "Loss Mitigation", "Regulatory Compliance"]
    },
    {
      id: "regulatory-compliance",
      title: "Banking Regulations & Compliance",
      description: "Navigate the complex regulatory environment including BSA/AML, fair lending practices, consumer protection laws, and industry best practices for compliance management.",
      duration: "2 hours",
      lessons: 9,
      progress: 0,
      status: "locked",
      topics: ["BSA/AML Requirements", "Fair Lending Laws", "UDAAP Prevention", "Consumer Protection", "Documentation Standards", "Audit Preparation", "Regulatory Reporting"]
    }
  ]
};

export const statsData = [
  {
    title: "Modules Completed",
    value: 2,
    description: "out of 8 modules",
    trend: { value: 15, isPositive: true }
  },
  {
    title: "Learning Time",
    value: "12.5hrs",
    description: "total time invested",
    trend: { value: 22, isPositive: true }
  },
  {
    title: "Current Streak",
    value: "5 days",
    description: "consecutive learning",
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Progress Score",
    value: "85%",
    description: "average quiz score",
    trend: { value: 12, isPositive: true }
  }
];