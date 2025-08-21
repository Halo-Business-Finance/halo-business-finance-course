import { ChatMessage } from '@/services/openaiService';

// Mock responses for demonstration purposes
const MOCK_RESPONSES = {
  "How do I calculate cash flow for my business?": `
**Cash Flow Calculation for Your Business**

Cash flow measures the money moving in and out of your business. Here's how to calculate it:

**Operating Cash Flow Formula:**
Cash Flow = Total Cash Received - Total Cash Spent

**Key Components:**
1. **Cash Inflows:**
   - Sales revenue (actual cash received)
   - Investment income
   - Loan proceeds

2. **Cash Outflows:**
   - Operating expenses (rent, salaries, utilities)
   - Inventory purchases
   - Loan payments
   - Equipment purchases

**Three Types of Cash Flow:**
- **Operating:** Day-to-day business operations
- **Investing:** Equipment, property purchases/sales
- **Financing:** Loans, equity, dividends

**Best Practices:**
- Track cash flow monthly or weekly
- Maintain 3-6 months of expenses in reserves
- Use cash flow forecasting tools
- Monitor accounts receivable closely

Would you like me to explain any specific aspect in more detail?`,

  "What are the key components of a business plan?": `
**Essential Business Plan Components**

A comprehensive business plan should include:

**1. Executive Summary**
- Business concept overview
- Financial highlights
- Funding requirements

**2. Company Description**
- Mission and vision statements
- Business structure and ownership
- Location and facilities

**3. Market Analysis**
- Industry overview
- Target market identification
- Competitive analysis

**4. Organization & Management**
- Organizational structure
- Management team profiles
- Personnel plan

**5. Products/Services**
- Detailed descriptions
- Pricing strategy
- Development timeline

**6. Marketing & Sales Strategy**
- Marketing channels
- Sales strategy
- Customer acquisition plan

**7. Financial Projections**
- Income statements (3-5 years)
- Cash flow projections
- Balance sheets
- Break-even analysis

**8. Funding Request**
- Current funding requirements
- Future funding requirements
- Proposed use of funds

This roadmap helps secure funding and guides business growth!`,

  "What's the difference between debt and equity financing?": `
**Debt vs. Equity Financing**

**Debt Financing:**
✅ **Advantages:**
- Retain full ownership and control
- Tax-deductible interest payments
- Predictable payment schedule
- Builds business credit history

❌ **Disadvantages:**
- Personal guarantees often required
- Regular payments regardless of cash flow
- Potential collateral requirements

**Examples:** Bank loans, SBA loans, lines of credit, bonds

**Equity Financing:**
✅ **Advantages:**
- No repayment obligations
- Shared business risk
- Access to investor expertise/networks
- Funds available during tough times

❌ **Disadvantages:**
- Dilution of ownership
- Shared decision-making control
- Potentially expensive long-term
- Complex legal requirements

**Examples:** Angel investors, venture capital, selling stock

**Which to Choose?**
- **Debt:** When you want control and can handle payments
- **Equity:** When you need expertise and can't risk payments
- **Hybrid:** Many businesses use both strategically

The best choice depends on your business stage, growth plans, and risk tolerance!`,

  "How do SBA loans work?": `
**SBA Loans: Your Complete Guide**

The Small Business Administration (SBA) doesn't lend money directly but guarantees loans, reducing lender risk.

**Popular SBA Programs:**

**SBA 7(a) Loans:**
- Up to $5 million
- Working capital, equipment, real estate
- 7-25 year terms
- Competitive interest rates

**SBA 504 Loans:**
- Up to $5.5 million
- Real estate and equipment only
- Long-term, fixed-rate financing
- Requires 10% down payment

**SBA Microloans:**
- Up to $50,000
- Short-term needs
- Easier qualification requirements

**Key Benefits:**
- Lower down payments (10% vs 20-30%)
- Longer repayment terms
- Competitive interest rates
- Less collateral required

**Requirements:**
- For-profit business
- Size standards compliance
- Good credit score (typically 680+)
- Demonstrated ability to repay
- Owner investment required

**Process:**
1. Find SBA-approved lender
2. Submit application with financial documents
3. Lender review and SBA guarantee request
4. Loan approval and closing

SBA loans are excellent for established businesses needing growth capital!`
};

export class MockOpenAIService {
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      const response = MOCK_RESPONSES[lastMessage.content as keyof typeof MOCK_RESPONSES];
      if (response) {
        return response;
      }
    }
    
    // Default response for unmatched questions
    return `I'm your AI assistant for business finance! I can help you understand:

• Financial planning and analysis
• Business loans and SBA programs  
• Cash flow management
• Investment strategies
• Risk assessment
• Financial statements

Try asking me about specific topics like "How do I improve my credit score?" or "What's the difference between gross and net profit?"

*Note: This is a demo version. In production, I would be powered by ChatGPT to provide comprehensive answers to any business finance question.*`;
  }

  async sendQuickQuestion(question: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: question }
    ];
    
    return this.sendMessage(messages);
  }
}

export const mockOpenaiService = new MockOpenAIService();