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
      title: "Halo Business Finance Foundations",
      description: "Master the core business finance principles used at Halo Business Finance. This comprehensive module covers financial statement analysis, risk assessment, and decision-making frameworks essential for success in commercial lending and business finance.",
      duration: "2.5 hours",
      lessons: 12,
      progress: 0,
      status: "available",
      topics: ["Halo's Financial Analysis Framework", "Commercial Lending Principles", "Risk Assessment Methodologies", "Working Capital Solutions", "Financial Ratios & Metrics", "Cash Flow Analysis for Business Loans"],
      videos: [
        {
          title: "Welcome to Halo Business Finance Training",
          description: "Introduction to Halo's approach to business finance and commercial lending excellence",
          duration: "18:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Halo's Financial Statement Analysis Framework",
          description: "Learn Halo's proprietary methods for analyzing business financial health and creditworthiness",
          duration: "32:15",
          videoType: "youtube", 
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Time Value of Money & NPV Calculations",
          description: "Master present value, future value, and net present value concepts",
          duration: "25:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ", 
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Working Capital Management Strategies",
          description: "Learn to optimize cash, inventory, and receivables management",
          duration: "28:20",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Tech Startup Financial Analysis",
          company: "InnovateTech Solutions",
          situation: "A 3-year-old SaaS company seeking $500K growth capital to expand their sales team and marketing efforts. Revenue has grown from $100K to $2M annually.",
          challenge: "Limited financial history, negative cash flow due to aggressive growth investments, high customer acquisition costs, and difficulty proving sustainable profitability to traditional lenders.",
          solution: "Comprehensive financial analysis focusing on unit economics, customer lifetime value, and monthly recurring revenue trends. Developed 18-month cash flow projections incorporating sales team productivity ramp-up.",
          outcome: "Secured revenue-based financing at 12% cost of capital with repayment tied to monthly revenue percentage. Company achieved break-even in 14 months and increased ARR by 180%.",
          lessonsLearned: [
            "SaaS metrics like LTV/CAC ratio are crucial for tech company analysis",
            "Monthly recurring revenue provides predictable cash flow for lenders",
            "Growth-stage companies need flexible repayment structures",
            "Revenue-based financing can bridge gap between debt and equity"
          ]
        },
        {
          title: "Family Restaurant Working Capital Crisis",
          company: "Bella's Italian Bistro",
          situation: "20-year-old family restaurant experiencing cash flow issues due to seasonal decline and equipment repairs. Need $75K to cover payroll and supplier payments through slow winter months.",
          challenge: "Seasonal revenue pattern, aging equipment, limited collateral, personal guarantees already stretched, and tight timeline for funding need.",
          solution: "Analyzed 5-year seasonal patterns, structured inventory-based line of credit with seasonal advance rates. Implemented cash flow management system and equipment replacement plan.",
          outcome: "Avoided closure during slow season, implemented cost controls that improved margins by 15%, secured equipment lease for kitchen upgrades, returned to profitability.",
          lessonsLearned: [
            "Seasonal businesses need flexible credit structures",
            "Historical pattern analysis predicts future cash flow needs",
            "Working capital solutions must align with business cycles",
            "Operational improvements often accompany financing solutions"
          ]
        }
      ],
      scripts: [
        {
          title: "Initial Client Financial Assessment Meeting",
          scenario: "First meeting with potential borrower to understand their financial position and funding needs",
          dialogues: [
            {
              speaker: "Loan Officer",
              text: "Thank you for meeting with me today. Let's start by understanding your business and what brings you to our bank for financing."
            },
            {
              speaker: "Business Owner",
              text: "We've been operating for 5 years and have steady growth, but we need working capital to take advantage of a large contract opportunity."
            },
            {
              speaker: "Loan Officer",
              text: "That's great to hear about the growth and opportunity. Can you walk me through your current financial position - annual revenue, monthly cash flow patterns, and existing debt obligations?"
            },
            {
              speaker: "Business Owner",
              text: "Our revenue last year was $1.2 million, up from $900K the year before. Monthly cash flow varies between $15K to $45K depending on the season."
            },
            {
              speaker: "Loan Officer",
              text: "I appreciate those details. Now, regarding this contract opportunity - can you tell me about the timeline, payment terms, and how much additional working capital you'll need?"
            }
          ],
          keyPoints: [
            "Start with open-ended questions to understand the business",
            "Gather specific financial metrics early in conversation", 
            "Understand both current position and future opportunity",
            "Listen for cash flow patterns and seasonal variations"
          ]
        },
        {
          title: "Explaining Financial Ratios to Business Owners",
          scenario: "Educational conversation about key financial ratios and their importance in lending decisions",
          dialogues: [
            {
              speaker: "Loan Officer",
              text: "I'd like to explain some key financial ratios we use to evaluate loan applications. These will help you understand our decision process."
            },
            {
              speaker: "Business Owner", 
              text: "That would be helpful. I know you look at profitability, but I'm not sure what specific numbers matter most."
            },
            {
              speaker: "Loan Officer",
              text: "Great question. The debt service coverage ratio is crucial - it shows whether your cash flow can support loan payments. We calculate your net operating income divided by total debt payments."
            },
            {
              speaker: "Business Owner",
              text: "So if my operating income is $100K and my debt payments are $60K annually, that's 1.67?"
            },
            {
              speaker: "Loan Officer",
              text: "Exactly! A ratio above 1.25 shows strong ability to service debt. We also look at your current ratio - current assets divided by current liabilities - to measure short-term liquidity."
            }
          ],
          keyPoints: [
            "Use simple language to explain complex financial concepts",
            "Provide specific examples using client's numbers when possible",
            "Focus on ratios most relevant to their loan request",
            "Explain why these ratios matter for lending decisions"
          ]
        }
      ]
    },
    {
      id: "capital-markets",
      title: "Halo Capital Markets & Lending Systems",
      description: "Explore capital markets through Halo Business Finance's perspective. Learn how institutional funding, secondary markets, and capital allocation impact commercial lending decisions and portfolio management strategies.",
      duration: "3 hours",
      lessons: 15,
      progress: 0,
      status: "locked",
      topics: ["Primary vs Secondary Markets", "Equity Markets", "Bond Markets", "Market Efficiency Theory", "Institutional Investors", "Trading Systems", "Market Regulation"],
      videos: [
        {
          title: "Capital Markets Overview & Structure",
          description: "Introduction to primary and secondary markets and their functions",
          duration: "24:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Equity Markets & Stock Valuation",
          description: "Understanding stock markets, IPOs, and equity valuation methods",
          duration: "35:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Bond Markets & Fixed Income Securities",
          description: "Deep dive into bond pricing, yield curves, and credit risk",
          duration: "29:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Institutional Investors & Market Making",
          description: "Role of institutions, market makers, and trading systems",
          duration: "22:40",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Corporate Bond vs Bank Financing Decision",
          company: "MidAtlantic Manufacturing Corp",
          situation: "Established manufacturing company needs $5M for facility expansion. Strong credit rating (BBB+) and consistent cash flows. Considering both traditional bank financing and corporate bond issuance.",
          challenge: "Evaluating cost differences between bank loan at prime + 200bps vs corporate bond at 150bps over treasuries, considering issuance costs, covenants, and market timing.",
          solution: "Comprehensive analysis of all-in costs including underwriting fees, legal costs, and ongoing compliance. Evaluated market conditions and interest rate environment. Modeled covenant structures and operational flexibility.",
          outcome: "Chose corporate bond issuance saving 75bps annually in interest costs. Used bank relationship for backup credit facility. Completed expansion 6 months ahead of schedule with enhanced market position.",
          lessonsLearned: [
            "All-in cost analysis must include issuance and ongoing costs",
            "Market timing significantly impacts bond pricing",
            "Maintain banking relationships even when using capital markets",
            "Covenant flexibility is worth modest cost premium in many cases"
          ]
        },
        {
          title: "Private Placement for Healthcare System", 
          company: "Regional Medical Center Network",
          situation: "Healthcare network with predictable revenue streams from insurance reimbursements needs $10M for medical equipment and facility upgrades. Wants to avoid public market scrutiny and costs.",
          challenge: "Structuring private placement to appeal to institutional investors while maintaining operational flexibility. Needed competitive pricing without public rating agency process.",
          solution: "Targeted insurance companies and pension funds with healthcare investment mandates. Structured 10-year fixed rate notes with step-down pricing based on coverage ratios. Included equipment security provisions.",
          outcome: "Successfully placed $10M at 200bps over treasuries with 3 institutional investors. Maintained private company flexibility while accessing capital market pricing. Equipment investments improved patient outcomes and operational efficiency.",
          lessonsLearned: [
            "Private placements offer middle ground between bank and public financing",
            "Institutional investors value predictable cash flows from healthcare",
            "Security provisions can enhance pricing for equipment purchases", 
            "Relationship management crucial for future financing flexibility"
          ]
        }
      ],
      scripts: [
        {
          title: "Capital Markets vs Bank Financing Discussion",
          scenario: "Advising mid-size company on financing options for major expansion",
          dialogues: [
            {
              speaker: "Financial Advisor",
              text: "Given your financing needs and company profile, you have several options beyond traditional bank lending. Let's explore capital markets alternatives."
            },
            {
              speaker: "CFO",
              text: "We've always used bank financing. What advantages would capital markets offer for our $3 million need?"
            },
            {
              speaker: "Financial Advisor", 
              text: "Capital markets can offer longer terms, potentially lower rates, and less restrictive covenants. However, there are trade-offs in complexity and disclosure requirements."
            },
            {
              speaker: "CFO",
              text: "What about the costs? I hear bond issuances have significant upfront expenses."
            },
            {
              speaker: "Financial Advisor",
              text: "True, but at your size, we'd likely look at private placement, which has lower issuance costs. For $3M, you're borderline - let's analyze the break-even point."
            }
          ],
          keyPoints: [
            "Compare all-in costs including issuance expenses",
            "Consider company size and complexity thresholds",
            "Evaluate covenant flexibility and operational impact",
            "Assess market timing and interest rate environment"
          ]
        }
      ]
    },
    {
      id: "sba-loans",
      title: "Halo SBA Lending Excellence Program",
      description: "Master Halo Business Finance's approach to SBA lending. Learn our proprietary underwriting processes, client onboarding strategies, and risk management techniques for 7(a), 504, and microloan programs.",
      duration: "2 hours",
      lessons: 10,
      progress: 0,
      status: "locked",
      topics: ["Halo's SBA 7(a) Process", "504 Program Specialization", "Microloan Strategies", "Halo Eligibility Assessment", "Streamlined Application Process", "Guarantee Optimization", "Portfolio Risk Management", "Client Success Metrics"],
      videos: [
        {
          title: "SBA 7(a) Loan Program Complete Guide",
          description: "Comprehensive overview of the most popular SBA loan program",
          duration: "38:20",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "SBA 504 Real Estate & Equipment Financing",
          description: "Understanding 504 program structure and real estate financing",
          duration: "32:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "SBA Microloans for Startups",
          description: "Small loan programs for new businesses and underserved markets",
          duration: "19:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "SBA Application Process & Documentation",
          description: "Step-by-step guide to preparing and submitting SBA applications",
          duration: "26:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Restaurant Chain SBA 504 Real Estate Purchase",
          company: "Hometown Burger Franchise",
          situation: "Successful franchisee operating 3 locations wants to purchase the real estate for their flagship location instead of continuing to rent. Property value $1.2M, strong operating history.",
          challenge: "Coordinating three-party financing structure (bank, CDC, borrower equity), meeting job creation requirements, navigating SBA bureaucracy, and timing the transaction with lease expiration.",
          solution: "Structured SBA 504 loan with 50% bank financing ($600K), 40% SBA debenture ($480K), and 10% owner equity ($120K). Documented job retention and creation plan meeting SBA requirements.",
          outcome: "Closed transaction 30 days before lease expiration. Fixed-rate SBA debenture provided payment certainty. Property appreciated 15% in first year. Owner expanded to 4th location using equity created.",
          lessonsLearned: [
            "SBA 504 coordination requires early planning and communication",
            "Job creation/retention documentation is critical for approval", 
            "Fixed-rate debenture provides long-term payment stability",
            "Real estate ownership creates equity for future expansion"
          ]
        },
        {
          title: "Manufacturing Company 7(a) Acquisition Loan",
          company: "Precision Parts Acquisition",
          situation: "Experienced manufacturing executive wants to acquire established competitor for $850K. Strong industry knowledge but limited liquidity for down payment.",
          challenge: "SBA requires significant owner equity injection, seller financing coordination, business valuation support, and comprehensive due diligence within tight timeline.",
          solution: "Structured $680K SBA 7(a) loan with 20% down payment ($170K). Negotiated seller note for portion of equity requirement. Completed thorough quality of earnings analysis and environmental assessment.",
          outcome: "Successfully acquired company and integrated operations within 90 days. Combined entity achieved 25% cost savings through operational synergies. SBA guarantee enabled 85% financing with competitive terms.",
          lessonsLearned: [
            "SBA acquisition loans require extensive due diligence",
            "Seller financing can supplement buyer equity requirements",
            "Industry experience is crucial for SBA approval",
            "Integration planning should begin during due diligence"
          ]
        }
      ],
      scripts: [
        {
          title: "SBA Loan Application Consultation",
          scenario: "Initial meeting with business owner interested in SBA financing options",
          dialogues: [
            {
              speaker: "SBA Lender",
              text: "I understand you're interested in SBA financing. Let's start by understanding your business and financing needs to determine which SBA program might fit best."
            },
            {
              speaker: "Business Owner",
              text: "We need $400K for equipment and working capital. I heard SBA loans have better terms than conventional loans."
            },
            {
              speaker: "SBA Lender", 
              text: "SBA loans can offer longer terms and lower down payments. First, let's verify you meet SBA size standards. What's your annual revenue and employee count?"
            },
            {
              speaker: "Business Owner",
              text: "We do about $2.5 million annually with 18 employees. We're in manufacturing."
            },
            {
              speaker: "SBA Lender",
              text: "Perfect, you're well within SBA size standards for manufacturing. For your needs, we'd likely look at the 7(a) program. The SBA guarantee allows us to offer 90% financing with up to 10-year terms for equipment."
            },
            {
              speaker: "Business Owner",
              text: "What's the process like? I've heard SBA loans take forever."
            },
            {
              speaker: "SBA Lender",
              text: "While SBA loans do require more documentation than conventional loans, we can typically close within 45-60 days. The key is having your financial statements, tax returns, and business plan ready upfront."
            }
          ],
          keyPoints: [
            "Verify SBA eligibility early in the conversation",
            "Match SBA program to specific financing needs",
            "Set realistic expectations about timeline and documentation",
            "Emphasize benefits: lower down payment, longer terms, competitive rates"
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
      videos: [
        {
          title: "Commercial Term Loans & Underwriting",
          description: "Understanding traditional term loan structures and bank underwriting",
          duration: "34:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Lines of Credit & Working Capital Solutions",
          description: "Revolving credit facilities and managing business cash flow",
          duration: "27:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Equipment Financing Strategies",
          description: "Financing business equipment and machinery purchases",
          duration: "23:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Commercial Real Estate Lending",
          description: "CRE loan structures, LTV ratios, and DSCR requirements",
          duration: "31:20",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Distribution Company Warehouse Acquisition",
          company: "Atlantic Logistics Partners",
          situation: "Growing distribution company operating from leased facilities for 8 years. Found ideal warehouse for purchase at $2.1M. Strong cash flows but limited liquid assets for large down payment.",
          challenge: "Needed to structure commercial real estate financing with acceptable loan-to-value ratio, meet debt service coverage requirements, coordinate with seller's timeline, and maintain working capital for operations.",
          solution: "Structured 75% LTV commercial mortgage ($1.575M) with 25-year amortization and 7-year balloon. Required 1.35x debt service coverage ratio. Negotiated 60-day closing to accommodate due diligence.",
          outcome: "Successfully purchased and occupied facility. Eliminated $18K monthly rent payments. Property appreciated 12% annually. Used equity buildup to finance expansion into adjacent markets.",
          lessonsLearned: [
            "Owner-occupied CRE provides stability and equity building",
            "DSCR requirements must account for rent savings in occupied properties",
            "Balloon payment structure requires refinancing planning",
            "Real estate equity becomes valuable collateral for future growth"
          ]
        },
        {
          title: "Equipment Financing for Manufacturing Expansion", 
          company: "Precision Machining Solutions",
          situation: "Job shop manufacturer with strong order backlog needs $750K for new CNC equipment to meet demand. Equipment will increase capacity by 40% and improve margins through automation.",
          challenge: "Large equipment purchase relative to company size, technology obsolescence risk, seasonal cash flow patterns affecting debt service, and need to maintain working capital during expansion.",
          solution: "Structured equipment term loan matching 7-year useful life with seasonal payment adjustments. Equipment serves as primary collateral. Included technology upgrade provision for early refinancing.",
          outcome: "Installed equipment ahead of schedule, achieved 35% capacity increase and 8% margin improvement. Seasonal payment structure managed cash flow effectively. Early technology upgrade option proved valuable after 4 years.",
          lessonsLearned: [
            "Match loan terms to equipment useful life and business cash flows",
            "Technology provisions important for rapidly evolving equipment",
            "Seasonal payment structures accommodate cyclical businesses",
            "Equipment financing enables growth that creates additional debt capacity"
          ]
        }
      ],
      scripts: [
        {
          title: "Commercial Real Estate Loan Structuring",
          scenario: "Discussing CRE loan structure and requirements with business owner",
          dialogues: [
            {
              speaker: "Commercial Lender",
              text: "Let's discuss structuring your commercial real estate purchase. The property is listed at $1.8M - what's your intended use and down payment capability?"
            },
            {
              speaker: "Business Owner",
              text: "We'll occupy 100% as our headquarters and warehouse. We can put down about $300K, maybe $350K if needed."
            },
            {
              speaker: "Commercial Lender",
              text: "That's about 17-19% down. For owner-occupied properties, we typically require 20-25% down. The good news is owner-occupied rates are more favorable than investment property."
            },
            {
              speaker: "Business Owner",
              text: "What about the debt service coverage ratio? Our rent is currently $12K monthly."
            },
            {
              speaker: "Commercial Lender", 
              text: "Excellent point. We'll add back your current rent when calculating DSCR since you'll save that expense. With your cash flow plus rent savings, you should easily meet our 1.25x minimum coverage requirement."
            }
          ],
          keyPoints: [
            "Owner-occupied properties have different LTV and rate structures",
            "Include rent savings in debt service coverage calculations",
            "Minimum down payment requirements vary by property type",
            "Emphasize equity building benefits of ownership vs leasing"
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
      videos: [
        {
          title: "Bridge Loan Fundamentals",
          description: "When and how to use bridge financing for business transactions",
          duration: "21:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Asset-Based Lending Strategies",
          description: "Using receivables and inventory as collateral for flexible financing",
          duration: "28:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Invoice Factoring & Cash Flow Solutions",
          description: "Converting receivables to immediate cash flow",
          duration: "18:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Real Estate Development Bridge Financing",
          company: "Sunrise Commercial Development",
          situation: "Experienced developer secured contract to purchase prime commercial lot for $2M and build retail center. Needs bridge financing to close on land while securing permanent construction financing.",
          challenge: "Tight closing timeline (30 days), need for quick approval, higher risk profile of development project, exit strategy coordination with permanent lender, and market timing concerns.",
          solution: "Structured 18-month bridge loan at 65% LTV ($1.3M) with interest-only payments. Required detailed exit strategy with commitment letter from permanent construction lender. Personal guarantees from principals.",
          outcome: "Closed land purchase on time, secured permanent construction financing within 12 months. Project completed successfully and leased to national tenants. Developer refinanced bridge loan 2 months early.",
          lessonsLearned: [
            "Bridge loans require clear and documented exit strategies", 
            "Development projects need experienced borrowers with track records",
            "Market timing risk must be carefully evaluated and priced",
            "Strong permanent lender relationships crucial for takeout financing"
          ]
        },
        {
          title: "Asset-Based Lending for Rapid Growth",
          company: "TechDistribution Inc",
          situation: "Technology distributor experiencing 200% annual growth but struggling with cash flow timing. Traditional bank credit insufficient for inventory financing needs during rapid expansion.",
          challenge: "Volatile inventory levels, diverse product mix with different turn rates, accounts receivable concentrated among few large customers, and need for flexible credit facility.",
          solution: "Structured $500K asset-based line of credit with 80% advance on eligible A/R and 50% on qualified inventory. Monthly borrowing base certificates and quarterly field examinations. Sublimit controls by customer concentration.",
          outcome: "Enabled company to support growth without dilutive equity financing. Maintained vendor relationships through improved payment terms. Company eventually graduated to traditional credit facilities as cash flows stabilized.",
          lessonsLearned: [
            "Asset-based lending suits companies with strong assets but weak cash flows",
            "Regular monitoring and reporting requirements justify higher pricing",
            "Borrowing base calculations must reflect real-time asset quality",
            "ABL can bridge to conventional financing as companies mature"
          ]
        }
      ],
      scripts: [
        {
          title: "Bridge Loan Risk Assessment Discussion",
          scenario: "Evaluating bridge loan request and explaining risk factors and pricing",
          dialogues: [
            {
              speaker: "Bridge Lender", 
              text: "I understand you need bridge financing to close on this property. Let's discuss the risk factors that affect our pricing and structure."
            },
            {
              speaker: "Real Estate Investor",
              text: "I have a solid track record and clear exit strategy. Why are bridge loan rates so much higher than traditional financing?"
            },
            {
              speaker: "Bridge Lender",
              text: "Bridge loans carry higher risk due to shorter terms and transition nature. We're pricing for speed, flexibility, and the possibility that your exit strategy might be delayed."
            },
            {
              speaker: "Real Estate Investor", 
              text: "My permanent lender has already issued a commitment letter. Doesn't that reduce the risk?"
            },
            {
              speaker: "Bridge Lender",
              text: "It absolutely helps, and we've factored that into our pricing. However, we still need to underwrite as if we might need to hold the loan longer. That's why we require detailed backup exit strategies."
            }
          ],
          keyPoints: [
            "Bridge loan pricing reflects speed, flexibility, and transition risk",
            "Strong exit strategies improve terms but don't eliminate risk premiums",
            "Backup exit plans required in case primary strategy fails",
            "Track record and experience significantly impact approval and pricing"
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
      videos: [
        {
          title: "Merchant Cash Advances Explained",
          description: "Understanding MCA structure, costs, and appropriate use cases",
          duration: "24:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Revenue-Based Financing for Growth",
          description: "Equity-free growth capital tied to business performance",
          duration: "19:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "P2P Lending & Online Platforms",
          description: "Navigating peer-to-peer and marketplace lending options",
          duration: "26:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Alternative Credit Scoring & Fintech",
          description: "How technology is changing business lending decisions",
          duration: "22:40",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Restaurant MCA During COVID Recovery",
          company: "Downtown Café Group",
          situation: "Restaurant group with 3 locations struggling with inconsistent cash flows during COVID recovery. Traditional lenders hesitant due to industry volatility. Need $150K for equipment repairs and marketing push.",
          challenge: "Inconsistent revenue patterns, high industry risk perception, limited collateral, urgent timing for summer season preparation, and difficulty projecting stable cash flows for traditional underwriting.",
          solution: "Merchant cash advance based on credit card processing history. $150K advance with 1.35 factor rate and 15% holdback on daily credit card sales. No personal guarantees required.",
          outcome: "Obtained funding within 5 days, completed equipment repairs before peak season. Aggressive marketing campaign increased sales 40%. Repaid MCA in 14 months despite initial 18-month projection.",
          lessonsLearned: [
            "MCAs provide speed when timing is critical for seasonal businesses",
            "Factor rates vs APR calculations help borrowers understand true costs",
            "Daily holdback percentage must align with seasonal cash flow patterns",
            "Alternative financing bridges gap when traditional lending unavailable"
          ]
        },
        {
          title: "SaaS Company Revenue-Based Financing",
          company: "CloudFlow Analytics",
          situation: "B2B software company with $2M ARR growing at 15% monthly. Needs $500K for sales team expansion but wants to avoid equity dilution. Consistent monthly recurring revenue provides predictable cash flows.",
          challenge: "Limited assets for traditional collateral, high growth masking current profitability, preference to avoid equity dilution, and need for flexible repayment tied to business performance.",
          solution: "Revenue-based financing with 6% of monthly revenue repayment until 1.8x loan amount ($900K) is reached. No personal guarantees, minimal covenants, 24-month expected term.",
          outcome: "Funded expansion of sales team from 5 to 12 reps. ARR increased to $4.2M within 18 months. Repaid RBF in 20 months and secured traditional credit facilities based on improved financial profile.",
          lessonsLearned: [
            "RBF aligns lender and borrower interests through revenue sharing",
            "Predictable recurring revenue streams ideal for RBF structures",
            "Flexible repayment reduces cash flow stress during growth phases",
            "RBF can bridge to traditional financing as companies mature"
          ]
        }
      ],
      scripts: [
        {
          title: "Explaining MCA Terms and Costs",
          scenario: "Educating business owner about merchant cash advance structure and costs",
          dialogues: [
            {
              speaker: "Alternative Lender",
              text: "Let me explain how our merchant cash advance works. We'll advance you $100K and collect $135K through your credit card sales - that's a 1.35 factor rate."
            },
            {
              speaker: "Business Owner",
              text: "So I'm paying $35K for $100K - that's 35% interest, right?"
            },
            {
              speaker: "Alternative Lender",
              text: "It's not quite the same as traditional interest. The 35% is the total cost regardless of how long repayment takes. If you repay faster through higher sales, your effective rate is higher. If it takes longer, the rate is lower."
            },
            {
              speaker: "Business Owner",
              text: "How does the daily collection work? What if I have a slow day?"
            },
            {
              speaker: "Alternative Lender", 
              text: "We take 18% of your daily credit card sales. If you process $1,000 in cards, we collect $180. On a $500 day, we collect $90. It automatically adjusts to your business flow, which is the main benefit for seasonal or variable businesses."
            }
          ],
          keyPoints: [
            "Factor rates are total cost, not annual percentage rates",
            "Daily collections fluctuate with business performance",
            "Faster repayment increases effective cost, slower decreases it",
            "Best suited for businesses with consistent card processing volume"
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
      videos: [
        {
          title: "Advanced Financial Statement Analysis",
          description: "Deep dive techniques for analyzing borrower financial health",
          duration: "42:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Cash Flow Modeling & Projections",
          description: "Building accurate cash flow models for credit decisions",
          duration: "38:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Industry Risk Analysis",
          description: "Evaluating sector-specific risks and market conditions",
          duration: "31:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Credit Scoring & Risk Models",
          description: "Modern credit scoring techniques and risk assessment tools",
          duration: "29:20",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Manufacturing Turnaround Credit Analysis",
          company: "Heritage Metal Works",
          situation: "Family-owned manufacturing company with 40-year history experiencing declining margins due to foreign competition. Seeks $1M credit facility to modernize equipment and streamline operations.",
          challenge: "Three consecutive years of declining profits, aging equipment affecting quality, increased competition from lower-cost imports, family succession planning uncertainties, and tight cash flows limiting investment capability.",
          solution: "Comprehensive 13-week cash flow analysis, industry benchmarking study, management assessment, and operational improvement plan. Structured credit facility with performance milestones and enhanced reporting requirements.",
          outcome: "Company invested in automation reducing labor costs 25%. Quality improvements won back key customers. EBITDA improved from $200K to $850K over 18 months. Successfully transitioned to next generation management.",
          lessonsLearned: [
            "Turnaround situations require operational analysis beyond financial metrics",
            "Management capability assessment crucial for distressed lending", 
            "Performance milestones protect lender while supporting borrower success",
            "Industry trends analysis helps predict future viability"
          ]
        },
        {
          title: "Retail Chain Expansion Risk Assessment",
          company: "Regional Home Goods Stores",
          situation: "Successful 12-store retail chain wants to expand into new metropolitan market with 8 new locations over 24 months. Requesting $3M credit facility to fund buildouts and inventory.",
          challenge: "Unproven market penetration strategy, significant capital requirements relative to current cash flows, execution risk of rapid expansion, competitive landscape analysis, and inventory management complexity.",
          solution: "Detailed market analysis of expansion area, store-level profitability modeling, phased funding approach tied to performance metrics, comprehensive competitive assessment, and inventory management system evaluation.",
          outcome: "Approved phased expansion with funding tied to same-store sales growth and new store performance. Successfully opened 6 stores in 18 months. Market penetration exceeded projections by 20%.",
          lessonsLearned: [
            "Expansion lending requires market analysis beyond financial statements",
            "Phased funding reduces risk while supporting growth objectives",
            "Same-store sales trends predict expansion success likelihood",
            "Management depth becomes critical during rapid growth phases"
          ]
        }
      ],
      scripts: [
        {
          title: "Credit Risk Assessment Interview",
          scenario: "Conducting detailed credit analysis interview with management team",
          dialogues: [
            {
              speaker: "Credit Analyst",
              text: "I'd like to understand your competitive position and market dynamics. Who are your main competitors and how do you differentiate your products?"
            },
            {
              speaker: "CEO",
              text: "We compete primarily on quality and service. Our main competitors are two national firms, but we've built strong relationships with regional customers over 20 years."
            },
            {
              speaker: "Credit Analyst",
              text: "That's valuable. How have market conditions affected your business over the past 3 years? I see some revenue volatility in your financials."
            },
            {
              speaker: "CFO",
              text: "2020 was tough due to supply chain issues, but we've recovered well. The volatility reflects some large project timing - our underlying customer base has been stable."
            },
            {
              speaker: "Credit Analyst",
              text: "Let's talk about this expansion plan. What gives you confidence you can execute successfully while maintaining current operations quality?"
            },
            {
              speaker: "CEO",
              text: "We've promoted our operations manager to VP and hired experienced regional managers. We're not trying to do this all at once - it's a carefully planned 18-month rollout."
            }
          ],
          keyPoints: [
            "Understand competitive positioning and differentiation strategy",
            "Analyze historical performance in context of market conditions",
            "Assess management depth and execution capability",
            "Evaluate expansion plans for reasonableness and timing"
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
      videos: [
        {
          title: "BSA/AML Fundamentals for Lenders",
          description: "Bank Secrecy Act and Anti-Money Laundering compliance requirements",
          duration: "33:45",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Fair Lending Laws & Practices",
          description: "Understanding ECOA, Fair Housing Act, and CRA requirements",
          duration: "29:30",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "UDAAP Prevention & Consumer Protection",
          description: "Avoiding unfair, deceptive, or abusive acts and practices",
          duration: "26:15",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Regulatory Examination Preparation",
          description: "Best practices for regulatory exams and audit readiness",
          duration: "24:20",
          videoType: "youtube",
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
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
      ],
      caseStudies: [
        {
          title: "Multi-State Bank BSA/AML Compliance Overhaul",
          company: "Community Bank Network",
          situation: "Regional bank with 25 branches across 3 states received regulatory criticism for inadequate BSA/AML program. Need comprehensive compliance program enhancement within 6 months to avoid enforcement action.",
          challenge: "Inconsistent procedures across branches, inadequate customer due diligence processes, poor suspicious activity monitoring, staff training deficiencies, and technology system limitations.",
          solution: "Implemented enterprise-wide BSA/AML compliance program including policy updates, enhanced customer due diligence procedures, automated monitoring systems, comprehensive staff training, and independent testing program.",
          outcome: "Passed follow-up regulatory examination with satisfactory ratings. Reduced false positive SAR alerts by 60% while increasing legitimate SAR filings. Enhanced customer onboarding process improved efficiency and compliance.",
          lessonsLearned: [
            "BSA/AML compliance requires enterprise-wide cultural commitment",
            "Technology solutions must balance automation with human oversight",
            "Regular training and testing essential for program effectiveness",
            "Independent compliance testing provides valuable program validation"
          ]
        },
        {
          title: "Fair Lending Remediation Program",
          company: "Metro Community Bank", 
          situation: "Community bank's internal fair lending analysis revealed potential pricing disparities for minority-owned small businesses. Proactive remediation needed to address concerns before regulatory examination.",
          challenge: "Statistical analysis showing rate disparities, need to determine legitimate business justifications, customer communication about remediation, staff retraining requirements, and ongoing monitoring system implementation.",
          solution: "Comprehensive loan file review to identify legitimate business factors, customer outreach program for affected borrowers, enhanced pricing policies and procedures, staff training on prohibited basis factors, and statistical monitoring system.",
          outcome: "Remediated 47 loans totaling $180K in rate adjustments and fee refunds. Implemented robust fair lending monitoring preventing future issues. Received commendable rating on fair lending during next examination.",
          lessonsLearned: [
            "Proactive fair lending monitoring prevents regulatory issues",
            "Legitimate business justifications must be clearly documented",
            "Customer remediation requires careful communication and execution",
            "Statistical monitoring tools essential for ongoing compliance"
          ]
        }
      ],
      scripts: [
        {
          title: "BSA/AML Customer Due Diligence Interview",
          scenario: "Conducting enhanced due diligence for higher-risk commercial customer",
          dialogues: [
            {
              speaker: "Compliance Officer",
              text: "Thank you for meeting with me today. As part of our BSA compliance program, I need to ask some additional questions about your business operations."
            },
            {
              speaker: "Business Owner",
              text: "Of course. I understand you need to be careful about money laundering and such. What do you need to know?"
            },
            {
              speaker: "Compliance Officer",
              text: "Let's start with your customer base. Can you describe the types of customers you serve and the geographic areas where you do business?"
            },
            {
              speaker: "Business Owner",
              text: "We serve primarily commercial contractors in the tri-state area. Most payments are by check, though we do get some cash payments for smaller jobs."
            },
            {
              speaker: "Compliance Officer",
              text: "That's helpful. Regarding the cash payments, what's the typical transaction size and frequency? Do you have any customers who pay unusually large amounts in cash?"
            },
            {
              speaker: "Business Owner", 
              text: "Cash payments are usually under $500, mostly for emergency repairs. We do have one customer who pays cash monthly around $2,000, but he's been with us for years and owns several rental properties."
            },
            {
              speaker: "Compliance Officer",
              text: "I appreciate that detail. Can you provide documentation for that customer relationship? We'll need to maintain records of higher-risk relationships for our compliance files."
            }
          ],
          keyPoints: [
            "Enhanced due diligence requires detailed business operation understanding",
            "Focus on cash transaction patterns and unusual payment methods",
            "Document customer relationships that present higher risk profiles", 
            "Maintain comprehensive records for regulatory examination purposes"
          ]
        }
      ]
    }
  ]
};

export const statsData = [
  {
    icon: "CheckCircle",
    title: "Modules Completed",
    value: "2",
    subtitle: "of 8 modules",
    trend: "+1 this week"
  },
  {
    icon: "Clock",
    title: "Learning Time",
    value: "12.5h",
    subtitle: "total logged",
    trend: "+2.5h this week"
  },
  {
    icon: "Target",
    title: "Current Streak",
    value: "7 days",
    subtitle: "learning streak",
    trend: "Keep it up!"
  },
  {
    icon: "TrendingUp",
    title: "Progress Score",
    value: "85%",
    subtitle: "completion rate",
    trend: "+5% improvement"
  }
];