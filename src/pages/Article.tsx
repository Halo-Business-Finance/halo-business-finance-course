import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import fintechProfessional from "@/assets/fintech-professional.jpg";
import creditAnalystProfessional from "@/assets/credit-analyst-professional.jpg";
import riskManagementProfessional from "@/assets/risk-management-professional.jpg";
import digitalTrainingProfessional from "@/assets/digital-training-professional.jpg";
import aiAnalyticsProfessional from "@/assets/ai-analytics-professional.jpg";
import microlearningProfessional from "@/assets/microlearning-professional.jpg";
import adaptiveLearningProfessional from "@/assets/adaptive-learning-professional.jpg";
import gamificationProfessional from "@/assets/gamification-professional.jpg";

const Article = () => {
  const { id } = useParams();
  
  const articles = {
    "1": {
      title: "The Future of Financial Technology in Commercial Lending",
      author: "Sarah Johnson",
      date: "2024-01-15",
      category: "Technology",
      readTime: "5 min read",
      image: fintechProfessional,
      content: `
        <p>The commercial lending landscape is experiencing a revolutionary transformation driven by cutting-edge financial technology. As traditional banking methods evolve, lenders are embracing innovative solutions that streamline processes, enhance risk assessment, and improve customer experiences.</p>

        <h2>Digital-First Lending Platforms</h2>
        <p>Modern lending platforms are integrating artificial intelligence and machine learning algorithms to automate underwriting processes. These systems can analyze vast amounts of data in real-time, providing more accurate risk assessments while reducing processing times from weeks to hours.</p>

        <h2>Blockchain and Smart Contracts</h2>
        <p>Blockchain technology is introducing unprecedented transparency and security to commercial lending. Smart contracts automatically execute loan agreements when predetermined conditions are met, reducing the need for intermediaries and minimizing operational costs.</p>

        <h2>Data Analytics and Predictive Modeling</h2>
        <p>Advanced analytics are enabling lenders to make more informed decisions by analyzing alternative data sources, including social media activity, transaction histories, and market trends. This comprehensive approach to data analysis is improving loan approval rates while reducing default risks.</p>

        <h2>The Impact on Financial Professionals</h2>
        <p>As technology continues to reshape the industry, commercial lending professionals must adapt their skills to remain competitive. Understanding these technological advances is crucial for career advancement and maintaining relevance in an increasingly digital marketplace.</p>

        <h2>Looking Ahead</h2>
        <p>The future of commercial lending lies in the seamless integration of human expertise with technological innovation. Professionals who embrace these changes and develop complementary skills will be best positioned to thrive in this evolving landscape.</p>
      `
    },
    "2": {
      title: "Essential Skills for Modern Credit Analysts",
      author: "Michael Chen",
      date: "2024-01-10",
      category: "Career Development",
      readTime: "8 min read",
      image: creditAnalystProfessional,
      content: `
        <p>The role of credit analysts has evolved significantly in recent years, demanding a sophisticated blend of traditional financial acumen and modern technological proficiency. Today's credit analysts must navigate an increasingly complex landscape of data sources, regulatory requirements, and market dynamics.</p>

        <h2>Core Financial Analysis Skills</h2>
        <p>Fundamental financial statement analysis remains the cornerstone of credit analysis. Analysts must demonstrate proficiency in interpreting balance sheets, income statements, and cash flow statements to assess borrower creditworthiness accurately.</p>

        <h2>Advanced Data Analytics</h2>
        <p>Modern credit analysts must be comfortable working with big data analytics tools and platforms. The ability to process and interpret large datasets, identify trends, and extract meaningful insights is increasingly valuable in today's data-driven lending environment.</p>

        <h2>Regulatory Knowledge and Compliance</h2>
        <p>Understanding regulatory frameworks such as Basel III, Dodd-Frank, and industry-specific compliance requirements is essential. Analysts must ensure that all credit decisions align with regulatory standards while maintaining competitive positioning.</p>

        <h2>Technology Proficiency</h2>
        <p>Familiarity with credit analysis software, loan origination systems, and risk management platforms is crucial. Many organizations are adopting sophisticated modeling tools that require technical competency to operate effectively.</p>

        <h2>Communication and Presentation Skills</h2>
        <p>The ability to clearly communicate complex financial concepts to stakeholders at various levels is invaluable. Credit analysts must be able to present their findings in compelling, actionable formats that support decision-making processes.</p>

        <h2>Continuous Learning and Adaptation</h2>
        <p>The financial services industry is constantly evolving, requiring analysts to stay current with market trends, regulatory changes, and technological advances. Commitment to ongoing professional development is essential for long-term success.</p>
      `
    },
    "3": {
      title: "Risk Management Best Practices for 2024",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-05",
      category: "Risk Management",
      readTime: "6 min read",
      image: riskManagementProfessional,
      content: `
        <p>As we navigate through 2024, risk management in commercial lending has become more sophisticated and critical than ever. The evolving economic landscape, regulatory environment, and technological advances have created new challenges and opportunities for risk professionals.</p>

        <h2>Integrated Risk Framework Development</h2>
        <p>Organizations are moving toward comprehensive risk frameworks that integrate credit, operational, market, and regulatory risks. This holistic approach enables better decision-making and more effective risk mitigation strategies across all business lines.</p>

        <h2>Real-Time Risk Monitoring</h2>
        <p>Advanced monitoring systems now provide real-time insights into portfolio performance and emerging risks. These systems utilize machine learning algorithms to identify patterns and anomalies that might indicate potential problems before they materialize.</p>

        <h2>Stress Testing and Scenario Analysis</h2>
        <p>Regular stress testing has become a cornerstone of effective risk management. Organizations are conducting more frequent and comprehensive scenario analyses to understand how their portfolios might perform under various economic conditions.</p>

        <h2>ESG Risk Integration</h2>
        <p>Environmental, Social, and Governance (ESG) factors are increasingly being integrated into risk assessment processes. Lenders are evaluating how ESG risks might impact borrower performance and portfolio resilience over time.</p>

        <h2>Cybersecurity and Operational Risk</h2>
        <p>With the increased digitization of lending processes, cybersecurity has become a critical component of operational risk management. Organizations must implement robust security measures to protect sensitive financial data and maintain customer trust.</p>

        <h2>Regulatory Adaptation</h2>
        <p>Staying ahead of regulatory changes and ensuring compliance remains a top priority. Risk management teams must be proactive in understanding and implementing new regulatory requirements as they emerge.</p>
      `
    },
    "4": {
      title: "Digital Transformation in Corporate Training",
      author: "Sarah Johnson",
      date: "2023-12-28",
      category: "Education",
      readTime: "7 min read",
      image: digitalTrainingProfessional,
      content: `
        <p>The corporate training landscape has undergone a dramatic transformation, with digital platforms revolutionizing how organizations develop their workforce. This shift has been accelerated by remote work trends and the need for more flexible, scalable learning solutions.</p>

        <h2>The Rise of Learning Management Systems</h2>
        <p>Modern Learning Management Systems (LMS) offer comprehensive platforms that track progress, deliver content, and measure learning outcomes. These systems provide administrators with detailed analytics on employee engagement and learning effectiveness.</p>

        <h2>Personalized Learning Experiences</h2>
        <p>AI-driven platforms now offer personalized learning paths that adapt to individual learning styles, pace, and preferences. This customization increases engagement and improves knowledge retention across diverse employee populations.</p>

        <h2>Virtual Reality and Immersive Learning</h2>
        <p>VR technology is creating immersive training experiences that simulate real-world scenarios. This is particularly valuable for high-stakes training situations where hands-on practice is essential but actual experience is costly or risky.</p>

        <h2>Mobile Learning and Microlearning</h2>
        <p>Mobile-optimized content and bite-sized learning modules allow employees to learn on-the-go. This approach fits better with busy schedules and improves knowledge retention through spaced repetition.</p>

        <h2>Social Learning and Collaboration</h2>
        <p>Digital platforms are incorporating social learning features that enable peer-to-peer knowledge sharing, discussion forums, and collaborative projects. This approach leverages the collective knowledge of the organization.</p>

        <h2>Measuring Training ROI</h2>
        <p>Advanced analytics tools are making it easier to measure the return on investment for training programs. Organizations can track everything from completion rates to performance improvements and business impact.</p>
      `
    },
    "5": {
      title: "Maximizing ROI with AI-Powered Learning Platforms",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-22",
      category: "Technology",
      readTime: "6 min read",
      image: aiAnalyticsProfessional,
      content: `
        <p>Artificial Intelligence is transforming corporate learning by delivering unprecedented insights into training effectiveness and learner behavior. Organizations investing in AI-powered learning platforms are seeing significant returns through improved training outcomes and operational efficiency.</p>

        <h2>Intelligent Content Recommendation</h2>
        <p>AI algorithms analyze learner behavior, performance data, and skill gaps to recommend relevant content. This personalized approach ensures that employees receive training that directly addresses their development needs and career goals.</p>

        <h2>Automated Performance Assessment</h2>
        <p>Machine learning models can automatically assess learner performance and provide instant feedback. This real-time assessment helps identify knowledge gaps quickly and adjusts learning paths accordingly.</p>

        <h2>Predictive Analytics for Learning Outcomes</h2>
        <p>AI-powered platforms can predict which learners are at risk of not completing training programs and proactively intervene with additional support or modified content delivery methods.</p>

        <h2>Natural Language Processing for Content Creation</h2>
        <p>NLP technologies are streamlining content creation by automatically generating training materials, assessments, and summaries from existing resources. This significantly reduces the time and cost associated with developing new training content.</p>

        <h2>Intelligent Chatbots and Virtual Assistants</h2>
        <p>AI-powered chatbots provide 24/7 support to learners, answering questions, providing guidance, and helping navigate learning platforms. This reduces the burden on human support staff while improving learner experience.</p>

        <h2>ROI Measurement and Optimization</h2>
        <p>Advanced analytics provide detailed insights into training ROI, including time-to-competency, knowledge retention rates, and business impact. These metrics enable continuous optimization of training programs for maximum effectiveness.</p>
      `
    },
    "6": {
      title: "Microlearning: The Future of Professional Development",
      author: "Michael Chen",
      date: "2024-01-18",
      category: "Education",
      readTime: "5 min read",
      image: microlearningProfessional,
      content: `
        <p>Microlearning has emerged as one of the most effective approaches to professional development, offering bite-sized learning experiences that fit seamlessly into busy work schedules. This methodology is proving particularly effective for finance professionals who need to stay current with rapidly changing industry requirements.</p>

        <h2>The Science Behind Microlearning</h2>
        <p>Research shows that information delivered in small, focused chunks is better retained and more easily applied. The spacing effect and active recall principles that underpin microlearning align with how our brains naturally process and store information.</p>

        <h2>Just-in-Time Learning</h2>
        <p>Microlearning modules can be delivered precisely when employees need specific knowledge or skills. This just-in-time approach ensures that learning is immediately applicable and relevant to current work challenges.</p>

        <h2>Mobile-First Design</h2>
        <p>Short learning modules are perfectly suited for mobile consumption, allowing professionals to learn during commutes, breaks, or other downtime. This accessibility dramatically increases engagement and completion rates.</p>

        <h2>Improved Knowledge Retention</h2>
        <p>The spaced repetition inherent in microlearning helps move information from short-term to long-term memory. Learners are more likely to retain and apply knowledge gained through microlearning compared to traditional lengthy training sessions.</p>

        <h2>Cost-Effective Implementation</h2>
        <p>Microlearning modules are less expensive to produce and update than comprehensive courses. Organizations can quickly adapt content to address emerging needs or regulatory changes without significant investment.</p>

        <h2>Measurable Learning Outcomes</h2>
        <p>The granular nature of microlearning makes it easier to track specific learning objectives and measure competency development. This data-driven approach enables more effective training program optimization.</p>
      `
    },
    "7": {
      title: "Adaptive Learning Systems in Financial Training",
      author: "Sarah Johnson",
      date: "2024-01-12",
      category: "Technology",
      readTime: "7 min read",
      image: adaptiveLearningProfessional,
      content: `
        <p>Adaptive learning systems represent the next evolution in educational technology, using artificial intelligence to create personalized learning experiences that adjust in real-time based on learner performance and preferences. In financial training, these systems are proving invaluable for developing competencies at scale.</p>

        <h2>How Adaptive Learning Works</h2>
        <p>Adaptive systems continuously analyze learner interactions, assessment results, and engagement patterns to modify content delivery, pacing, and complexity. This creates a unique learning path for each individual based on their specific needs and learning style.</p>

        <h2>Competency-Based Progression</h2>
        <p>Unlike traditional linear courses, adaptive systems allow learners to progress based on demonstrated competency rather than time spent. This ensures that professionals master essential skills before advancing to more complex topics.</p>

        <h2>Real-Time Difficulty Adjustment</h2>
        <p>The system automatically adjusts content difficulty based on learner performance. If a learner is struggling, the system provides additional support and practice. If they're excelling, it presents more challenging material to maintain engagement.</p>

        <h2>Intelligent Content Sequencing</h2>
        <p>AI algorithms determine the optimal sequence for presenting learning materials based on prerequisite knowledge, learning objectives, and individual learner profiles. This ensures efficient knowledge building and reduces cognitive overload.</p>

        <h2>Continuous Assessment and Feedback</h2>
        <p>Adaptive systems provide ongoing assessment through embedded questions, simulations, and practical exercises. Immediate feedback helps learners understand concepts and correct misconceptions quickly.</p>

        <h2>Data-Driven Insights</h2>
        <p>These systems generate detailed analytics on learning patterns, common misconceptions, and skill development trends. This data helps organizations identify knowledge gaps and optimize their training programs continuously.</p>
      `
    },
    "8": {
      title: "Gamification Strategies for Enhanced Learning Engagement",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-08",
      category: "Education",
      readTime: "6 min read",
      image: gamificationProfessional,
      content: `
        <p>Gamification in professional learning has evolved from a novel concept to a proven strategy for increasing engagement and improving learning outcomes. By incorporating game design elements into training programs, organizations are seeing dramatic improvements in completion rates and knowledge retention.</p>

        <h2>Core Gamification Elements</h2>
        <p>Effective gamification incorporates points, badges, leaderboards, progress bars, and achievement unlocks. These elements tap into intrinsic motivators like achievement, recognition, and competition to drive engagement with learning content.</p>

        <h2>Progressive Skill Development</h2>
        <p>Gamified learning platforms often structure content as skill trees or level-based progressions. Learners can see their advancement clearly and understand how current learning contributes to overall competency development.</p>

        <h2>Social Learning and Competition</h2>
        <p>Leaderboards and team challenges create healthy competition while fostering collaboration. Social elements encourage peer learning and create accountability within learning cohorts.</p>

        <h2>Immediate Feedback and Rewards</h2>
        <p>Instant feedback through points, badges, and progress indicators provides immediate gratification and reinforcement. This continuous reinforcement helps maintain motivation throughout longer learning programs.</p>

        <h2>Narrative and Storytelling</h2>
        <p>Embedding learning content within compelling narratives or scenarios makes information more memorable and engaging. Story-based learning helps learners understand practical applications of concepts.</p>

        <h2>Measuring Gamification Success</h2>
        <p>Successful gamification strategies are measured not just by engagement metrics but by learning outcomes and business impact. Organizations track completion rates, knowledge retention, skill application, and performance improvements to evaluate program effectiveness.</p>
      `
    }
  };

  const article = articles[id as keyof typeof articles];

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <Link to="/blog">
          <Button className="mt-4">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Article Header */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-black hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="mb-6">
            <Badge className="bg-halo-navy text-halo-orange mb-4">{article.category}</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-black">
              <span>By {article.author}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.date).toLocaleDateString()}
              </div>
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex gap-2 mb-8">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          {/* Article Content */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div 
                className="prose prose-lg max-w-none text-black"
                style={{
                  lineHeight: '1.7',
                  fontSize: '16px'
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>

          {/* Related Articles CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-black mb-4">Continue Reading</h3>
            <Link to="/blog">
              <Button className="bg-halo-navy text-halo-orange hover:bg-halo-navy/90">
                Explore More Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <FinPilotBrandFooter />
    </div>
  );
};

export default Article;