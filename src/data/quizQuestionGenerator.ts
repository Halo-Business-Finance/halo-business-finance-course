import { QuizQuestion } from './courseData';

// Generate 7 unique quiz questions based on course type and difficulty level
export const generateQuizQuestions = (
  courseType: string,
  moduleIndex: number,
  level: "beginner" | "expert"
): QuizQuestion[] => {
  // Create course-specific question templates
  const getQuestionsForCourse = (): QuizQuestion[] => {
    const baseQuestions: QuizQuestion[] = [];
    
    switch (courseType.toLowerCase()) {
      case 'sba 7(a)':
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the maximum SBA 7(a) loan amount?",
              options: ["$1 million", "$3 million", "$5 million", "$10 million"],
              correctAnswer: 2,
              explanation: "The maximum SBA 7(a) loan amount is $5 million."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What percentage of the loan does the SBA typically guarantee?",
              options: ["50%", "75%", "85%", "100%"],
              correctAnswer: 2,
              explanation: "The SBA typically guarantees up to 85% of loans up to $150,000 and 75% of loans over $150,000."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is the minimum credit score typically required for SBA 7(a) loans?",
              options: ["580", "620", "680", "720"],
              correctAnswer: 2,
              explanation: "Most lenders require a minimum credit score of 680 for SBA 7(a) loans."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "How long can the repayment term be for SBA 7(a) real estate loans?",
              options: ["10 years", "15 years", "20 years", "25 years"],
              correctAnswer: 3,
              explanation: "SBA 7(a) real estate loans can have repayment terms up to 25 years."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What type of businesses are eligible for SBA 7(a) loans?",
              options: ["Only retail businesses", "Only manufacturing", "For-profit businesses", "Any type of business"],
              correctAnswer: 2,
              explanation: "SBA 7(a) loans are available to for-profit businesses that meet SBA size standards."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is the primary use of SBA 7(a) loan proceeds?",
              options: ["Only equipment", "Only real estate", "Working capital and expansion", "Only inventory"],
              correctAnswer: 2,
              explanation: "SBA 7(a) loans can be used for working capital, expansion, equipment, real estate, and more."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What document is required to apply for an SBA 7(a) loan?",
              options: ["Only tax returns", "Business plan and financials", "Only bank statements", "Only personal credit report"],
              correctAnswer: 1,
              explanation: "A comprehensive business plan and financial statements are required for SBA 7(a) applications."
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the SBA Express loan maximum and its unique feature?",
              options: ["$350,000 with 36-hour approval", "$500,000 with 24-hour approval", "$350,000 with same-day approval", "$500,000 with 36-hour approval"],
              correctAnswer: 3,
              explanation: "SBA Express loans offer up to $500,000 with 36-hour turnaround on credit decisions."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "How does the SBA 7(a) Small Loan program differ from standard 7(a)?",
              options: ["Lower rates only", "Simplified application for loans under $350,000", "No collateral required ever", "Faster approval only"],
              correctAnswer: 1,
              explanation: "The Small Loan program offers simplified application and processing for loans up to $350,000."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is the debt service coverage ratio (DSCR) typically required for SBA 7(a)?",
              options: ["1.0x", "1.15x", "1.25x", "1.5x"],
              correctAnswer: 2,
              explanation: "Most SBA lenders require a minimum DSCR of 1.25x for loan approval."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "Which industries have special SBA 7(a) considerations?",
              options: ["Farms and agricultural businesses", "Cannabis-related businesses", "Investment companies", "All of the above"],
              correctAnswer: 3,
              explanation: "All these industries have special considerations or restrictions for SBA 7(a) eligibility."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What is the SBA guaranty fee structure for loans over $1 million?",
              options: ["2% flat fee", "3.5% flat fee", "3.5% on guaranteed portion up to $1M + 3.75% on amount over $1M", "4% flat fee"],
              correctAnswer: 2,
              explanation: "For loans over $1M, the fee is 3.5% on the first $1M of guaranteed portion plus 3.75% on amounts exceeding $1M."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "How are SBA 7(a) loans typically sold in the secondary market?",
              options: ["Whole loan sales only", "Guaranteed portion only", "Unguaranteed portion only", "Cannot be sold"],
              correctAnswer: 1,
              explanation: "The guaranteed portion of SBA 7(a) loans can be sold in the secondary market, providing liquidity to lenders."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What is the impact of personal resources on SBA 7(a) eligibility?",
              options: ["No impact", "Must inject 10% equity", "Cannot have liquid assets over $500,000", "Must exhaust all personal resources"],
              correctAnswer: 2,
              explanation: "Borrowers with excessive personal liquid assets (typically over $500,000) may not qualify for SBA assistance."
            }
          );
        }
        break;
        
      case 'sba express':
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the maximum loan amount for SBA Express loans?",
              options: ["$250,000", "$350,000", "$500,000", "$750,000"],
              correctAnswer: 2,
              explanation: "SBA Express loans have a maximum amount of $500,000."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is the key advantage of SBA Express loans?",
              options: ["Lower interest rates", "36-hour credit decision", "No collateral required", "100% guarantee"],
              correctAnswer: 1,
              explanation: "SBA Express loans provide credit decisions within 36 hours."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What percentage does the SBA guarantee on Express loans?",
              options: ["50%", "75%", "85%", "90%"],
              correctAnswer: 0,
              explanation: "The SBA guarantees 50% of SBA Express loans."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "Can SBA Express loans be used for working capital?",
              options: ["No, only equipment", "No, only real estate", "Yes, including working capital", "Only for refinancing"],
              correctAnswer: 2,
              explanation: "SBA Express loans can be used for working capital, equipment, and real estate."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What is the typical interest rate structure for SBA Express?",
              options: ["Fixed only", "Variable only", "Lender determines fixed or variable", "Always prime + 2%"],
              correctAnswer: 2,
              explanation: "Lenders can offer either fixed or variable rates on SBA Express loans."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "Is collateral required for all SBA Express loans?",
              options: ["Yes, always", "No, not for loans under $25,000", "No, not for loans under $50,000", "Never required"],
              correctAnswer: 1,
              explanation: "Collateral is not required for SBA Express loans of $25,000 or less."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "Can startups qualify for SBA Express loans?",
              options: ["No, 2 years minimum required", "Yes, with strong business plan", "No, 5 years minimum required", "Only tech startups"],
              correctAnswer: 1,
              explanation: "Startups can qualify for SBA Express with a strong business plan and adequate capital."
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "How do SBA Express revolving lines of credit work?",
              options: ["7-year term max", "10-year term max", "Up to 7 years with 5-year maturity", "No term limit"],
              correctAnswer: 2,
              explanation: "SBA Express lines of credit can have terms up to 7 years, typically with 5-year maturity periods."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is the maximum interest rate spread over prime for Express loans over $50,000?",
              options: ["Prime + 4.5%", "Prime + 6.5%", "Prime + 8.5%", "No maximum"],
              correctAnswer: 1,
              explanation: "For SBA Express loans over $50,000, the maximum rate is Prime + 6.5%."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "How does Export Express differ from standard Express loans?",
              options: ["Higher guarantee percentage", "Lower interest rates", "90% guarantee for export development", "Longer terms"],
              correctAnswer: 2,
              explanation: "Export Express offers 90% SBA guarantee for export development activities."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What are allowable uses of Express line of credit proceeds?",
              options: ["Working capital only", "Short-term needs and cyclical financing", "Equipment only", "Real estate only"],
              correctAnswer: 1,
              explanation: "Express credit lines are for short-term, cyclical, and working capital needs."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What is the SBA Express Pilot Program enhancement?",
              options: ["Increased to $1 million", "Reduced fees", "Increased to $500,000 from $350,000", "24-hour approval"],
              correctAnswer: 2,
              explanation: "The Express Pilot Program increased the maximum from $350,000 to $500,000."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "How are SBA Express loans underwritten differently?",
              options: ["SBA reviews all applications", "Lenders use their own procedures", "Standardized SBA process", "Third-party underwriting required"],
              correctAnswer: 1,
              explanation: "Express lenders use their own underwriting procedures and documentation."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What is the prepayment penalty structure for SBA Express?",
              options: ["5% in year 1", "3% for first 3 years", "No prepayment penalties", "Lender determined"],
              correctAnswer: 2,
              explanation: "SBA Express loans have no prepayment penalties."
            }
          );
        }
        break;
        
      case 'sba 504':
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the typical structure of an SBA 504 loan?",
              options: ["100% SBA financing", "50% bank, 50% SBA", "50% bank, 40% SBA, 10% borrower", "33% each from bank, SBA, borrower"],
              correctAnswer: 2,
              explanation: "SBA 504 typically involves 50% bank financing, 40% SBA debenture, and 10% borrower down payment."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is the primary purpose of SBA 504 loans?",
              options: ["Working capital", "Real estate and equipment", "Inventory only", "Debt refinancing only"],
              correctAnswer: 1,
              explanation: "SBA 504 loans are designed for real estate and long-term equipment purchases."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is a Certified Development Company (CDC)?",
              options: ["A construction company", "A real estate broker", "A non-profit SBA partner", "A bank subsidiary"],
              correctAnswer: 2,
              explanation: "CDCs are non-profit organizations certified by the SBA to provide 504 loans."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What is the maximum SBA debenture for regular 504 projects?",
              options: ["$2.5 million", "$5 million", "$5.5 million", "$10 million"],
              correctAnswer: 1,
              explanation: "The maximum SBA debenture for regular 504 projects is $5 million."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "How long are typical 504 loan terms for real estate?",
              options: ["10 years", "15 years", "20 years", "25 years"],
              correctAnswer: 2,
              explanation: "SBA 504 real estate loans typically have 20-year terms."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is the job creation requirement for 504 loans?",
              options: ["1 job per $50,000", "1 job per $65,000", "1 job per $75,000", "No requirement"],
              correctAnswer: 2,
              explanation: "504 loans typically require creating or retaining 1 job per $75,000 of SBA debenture."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "Can 504 loans be used for refinancing?",
              options: ["Never", "Yes, under certain conditions", "Only for SBA loans", "Only for real estate"],
              correctAnswer: 1,
              explanation: "504 loans can be used for refinancing under specific conditions with substantial benefit to the borrower."
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What are the public policy goals that can increase 504 debenture limits?",
              options: ["Energy efficiency only", "Manufacturing only", "Multiple goals including energy, exports, rural development", "Job creation only"],
              correctAnswer: 2,
              explanation: "Meeting public policy goals like energy efficiency, manufacturing, or rural development can increase limits to $5.5 million."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "How is the 504 debenture interest rate determined?",
              options: ["Prime + spread", "Fixed by SBA", "Based on debenture sale to investors", "Bank determines"],
              correctAnswer: 2,
              explanation: "504 debenture rates are based on the sale of debentures to private investors in the capital markets."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is the occupancy requirement for 504 real estate projects?",
              options: ["25% owner-occupied", "51% owner-occupied", "75% owner-occupied", "100% owner-occupied"],
              correctAnswer: 1,
              explanation: "For existing buildings, the business must occupy 51% immediately; for new construction, 60% planned occupancy."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What is the 504 refinancing with expansion provision?",
              options: ["No expansion allowed", "10% expansion minimum", "20% expansion minimum", "50% expansion required"],
              correctAnswer: 2,
              explanation: "504 refinancing with expansion requires the expansion to be at least 20% of the market value."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "How are 504 loans secured?",
              options: ["Unsecured", "First lien on bank portion only", "Second lien on project assets", "Personal guarantee only"],
              correctAnswer: 2,
              explanation: "The SBA takes a second lien position on project assets, with the bank holding the first lien."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is the debt service coverage requirement for 504 projects?",
              options: ["1.0x minimum", "1.15x minimum", "1.25x minimum", "1.5x minimum"],
              correctAnswer: 2,
              explanation: "Most 504 projects require a minimum debt service coverage ratio of 1.25x."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What are eligible soft costs in 504 financing?",
              options: ["Only appraisal fees", "Professional fees, permits, surveys, environmental reports", "Only construction interest", "Soft costs not eligible"],
              correctAnswer: 1,
              explanation: "Eligible soft costs include professional fees, permits, surveys, impact fees, and environmental reports."
            }
          );
        }
        break;

      case 'commercial real estate':
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the typical loan-to-value (LTV) ratio for commercial real estate?",
              options: ["50-60%", "65-75%", "80-90%", "95-100%"],
              correctAnswer: 1,
              explanation: "Commercial real estate loans typically have LTV ratios between 65-75%."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is a cap rate in commercial real estate?",
              options: ["Interest rate cap", "Net operating income divided by property value", "Maximum loan amount", "Property tax rate"],
              correctAnswer: 1,
              explanation: "Capitalization rate (cap rate) is the NOI divided by the property value or purchase price."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is a triple net lease (NNN)?",
              options: ["Tenant pays rent only", "Tenant pays rent plus utilities", "Tenant pays rent, taxes, insurance, and maintenance", "Landlord pays everything"],
              correctAnswer: 2,
              explanation: "In a triple net lease, the tenant pays rent plus property taxes, insurance, and maintenance."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What property types are considered commercial real estate?",
              options: ["Single-family homes only", "Office, retail, industrial, multifamily", "Only office buildings", "Only shopping centers"],
              correctAnswer: 1,
              explanation: "Commercial real estate includes office, retail, industrial, multifamily, and other income-producing properties."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What is the typical term for a commercial real estate loan?",
              options: ["1-3 years", "5-10 years", "15-30 years", "40-50 years"],
              correctAnswer: 1,
              explanation: "Commercial real estate loans typically have terms of 5-10 years with longer amortization periods."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is DSCR in commercial real estate lending?",
              options: ["Down payment requirement", "Debt service coverage ratio", "Default security charge rate", "Development site coverage ratio"],
              correctAnswer: 1,
              explanation: "DSCR (Debt Service Coverage Ratio) measures a property's ability to cover its debt payments."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What is a balloon payment in commercial real estate?",
              options: ["Initial down payment", "Monthly payment", "Large final payment at loan maturity", "Prepayment penalty"],
              correctAnswer: 2,
              explanation: "A balloon payment is a large lump sum payment due at the end of the loan term."
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "How do you calculate the debt yield ratio?",
              options: ["NOI / Total debt", "Total debt / NOI", "NOI / Property value", "DSCR x Cap rate"],
              correctAnswer: 0,
              explanation: "Debt yield is calculated as Net Operating Income divided by the total loan amount."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is a non-recourse carve-out in CRE lending?",
              options: ["Full personal guarantee", "No recourse ever", "Exceptions for bad acts and environmental issues", "Partial recourse only"],
              correctAnswer: 2,
              explanation: "Non-recourse carve-outs create personal liability for specific bad acts, fraud, or environmental violations."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is the waterfall structure in CRE syndication?",
              options: ["Payment priority structure", "Environmental assessment", "Construction phases", "Property management hierarchy"],
              correctAnswer: 0,
              explanation: "A waterfall structure defines the priority and order of distributions to different investor classes."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "How do interest-only periods affect CRE loan structuring?",
              options: ["No effect on cash flow", "Improves initial DSCR", "Increases total interest cost", "Both B and C"],
              correctAnswer: 3,
              explanation: "Interest-only periods improve initial DSCR but increase total interest costs over the loan life."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What is a defeasance in commercial real estate?",
              options: ["Default provision", "Prepayment method using securities", "Lease termination", "Property transfer"],
              correctAnswer: 1,
              explanation: "Defeasance is a prepayment method where the borrower substitutes securities for the real estate collateral."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What are typical stress test parameters for CRE underwriting?",
              options: ["5% vacancy increase only", "10% income reduction only", "Vacancy increase, rate increase, income reduction", "No stress testing required"],
              correctAnswer: 2,
              explanation: "Comprehensive stress testing includes vacancy increases, interest rate rises, and income reductions."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "How do CMBS loans differ from bank portfolio loans?",
              options: ["No differences", "CMBS has stricter prepayment terms and are securitized", "Bank loans always cheaper", "CMBS requires no documentation"],
              correctAnswer: 1,
              explanation: "CMBS loans are securitized and sold to investors, with strict prepayment penalties and servicing requirements."
            }
          );
        }
        break;

      case 'equipment financing':
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is the typical down payment for equipment financing?",
              options: ["0-10%", "10-20%", "30-40%", "50% minimum"],
              correctAnswer: 1,
              explanation: "Equipment financing typically requires 10-20% down payment."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "What is the difference between equipment loans and leases?",
              options: ["No difference", "Loans transfer ownership, leases don't", "Leases are always cheaper", "Loans have no interest"],
              correctAnswer: 1,
              explanation: "Equipment loans result in ownership while leases provide use without ownership."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What factors determine equipment financing rates?",
              options: ["Credit score only", "Equipment type only", "Credit, equipment type, and useful life", "Random selection"],
              correctAnswer: 2,
              explanation: "Rates depend on credit score, equipment type, useful life, and down payment."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What is Section 179 deduction?",
              options: ["Interest deduction", "Immediate expensing of equipment", "Lease payment deduction", "Sales tax exemption"],
              correctAnswer: 1,
              explanation: "Section 179 allows businesses to immediately expense qualifying equipment purchases."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "What types of equipment are typically financed?",
              options: ["Only vehicles", "Only computers", "Manufacturing, medical, construction, technology", "Only office furniture"],
              correctAnswer: 2,
              explanation: "Equipment financing covers various types including manufacturing, medical, construction, and technology equipment."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is the typical term for equipment financing?",
              options: ["6 months", "2-7 years", "10-15 years", "20+ years"],
              correctAnswer: 1,
              explanation: "Equipment financing terms typically range from 2-7 years based on equipment life."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What happens to equipment at lease end?",
              options: ["Always returned", "Always purchased", "Options to return, purchase, or renew", "Automatically destroyed"],
              correctAnswer: 2,
              explanation: "At lease end, lessees typically can return equipment, purchase it, or renew the lease."
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: "What is a TRAC lease?",
              options: ["Technology lease only", "Terminal rental adjustment clause lease for vehicles", "Temporary rental agreement", "Trade and commerce lease"],
              correctAnswer: 1,
              explanation: "TRAC leases are Terminal Rental Adjustment Clause leases primarily used for vehicle financing."
            },
            {
              id: `q2-m${moduleIndex}`,
              question: "How does residual value affect lease structuring?",
              options: ["No impact", "Higher residual means lower payments", "Higher residual means higher payments", "Only affects purchase option"],
              correctAnswer: 1,
              explanation: "Higher residual values result in lower lease payments as less depreciation is financed."
            },
            {
              id: `q3-m${moduleIndex}`,
              question: "What is a sale-leaseback transaction?",
              options: ["Selling then buying equipment", "Selling owned equipment and leasing it back", "Leasing then selling", "Double lease structure"],
              correctAnswer: 1,
              explanation: "Sale-leaseback involves selling owned equipment to a lessor and immediately leasing it back."
            },
            {
              id: `q4-m${moduleIndex}`,
              question: "What are the accounting implications of capital vs operating leases?",
              options: ["No difference", "Capital leases go on balance sheet, operating don't under old rules", "Operating leases are always capitalized", "Neither affects balance sheet"],
              correctAnswer: 1,
              explanation: "Under previous accounting rules, capital leases appeared on balance sheet while operating leases didn't."
            },
            {
              id: `q5-m${moduleIndex}`,
              question: "How is equipment financing amortization typically structured?",
              options: ["Interest-only", "Level payments matching useful life", "Balloon payments only", "No structure needed"],
              correctAnswer: 1,
              explanation: "Equipment financing typically uses level payment amortization matching the equipment's useful life."
            },
            {
              id: `q6-m${moduleIndex}`,
              question: "What is cross-collateralization in equipment financing?",
              options: ["Multiple borrowers", "Multiple lenders", "Multiple pieces of equipment securing one loan", "International collateral"],
              correctAnswer: 2,
              explanation: "Cross-collateralization uses multiple equipment pieces as collateral for a single loan."
            },
            {
              id: `q7-m${moduleIndex}`,
              question: "What are typical advance rates for used equipment?",
              options: ["100% of value", "80-90% of value", "50-80% of value", "Never finance used equipment"],
              correctAnswer: 2,
              explanation: "Used equipment typically receives 50-80% advance rates depending on type, age, and condition."
            }
          );
        }
        break;

      default:
        // Generic business finance questions for other course types
        if (level === 'beginner') {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: `What is the primary purpose of ${courseType} financing?`,
              options: ["Personal use only", "Business operations and growth", "Tax avoidance", "Speculation only"],
              correctAnswer: 1,
              explanation: `${courseType} financing is designed to support business operations and growth.`
            },
            {
              id: `q2-m${moduleIndex}`,
              question: `What documentation is typically required for ${courseType}?`,
              options: ["No documentation", "Financial statements and business plan", "Only personal ID", "Verbal agreement only"],
              correctAnswer: 1,
              explanation: `${courseType} requires comprehensive documentation including financial statements and business plans.`
            },
            {
              id: `q3-m${moduleIndex}`,
              question: `What is the typical approval timeframe for ${courseType}?`,
              options: ["Same day", "2-4 weeks", "6 months", "1 year"],
              correctAnswer: 1,
              explanation: `${courseType} typically takes 2-4 weeks for approval and funding.`
            },
            {
              id: `q4-m${moduleIndex}`,
              question: `What credit score is typically required for ${courseType}?`,
              options: ["No credit check", "600+", "680+", "800+ only"],
              correctAnswer: 2,
              explanation: `Most ${courseType} programs require a minimum credit score of 680.`
            },
            {
              id: `q5-m${moduleIndex}`,
              question: `What is the role of collateral in ${courseType}?`,
              options: ["Never required", "Secures the loan and may reduce rates", "Only for decoration", "Increases interest rates"],
              correctAnswer: 1,
              explanation: `Collateral secures ${courseType} financing and can improve terms and rates.`
            },
            {
              id: `q6-m${moduleIndex}`,
              question: `How are interest rates determined for ${courseType}?`,
              options: ["Random selection", "Credit score, financials, and market conditions", "Fixed by government", "Always 10%"],
              correctAnswer: 1,
              explanation: `${courseType} rates are based on creditworthiness, financial strength, and market conditions.`
            },
            {
              id: `q7-m${moduleIndex}`,
              question: `What happens if a ${courseType} payment is missed?`,
              options: ["Nothing", "Late fees and potential default", "Automatic forgiveness", "Rate decreases"],
              correctAnswer: 1,
              explanation: `Missing ${courseType} payments results in late fees and can lead to default.`
            }
          );
        } else {
          baseQuestions.push(
            {
              id: `q1-m${moduleIndex}`,
              question: `What are key underwriting metrics for ${courseType}?`,
              options: ["Revenue only", "DSCR, DTI, and cash flow analysis", "Age of business only", "Number of employees only"],
              correctAnswer: 1,
              explanation: `${courseType} underwriting focuses on debt service coverage, debt-to-income, and cash flow strength.`
            },
            {
              id: `q2-m${moduleIndex}`,
              question: `How does ${courseType} fit in the capital stack?`,
              options: ["Always senior position", "Position varies by structure and risk", "Always subordinated", "Not part of capital stack"],
              correctAnswer: 1,
              explanation: `${courseType} position in the capital stack depends on structure, security, and risk profile.`
            },
            {
              id: `q3-m${moduleIndex}`,
              question: `What are common covenant requirements in ${courseType}?`,
              options: ["No covenants ever", "Financial reporting, ratios, and operational restrictions", "Only payment requirements", "Personal guarantees only"],
              correctAnswer: 1,
              explanation: `${courseType} typically includes financial reporting, ratio maintenance, and operational covenants.`
            },
            {
              id: `q4-m${moduleIndex}`,
              question: `How is ${courseType} priced in the secondary market?`,
              options: ["Face value always", "Based on credit quality, rate, and market conditions", "Random pricing", "Not tradeable"],
              correctAnswer: 1,
              explanation: `Secondary market pricing for ${courseType} depends on credit quality, interest rate, and market demand.`
            },
            {
              id: `q5-m${moduleIndex}`,
              question: `What are intercreditor considerations for ${courseType}?`,
              options: ["Not applicable", "Payment priority, subordination, and standstill provisions", "Only relevant for equity", "Automatic senior status"],
              correctAnswer: 1,
              explanation: `Intercreditor agreements for ${courseType} address payment priority, subordination, and enforcement rights.`
            },
            {
              id: `q6-m${moduleIndex}`,
              question: `What are typical portfolio concentration limits for ${courseType}?`,
              options: ["No limits", "15-25% per borrower/industry", "50% minimum", "100% acceptable"],
              correctAnswer: 1,
              explanation: `Portfolio management typically limits ${courseType} concentration to 15-25% per borrower or industry.`
            },
            {
              id: `q7-m${moduleIndex}`,
              question: `How are workouts structured for troubled ${courseType} loans?`,
              options: ["Immediate foreclosure only", "Forbearance, modification, or restructuring options", "No workout possible", "Automatic forgiveness"],
              correctAnswer: 1,
              explanation: `${courseType} workouts may include forbearance, payment modification, or debt restructuring.`
            }
          );
        }
        break;
    }
    
    return baseQuestions;
  };
  
  const questions = getQuestionsForCourse();
  
  // Ensure we have exactly 7 questions
  if (questions.length < 7) {
    // Add generic questions to fill up to 7
    for (let i = questions.length; i < 7; i++) {
      questions.push({
        id: `q${i + 1}-m${moduleIndex}`,
        question: `What is important to understand about ${courseType} in this module?`,
        options: [
          "Basic concepts only",
          "Comprehensive understanding of all aspects",
          "Nothing specific",
          "Advanced concepts only"
        ],
        correctAnswer: 1,
        explanation: `This module covers important aspects of ${courseType} that require comprehensive understanding.`
      });
    }
  }
  
  return questions.slice(0, 7); // Ensure exactly 7 questions
};

// Generate final test questions (more comprehensive)
export const generateFinalTestQuestions = (
  courseType: string,
  level: "beginner" | "expert"
): QuizQuestion[] => {
  const finalQuestions = generateQuizQuestions(courseType, 99, level); // Use module 99 for unique IDs
  
  // Modify questions to be more comprehensive for final test
  return finalQuestions.map((q, index) => ({
    ...q,
    id: `final-q${index + 1}`,
    question: `[Final Test] ${q.question}`,
    explanation: `${q.explanation} This is a comprehensive assessment question.`
  }));
};