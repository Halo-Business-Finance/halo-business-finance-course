import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { HelpCircle, MessageCircle, Mail, Clock, CheckCircle, ArrowRight, Calendar, Phone, Building, User } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import supportHero from "@/assets/support-hero.jpg";
import LeadIntakeModal from "@/components/LeadIntakeModal";

const Support = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'sales' | 'demo'>('sales');
  const faqCategories = [
    {
      category: "Getting Started",
      faqs: [
        {
          question: "What is an online course and how does it work?",
          answer: "An online course is a structured learning experience delivered over the internet. Our courses offer both live sessions (synchronous) and self-paced content (asynchronous), allowing you to learn in the format that works best for your schedule."
        },
        {
          question: "How long is the free trial?",
          answer: "We offer a free 3-day trial that gives you full access to our platform and courses. No credit card required to start your trial."
        },
        {
          question: "How do I sign up for a course?",
          answer: "Simply browse our course catalog, select the course you want, click 'Enroll Now', create your account or log in, and complete the payment process. You'll have immediate access to your course materials."
        },
        {
          question: "Can courses be taken at one's own pace?",
          answer: "Yes! Most of our courses are self-paced, allowing you to learn whenever it's convenient for you. Some courses may have optional live sessions or suggested timelines to help you stay on track."
        },
        {
          question: "What are the prerequisites for courses?",
          answer: "Prerequisites vary by course and are clearly listed on each course page. Most beginner courses have no prerequisites, while advanced courses may require completion of foundational courses or specific experience."
        },
        {
          question: "What materials are required for courses?",
          answer: "All course materials are provided digitally within our platform. You'll only need a computer or mobile device with internet access. Any specific software requirements are listed on the course page."
        }
      ]
    },
    {
      category: "Course Content",
      faqs: [
        {
          question: "Who are the instructors and what are their qualifications?",
          answer: "Our instructors are industry experts with extensive experience in finance and lending. Each instructor's bio, credentials, and professional background are available on their course pages."
        },
        {
          question: "What will be learned from courses?",
          answer: "Each course page includes detailed learning objectives and outcomes. You'll gain practical skills, industry knowledge, and certifications that directly apply to your finance career."
        },
        {
          question: "How are assignments and exams submitted?",
          answer: "All assignments and exams are completed directly within our platform. Simply click submit when you're finished, and your work will be automatically saved and graded."
        },
        {
          question: "How will feedback on work be received?",
          answer: "You'll receive automated feedback immediately for quizzes and assignments. For subjective work, instructors provide detailed feedback within 48-72 hours through your course dashboard."
        },
        {
          question: "How often is course content updated?",
          answer: "We continuously update our course content to reflect current industry standards, regulations, and best practices. Major updates are released quarterly, with minor updates as needed."
        },
        {
          question: "Is this program accredited or licensed?",
          answer: "Our courses are designed to meet industry standards and many provide CPE credits. Specific accreditation details are available on individual course pages and certificates."
        },
        {
          question: "Do you offer certificates upon completion?",
          answer: "Yes, you'll receive a certificate of completion for each course you finish. These can be downloaded and shared on professional networks like LinkedIn."
        }
      ]
    },
    {
      category: "Technical Support",
      faqs: [
        {
          question: "What are the minimum technology requirements?",
          answer: "You need a device with internet access (computer, tablet, or smartphone), a modern web browser (Chrome, Firefox, Safari, or Edge), and a stable internet connection. No special software installation required."
        },
        {
          question: "What should be done if there are trouble logging in?",
          answer: "Click 'Forgot Password' on the login page to reset your password. If you continue having issues, clear your browser cache or try a different browser. Contact support if problems persist."
        },
        {
          question: "Who should be contacted for technical problems?",
          answer: "Use our live chat feature for immediate assistance, or submit a support ticket through the 'Send Message' form. Our technical support team is available 24/7."
        },
        {
          question: "How can common issues like frozen videos be troubleshooted?",
          answer: "Try refreshing the page, clearing your browser cache, or switching to a different browser. For mobile issues, restart the app. If problems continue, check your internet connection or contact support."
        },
        {
          question: "Can courses be accessed on different devices?",
          answer: "Yes! Our platform works on computers, tablets, and smartphones. We also have mobile apps for iOS and Android that allow offline viewing of downloaded lessons."
        }
      ]
    },
    {
      category: "User Account/Billing",
      faqs: [
        {
          question: "How much do courses cost? Are there payment plans?",
          answer: "Course prices vary depending on content and length. We offer individual course purchases, monthly subscriptions, and annual plans. Payment plans and corporate discounts are available - contact sales for details."
        },
        {
          question: "What is the refund or cancellation policy?",
          answer: "We offer a 30-day money-back guarantee for all courses. If you're not satisfied, contact our support team for a full refund within 30 days of purchase."
        },
        {
          question: "How can progress be tracked?",
          answer: "Your dashboard shows completion percentages, quiz scores, time spent learning, and certificates earned. You can track progress for individual courses and your overall learning path."
        },
        {
          question: "How do I update my password or email?",
          answer: "Go to your Account settings by clicking your profile icon in the top right corner and select 'Account' to update your personal information and security settings."
        },
        {
          question: "How do I update my billing information?",
          answer: "In your Account settings, select the 'Billing' tab to update your payment method, billing address, and view your payment history."
        },
        {
          question: "What is the privacy policy regarding personal data?",
          answer: "We take your privacy seriously and follow strict data protection standards. Your personal information is encrypted and never shared with third parties. View our full privacy policy in your account settings."
        },
        {
          question: "What happens if the program needs to be paused or stopped?",
          answer: "You can pause your subscription at any time through your account settings. Your progress is saved, and you can resume whenever you're ready. For course withdrawals, contact support for assistance."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Connect with our support specialists instantly for immediate assistance",
      action: "Start Conversation",
      available: "Available 24/7",
      responseTime: "Avg. 2 min response",
      color: "bg-blue-50 border-blue-100",
      onClick: () => {
        // Open live chat widget
        console.log("Opening live chat...");
      }
    },
    {
      icon: Mail,
      title: "Contact Sales",
      description: "Speak with our sales team about custom solutions and enterprise pricing",
      action: "Contact Sales",
      available: "Mon-Fri 9AM-6PM EST",
      responseTime: "Same day response",
      color: "bg-green-50 border-green-100",
      onClick: () => {
        setModalType('sales');
        setIsLeadModalOpen(true);
      }
    },
    {
      icon: CheckCircle,
      title: "Request Schedule Demo",
      description: "Book a personalized demo to see how FinPilot can transform your training",
      action: "Schedule a Demo",
      available: "Flexible scheduling",
      responseTime: "Demo within 24hrs",
      color: "bg-orange-50 border-orange-100",
      onClick: () => {
        setModalType('demo');
        setIsDemoModalOpen(true);
      }
    }
  ];

  return (
    <>
      <SEOHead 
        title="Support Center | FinPilot Customer Support & Help Resources"
        description="Get expert support for your FinPilot training. Live chat, FAQs, and comprehensive help resources available 24/7 for all finance professionals."
        keywords="FinPilot support, customer help, training support, technical assistance, course help, live chat support"
        canonicalUrl="https://finpilot.com/support"
      />
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[28rem] md:h-[32rem] lg:h-[40rem] overflow-hidden">
        <img 
          src={supportHero}
          alt="Professional customer support environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/60">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">Support Center</Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">We're here to help</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Get the support you need to succeed. Our dedicated team is ready to assist you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">

        {/* Lead Intake Modals */}
        <LeadIntakeModal
          isOpen={isLeadModalOpen}
          onOpenChange={setIsLeadModalOpen}
          leadType="sales"
          leadSource="support_page"
        />
        <LeadIntakeModal
          isOpen={isDemoModalOpen}
          onOpenChange={setIsDemoModalOpen}
          leadType="demo"
          leadSource="support_page"
        />

        {/* Contact Support Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Contact Our Support Team</h2>
            <p className="text-base text-black max-w-2xl mx-auto">
              Choose the best way to reach us. Our expert support team is ready to help you succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
            {/* Support Options Cards */}
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{option.available}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{option.responseTime}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={option.onClick}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {option.action}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Contact Form */}
            <div className="space-y-8">
              {/* Contact Form Widget */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-halo-orange" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-foreground mb-1">Send Message</div>
                    <div className="text-sm font-medium text-primary mb-2">Contact Form</div>
                    <div className="text-xs text-black leading-relaxed">Can't find what you're looking for? Our team will get back to you within 4 hours.</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name" 
                      className="h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                    />
                    <Input 
                      placeholder="Last Name" 
                      className="h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                    />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    className="h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                  />
                  <Input 
                    placeholder="Subject" 
                    className="h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                  />
                  <Textarea 
                    placeholder="Tell us how we can help you..." 
                    rows={4} 
                    className="border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg resize-none"
                  />
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We typically respond within 4 hours during business hours
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - FAQ Widget */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-halo-orange" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-foreground mb-1">Get Answers</div>
                  <div className="text-sm font-medium text-primary mb-2">Frequently Asked Questions</div>
                  <div className="text-xs text-black leading-relaxed">Find quick answers to common questions about our courses and platform.</div>
                </div>
              </div>
              <div className="space-y-6">
                {faqCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <h4 className="text-lg font-semibold text-foreground border-b border-black pb-2">
                      {category.category}
                    </h4>
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem 
                          key={`${categoryIndex}-${faqIndex}`} 
                          value={`item-${categoryIndex}-${faqIndex}`} 
                          className="border border-gray-200 rounded-lg px-6 py-2 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <AccordionTrigger className="text-left font-semibold text-black hover:text-primary transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-black leading-relaxed pt-2">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>


      </div>
        
      <FinPilotBrandFooter />
    </div>
    </>
  );
};

export default Support;