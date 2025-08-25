import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Check, AlertCircle } from "lucide-react";

interface PageData {
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  sort_order: number;
}

export const ContentImporter = () => {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<string[]>([]);
  const { toast } = useToast();

  const existingPages: PageData[] = [
    {
      title: "Pricing",
      slug: "pricing",
      content: `<div class="pricing-hero">
        <h1>Choose Your Learning Path</h1>
        <p>Invest in your financial career with our comprehensive training programs</p>
      </div>
      
      <div class="pricing-plans">
        <div class="plan basic">
          <h3>Basic Plan</h3>
          <p class="price">$29/month</p>
          <ul>
            <li>Access to 5 foundational courses</li>
            <li>Basic email support (48h response)</li>
            <li>Certificate of completion</li>
            <li>Mobile app access</li>
            <li>Basic progress tracking</li>
            <li>Community forum access</li>
          </ul>
        </div>
        
        <div class="plan professional popular">
          <h3>Professional Plan</h3>
          <p class="price">$79/month</p>
          <ul>
            <li>Access to ALL 25+ courses</li>
            <li>Priority support (12h response)</li>
            <li>Advanced certificates with LinkedIn integration</li>
            <li>Live Q&A sessions with instructors</li>
            <li>Advanced progress tracking & analytics</li>
            <li>Custom learning paths</li>
            <li>Downloadable resources & templates</li>
            <li>Practice assessments & simulations</li>
            <li>Career guidance consultations</li>
            <li>Networking events access</li>
          </ul>
        </div>
        
        <div class="plan enterprise">
          <h3>Enterprise Plan</h3>
          <p class="price">$199/month</p>
          <ul>
            <li>Everything in Professional</li>
            <li>Custom branding options</li>
            <li>Dedicated account manager</li>
            <li>Custom integrations</li>
            <li>Advanced reporting & analytics</li>
            <li>Priority phone support</li>
            <li>Custom learning paths for teams</li>
            <li>Bulk user management</li>
            <li>SSO integration</li>
            <li>API access</li>
          </ul>
        </div>
      </div>`,
      meta_title: "Pricing Plans - Choose Your Learning Path",
      meta_description: "Explore our comprehensive pricing plans for financial training programs. Choose from Basic, Professional, or Enterprise plans to advance your career.",
      status: 'published',
      sort_order: 10
    },
    {
      title: "Support",
      slug: "support",
      content: `<div class="support-hero">
        <h1>We're Here to Help</h1>
        <p>Get the support you need to succeed in your learning journey</p>
      </div>
      
      <div class="support-options">
        <div class="support-option">
          <h3>Live Chat</h3>
          <p>Connect with our support specialists instantly for immediate assistance</p>
          <p><strong>Available 24/7</strong> | Avg. 2 min response</p>
        </div>
        
        <div class="support-option">
          <h3>Phone Support</h3>
          <p>Speak directly with our expert support team for personalized help</p>
          <p><strong>Mon-Fri 8AM-8PM EST</strong> | Immediate connection</p>
        </div>
        
        <div class="support-option">
          <h3>Email Support</h3>
          <p>Send us a detailed message and get a comprehensive response</p>
          <p><strong>24/7 Availability</strong> | 12-hour response time</p>
        </div>
        
        <div class="support-option">
          <h3>Video Call</h3>
          <p>Schedule a one-on-one video session with our learning specialists</p>
          <p><strong>By Appointment</strong> | 30-60 minute sessions</p>
        </div>
      </div>
      
      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-item">
          <h4>How do I access my purchased courses?</h4>
          <p>Once you've purchased a course, you can access it immediately from your dashboard. Simply log in and navigate to 'My Courses' section.</p>
        </div>
        <div class="faq-item">
          <h4>Can I get a refund for a course?</h4>
          <p>Yes, we offer a 30-day money-back guarantee for all courses. If you're not satisfied, contact our support team for a full refund.</p>
        </div>
        <div class="faq-item">
          <h4>How long do I have access to a course?</h4>
          <p>You have lifetime access to all purchased courses. You can learn at your own pace and revisit the content anytime.</p>
        </div>
        <div class="faq-item">
          <h4>Do you offer certificates upon completion?</h4>
          <p>Yes, you'll receive a certificate of completion for each course you finish. These can be downloaded and shared on professional networks.</p>
        </div>
        <div class="faq-item">
          <h4>Is there a mobile app available?</h4>
          <p>Yes, our mobile app is available for both iOS and Android devices. You can download lessons for offline viewing.</p>
        </div>
      </div>`,
      meta_title: "Support - Get Help with Your Learning Journey",
      meta_description: "Get comprehensive support for your learning experience. Contact us via live chat, phone, email, or video call. Find answers to frequently asked questions.",
      status: 'published',
      sort_order: 11
    },
    {
      title: "About",
      slug: "about",
      content: `<div class="about-hero">
        <h1>About Halo Business Finance</h1>
        <p>Empowering financial professionals with cutting-edge education and training</p>
      </div>
      
      <div class="about-content">
        <section class="mission">
          <h2>Our Mission</h2>
          <p>We're dedicated to transforming the way financial professionals learn and grow. Our comprehensive training programs combine industry expertise with innovative technology to deliver exceptional learning experiences.</p>
        </section>
        
        <section class="story">
          <h2>Our Story</h2>
          <p>Founded by industry veterans with decades of experience in finance and education, Halo Business Finance was created to bridge the gap between traditional academic learning and real-world financial expertise.</p>
        </section>
        
        <section class="values">
          <h2>Our Values</h2>
          <ul>
            <li><strong>Excellence:</strong> We maintain the highest standards in everything we do</li>
            <li><strong>Innovation:</strong> We embrace new technologies and teaching methods</li>
            <li><strong>Integrity:</strong> We operate with transparency and ethical practices</li>
            <li><strong>Growth:</strong> We're committed to continuous improvement and learning</li>
          </ul>
        </section>
        
        <section class="team">
          <h2>Our Expert Team</h2>
          <p>Our instructors are industry professionals with real-world experience in banking, lending, credit analysis, and financial management. They bring practical insights and current market knowledge to every course.</p>
        </section>
      </div>`,
      meta_title: "About Us - Halo Business Finance",
      meta_description: "Learn about Halo Business Finance's mission to empower financial professionals through innovative education and training programs.",
      status: 'published',
      sort_order: 12
    },
    {
      title: "Business Solutions",
      slug: "business",
      content: `<div class="business-hero">
        <h1>Transform Your Team's Financial Expertise</h1>
        <p>Comprehensive training solutions designed for financial institutions and business teams</p>
      </div>
      
      <div class="business-content">
        <section class="overview">
          <h2>Enterprise Training Solutions</h2>
          <p>Scale your team's expertise with our comprehensive business training programs. Designed specifically for financial institutions, lending companies, and corporate finance teams.</p>
        </section>
        
        <section class="features">
          <h2>What's Included</h2>
          <ul>
            <li>Custom learning paths tailored to your business needs</li>
            <li>White-label platform with your company branding</li>
            <li>Advanced analytics and progress tracking</li>
            <li>Dedicated account management</li>
            <li>Live training sessions and workshops</li>
            <li>Custom content development</li>
            <li>Integration with your existing systems</li>
            <li>Compliance tracking and reporting</li>
          </ul>
        </section>
        
        <section class="industries">
          <h2>Industries We Serve</h2>
          <ul>
            <li>Commercial Banks</li>
            <li>Credit Unions</li>
            <li>Alternative Lenders</li>
            <li>Investment Firms</li>
            <li>Insurance Companies</li>
            <li>Corporate Finance Teams</li>
            <li>Government Agencies</li>
            <li>Non-Profit Organizations</li>
          </ul>
        </section>
        
        <section class="benefits">
          <h2>Business Benefits</h2>
          <ul>
            <li>Reduce training costs by up to 60%</li>
            <li>Improve employee competency and confidence</li>
            <li>Standardize training across all locations</li>
            <li>Track and measure learning outcomes</li>
            <li>Ensure regulatory compliance</li>
            <li>Accelerate onboarding for new hires</li>
          </ul>
        </section>
      </div>`,
      meta_title: "Business Solutions - Enterprise Training Programs",
      meta_description: "Transform your team's financial expertise with our comprehensive enterprise training solutions. Custom programs for banks, lenders, and finance teams.",
      status: 'published',
      sort_order: 13
    }
  ];

  const clearExistingPages = async () => {
    try {
      console.log('Starting to clear existing pages...');
      // Delete all existing CMS pages to start fresh
      const { error, count } = await supabase
        .from('cms_pages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) {
        console.error('Error clearing existing pages:', error);
        throw error;
      }
      
      console.log(`Successfully cleared ${count || 'unknown number of'} existing pages`);
      return true;
    } catch (error) {
      console.error('Error clearing existing pages:', error);
      throw error;
    }
  };

  const importPage = async (pageData: PageData) => {
    try {
      console.log(`Importing page: ${pageData.title} (${pageData.slug})`);
      const { error, data } = await supabase
        .from('cms_pages')
        .insert([{
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content,
          status: pageData.status,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          sort_order: pageData.sort_order,
          is_homepage: pageData.slug === 'home',
          published_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error(`Database error importing ${pageData.title}:`, error);
        throw error;
      }
      
      console.log(`Successfully imported: ${pageData.title}`, data);
      setImported(prev => [...prev, pageData.slug]);
    } catch (error) {
      console.error(`Error importing ${pageData.title}:`, error);
      throw error;
    }
  };

  const importAllPages = async () => {
    setImporting(true);
    setImported([]); // Reset imported list
    
    try {
      console.log('Starting import process...');
      
      // First clear all existing pages
      await clearExistingPages();
      console.log('Cleared existing pages, now importing...');
      
      // Then import all pages one by one
      let successCount = 0;
      for (const page of existingPages) {
        try {
          await importPage(page);
          successCount++;
          console.log(`Import progress: ${successCount}/${existingPages.length}`);
        } catch (pageError) {
          console.error(`Failed to import page ${page.title}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
      
      if (successCount === existingPages.length) {
        toast({
          title: "Success",
          description: `Successfully imported all ${existingPages.length} pages into CMS`
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Imported ${successCount}/${existingPages.length} pages. Check console for details.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Import process failed:', error);
      toast({
        title: "Error",
        description: `Import failed: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Existing Pages
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Import your existing application pages (Pricing, Support, About, Business) into the CMS
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingPages.map((page) => (
            <div key={page.slug} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{page.title}</h4>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              {imported.includes(page.slug) ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Imported
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={importAllPages} 
            disabled={importing}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Importing...' : 'Clear & Import All Pages'}
          </Button>
          {imported.length > 0 && (
            <Badge variant="secondary">
              {imported.length}/{existingPages.length} imported
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> This will clear all existing CMS pages and import your application pages with rich content.</p>
        </div>
      </CardContent>
    </Card>
  );
};