import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Mail, Phone, Search } from "lucide-react";

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
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      available: "Response within 24h"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      available: "Mon-Fri 9AM-6PM"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We're here to help you succeed. Find answers to common questions or contact our support team.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{option.available}</p>
                <Button className="w-full">{option.action}</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>Can't find what you're looking for? Send us a message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Your Name" />
            <Input type="email" placeholder="Your Email" />
            <Input placeholder="Subject" />
            <Textarea placeholder="Describe your issue or question..." rows={4} />
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;