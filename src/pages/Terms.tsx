import { SEOHead } from "@/components/SEOHead";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <SEOHead 
        title="Terms of Use - FinPilot Learning Platform"
        description="Read FinPilot's terms of use, refund policy, and dispute resolution procedures for our professional financial training platform."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Use</h1>
            <p className="text-lg text-muted-foreground">
              Please read these terms carefully before using FinPilot's services
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By accessing and using FinPilot's learning platform, you accept and agree to be bound by the terms and provision of this agreement. These Terms of Use constitute a legally binding agreement between you and FinPilot.
                </p>
                <p>
                  If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time without prior notice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">2. Service Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  FinPilot provides online professional development and certification programs in commercial lending, business finance, and related financial services. Our platform offers:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Interactive online courses and training modules</li>
                  <li>Professional certification programs</li>
                  <li>Assessment tools and progress tracking</li>
                  <li>Educational resources and materials</li>
                  <li>Instructor support and guidance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">3. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>As a user of FinPilot's platform, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the platform solely for educational purposes</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not share course materials with unauthorized parties</li>
                  <li>Not engage in any activity that disrupts platform functionality</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">4. Payment Terms & Refund Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Payment Terms</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All course fees must be paid in advance of course access</li>
                    <li>Payments are processed securely through our payment providers</li>
                    <li>Corporate accounts may be eligible for invoicing arrangements</li>
                    <li>All prices are subject to change with 30 days notice</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Refund Policy</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">Full Refund (within 7 days)</h4>
                      <p>You may request a full refund within 7 days of purchase if you have completed less than 25% of the course content.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Partial Refund (8-30 days)</h4>
                      <p>Between 8-30 days after purchase, partial refunds may be considered on a case-by-case basis, provided less than 50% of course content has been accessed.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">No Refund Conditions</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>More than 30 days have passed since purchase</li>
                        <li>More than 50% of course content has been accessed</li>
                        <li>Certificate has been issued upon course completion</li>
                        <li>Course materials have been downloaded</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Refund Process</h4>
                      <p>To request a refund, contact our support team at <strong>training@finpilot.com</strong> with your order number and reason for the refund request. Refunds will be processed within 5-10 business days to the original payment method.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">5. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All content, materials, and resources provided through FinPilot's platform are protected by intellectual property laws. This includes but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Course content, videos, and educational materials</li>
                  <li>Assessments, quizzes, and evaluation tools</li>
                  <li>Software, platform design, and user interface</li>
                  <li>Trademarks, logos, and branding elements</li>
                </ul>
                <p>
                  Users are granted a limited, non-exclusive license to access and use these materials solely for personal educational purposes. Redistribution, reproduction, or commercial use is strictly prohibited.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  FinPilot provides educational services "as is" without warranties of any kind. We make no guarantees regarding:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Career advancement or employment outcomes</li>
                  <li>Specific skill acquisition or competency levels</li>
                  <li>Platform availability or technical performance</li>
                  <li>Third-party integration or external content</li>
                </ul>
                <p>
                  Our liability is limited to the amount paid for the specific course or service. We shall not be liable for any indirect, incidental, or consequential damages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">7. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Resolution Process</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">Step 1: Direct Contact</h4>
                      <p>First, contact our support team at <strong>training@finpilot.com</strong> or call <strong>1-800-FINPILOT</strong>. Many issues can be resolved quickly through direct communication.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Step 2: Formal Complaint</h4>
                      <p>If the issue cannot be resolved through direct contact, submit a formal written complaint including:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Your account information and order details</li>
                        <li>Detailed description of the issue</li>
                        <li>Desired resolution outcome</li>
                        <li>Any supporting documentation</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Step 3: Mediation</h4>
                      <p>For unresolved disputes, we encourage mediation through a neutral third-party service before pursuing legal action.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Governing Law</h3>
                  <p>
                    These terms are governed by the laws of the jurisdiction where FinPilot is incorporated. Any legal proceedings will be conducted in the appropriate courts of that jurisdiction.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Consumer Protection</h3>
                  <p>
                    We comply with applicable consumer protection laws. Nothing in these terms limits your statutory rights as a consumer, including rights under consumer protection legislation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">8. Account Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  FinPilot reserves the right to suspend or terminate user accounts for violations of these terms, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sharing account credentials or course materials</li>
                  <li>Attempting to circumvent platform security</li>
                  <li>Engaging in fraudulent or abusive behavior</li>
                  <li>Violating intellectual property rights</li>
                </ul>
                <p>
                  Users may voluntarily close their accounts at any time by contacting support. Account closure does not automatically entitle users to refunds unless within the specified refund period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">9. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>For questions about these Terms of Use, disputes, or support issues, please contact us:</p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> training@finpilot.com</p>
                  <p><strong>Phone:</strong> 1-800-FINPILOT</p>
                  <p><strong>Website:</strong> www.finpilot.com</p>
                </div>
                <p className="pt-4 text-sm">
                  We are committed to resolving any issues promptly and maintaining the highest standards of service for our learning community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <FinPilotBrandFooter />
      </div>
    </>
  );
};

export default Terms;