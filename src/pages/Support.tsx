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
      <div className="relative h-[32rem] overflow-hidden">
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
                <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-halo-navy overflow-hidden relative`}>
                  {option.badge && (
                    <Badge className="absolute top-3 right-3 bg-blue-600 text-white text-xs">
                      {option.badge}
                    </Badge>
                  )}
                  <CardHeader className="pb-3 p-4">
                    <div className="w-12 h-12 bg-halo-navy border-2 border-white rounded-xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-halo-orange" />
                    </div>
                    <CardTitle className="text-lg font-bold text-white">{option.title}</CardTitle>
                    <CardDescription className="text-white text-sm leading-relaxed">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-blue-400" />
                        <span className="text-white">{option.available}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-blue-400" />
                        <span className="text-white">{option.responseTime}</span>
                      </div>
                    </div>
                    <Button className="w-full h-10 bg-slate-900 border-2 border-white hover:bg-slate-800 text-halo-orange font-semibold rounded-lg shadow-md hover:shadow-lg transition-all group-hover:bg-blue-600 text-sm">
                      {option.action}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Help Options */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">Quick Help</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickHelp.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-black mb-2">{item.description}</p>
                    <p className="text-xs font-medium text-blue-600">{item.count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ and Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-slate-200 rounded-xl px-6 py-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-black leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Form */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-xl font-bold">Send us a Message</CardTitle>
              <CardDescription className="text-blue-100">
                Can't find what you're looking for? Our team will get back to you within 4 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                />
                <Input 
                  placeholder="Last Name" 
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                />
              </div>
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
              />
              <Input 
                placeholder="Subject" 
                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
              />
              <Textarea 
                placeholder="Tell us how we can help you..." 
                rows={4} 
                className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg resize-none"
              />
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                Send Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-slate-500 text-center">
                We typically respond within 4 hours during business hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
        
      <FinPilotBrandFooter />
    </div>
  );
};

export default Support;