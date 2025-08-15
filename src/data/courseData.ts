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
  totalModules: 6,
  modules: [
    {
      id: "foundations",
      title: "Business Finance Foundations",
      description: "Learn the fundamental concepts of business finance, including basic terminology, financial statements, and the role of finance in business operations.",
      duration: "45 min",
      lessons: 6,
      progress: 100,
      status: "completed",
      topics: ["Financial Statements", "Cash Flow", "ROI Basics", "Business Metrics"]
    },
    {
      id: "financial-analysis",
      title: "Financial Analysis Techniques",
      description: "Master essential financial analysis methods used to evaluate business performance, including ratio analysis and trend analysis.",
      duration: "60 min",
      lessons: 8,
      progress: 100,
      status: "completed",
      topics: ["Ratio Analysis", "Trend Analysis", "Benchmarking", "Performance Metrics"]
    },
    {
      id: "funding-solutions",
      title: "Business Funding Solutions",
      description: "Explore various funding options available to businesses, from traditional loans to alternative financing methods that Halo specializes in.",
      duration: "55 min",
      lessons: 7,
      progress: 45,
      status: "in-progress",
      topics: ["Traditional Loans", "Alternative Financing", "Credit Assessment", "Funding Strategies"]
    },
    {
      id: "credit-assessment",
      title: "Credit Assessment & Risk Management",
      description: "Understand how to assess creditworthiness, manage financial risk, and make informed lending decisions in business finance.",
      duration: "50 min",
      lessons: 6,
      progress: 0,
      status: "available",
      topics: ["Credit Scoring", "Risk Assessment", "Documentation", "Decision Making"]
    },
    {
      id: "customer-relations",
      title: "Customer Relations in Finance",
      description: "Develop skills in customer communication, relationship building, and providing excellent service in financial services.",
      duration: "40 min",
      lessons: 5,
      progress: 0,
      status: "locked",
      topics: ["Communication Skills", "Customer Service", "Relationship Building", "Problem Resolution"]
    },
    {
      id: "industry-compliance",
      title: "Industry Standards & Compliance",
      description: "Learn about regulatory requirements, industry best practices, and compliance standards in business finance and lending.",
      duration: "65 min",
      lessons: 9,
      progress: 0,
      status: "locked",
      topics: ["Regulatory Framework", "Compliance Standards", "Documentation", "Best Practices"]
    }
  ]
};

export const statsData = [
  {
    title: "Modules Completed",
    value: 2,
    description: "out of 6 modules",
    trend: { value: 15, isPositive: true }
  },
  {
    title: "Learning Time",
    value: "3.2hrs",
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