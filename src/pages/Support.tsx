import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle, Mail, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { SEOHead } from "@/components/SEOHead";
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">We're here to help</h1>
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
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Contact Our Support Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the best way to reach us. Our expert support team is ready to help you succeed.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{option.title}</h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">{option.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">{option.available}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">{option.responseTime}</span>
                      </div>
                    </div>
                    
                    {option.badge && (
                      <Badge className="bg-primary text-white mb-4 px-3 py-1">
                        {option.badge}
                      </Badge>
                    )}
                    
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base">
                      <Icon className="h-5 w-5 mr-2" />
                      {option.action}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>


        {/* Help Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* FAQ Section */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Frequently Asked Questions</CardTitle>
                  <CardDescription>Find quick answers to common questions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border border-slate-200 rounded-lg px-4 py-1 hover:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium text-slate-900 hover:text-primary transition-colors text-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pt-2 text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Send us a Message</CardTitle>
                  <CardDescription>We'll get back to you within 4 hours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    placeholder="First Name" 
                    className="h-11 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Input 
                    placeholder="Last Name" 
                    className="h-11 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="h-11 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Input 
                  placeholder="Subject" 
                  className="h-11 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Textarea 
                  placeholder="How can we help you today?" 
                  rows={4} 
                  className="border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium">
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  We typically respond within 4 hours during business hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        
      <FinPilotBrandFooter />
    </div>
    </>
  );
};

export default Support;