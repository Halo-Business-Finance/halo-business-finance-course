import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle, Mail, Phone, Search, Clock, CheckCircle, ArrowRight, Headphones, FileText, Video, Users } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import supportHero from "@/assets/support-hero.jpg";

const Support = () => {
  const faqs = [
    {
      question: "How do I access my purchased courses?",
      answer: "Once you've purchased a course, you can access it immediately from your dashboard. Simply log in and navigate to 'My Courses' section."
    },
    {
      question: "Can I get a refund for a course?",
      answer: "Yes, we offer a 30-day money-back guarantee for all courses. If you're not satisfied, contact our support team for a full refund."
    },
    {
      question: "How long do I have access to a course?",
      answer: "You have lifetime access to all purchased courses. You can learn at your own pace and revisit the content anytime."
    },
    {
      question: "Do you offer certificates upon completion?",
      answer: "Yes, you'll receive a certificate of completion for each course you finish. These can be downloaded and shared on professional networks."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, our mobile app is available for both iOS and Android devices. You can download lessons for offline viewing."
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
      badge: "Most Popular",
      color: "bg-blue-50 border-blue-100"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our expert support team for personalized help",
      action: "Call (800) 555-0123",
      available: "Mon-Fri 8AM-8PM EST",
      responseTime: "Immediate connection",
      badge: "Priority",
      color: "bg-green-50 border-green-100"
    },
    {
      icon: Mail,
      title: "Email Support", 
      description: "Send detailed questions and receive comprehensive written responses",
      action: "Send Email",
      available: "24/7 Submissions",
      responseTime: "Within 4 hours",
      badge: "",
      color: "bg-gray-50 border-gray-100"
    }
  ];

  const quickHelp = [
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step guides",
      count: "50+ videos"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Comprehensive guides",
      count: "200+ articles"
    },
    {
      icon: Users,
      title: "Community",
      description: "User discussions",
      count: "5,000+ members"
    },
    {
      icon: Headphones,
      title: "Webinars",
      description: "Live training sessions",
      count: "Weekly sessions"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <img 
          src={supportHero}
          alt="Professional customer support environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/60">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">Support Center</Badge>
              <h1 className="text-5xl font-bold mb-4 leading-tight">We're here to help</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Get the support you need to succeed. Our dedicated team is ready to assist you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">

        {/* Contact Support Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Contact Our Support Team</h2>
            <p className="text-base text-black max-w-2xl mx-auto">
              Choose the best way to reach us. Our expert support team is ready to help you succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground mb-1">{option.action}</div>
                      <div className="text-sm font-medium text-primary mb-2">{option.title}</div>
                      <div className="text-xs text-black leading-relaxed mb-3">{option.description}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-blue-400" />
                          <span className="text-black">{option.available}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                          <span className="text-black">{option.responseTime}</span>
                        </div>
                      </div>
                      {option.badge && (
                        <div className="mt-2">
                          <Badge className="bg-black text-yellow-400 border-yellow-400/30 hover:bg-black/90 text-xs">
                            {option.badge}
                          </Badge>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>


        {/* FAQ and Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
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
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
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
          </Card>

          {/* Contact Form */}
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
      </div>
        
      <FinPilotBrandFooter />
    </div>
  );
};

export default Support;