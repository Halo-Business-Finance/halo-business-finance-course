import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";

const Privacy = () => {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - FinPilot"
        description="FinPilot's privacy policy explaining how we collect, use, and protect your personal information in our financial training platform."
        keywords="privacy policy, data protection, FinPilot, financial training, user privacy"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl font-bold mb-4">Privacy Policy</CardTitle>
                <p className="text-muted-foreground text-lg">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardHeader>
              
              <CardContent className="prose max-w-none">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
                      <p>
                        We collect information you provide directly to us, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Name, email address, and contact information</li>
                        <li>Account credentials and profile information</li>
                        <li>Payment and billing information</li>
                        <li>Course enrollment and progress data</li>
                        <li>Communications with our support team</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium text-foreground">Usage Information</h3>
                      <p>
                        We automatically collect information about your use of our platform:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Learning activities and course completion status</li>
                        <li>Time spent on modules and assessments</li>
                        <li>Device information and IP address</li>
                        <li>Browser type and operating system</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide and maintain our educational services</li>
                        <li>Track your learning progress and provide personalized recommendations</li>
                        <li>Process payments and manage your account</li>
                        <li>Send course updates, notifications, and educational content</li>
                        <li>Provide customer support and respond to your inquiries</li>
                        <li>Improve our platform and develop new features</li>
                        <li>Ensure security and prevent fraud</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                        <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                        <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We implement industry-standard security measures to protect your personal information:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security audits and assessments</li>
                        <li>Secure payment processing</li>
                        <li>Access controls and authentication measures</li>
                        <li>Employee training on data protection</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>You have the following rights regarding your personal information:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Access:</strong> Request access to your personal data</li>
                        <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                        <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                      </ul>
                      <p>
                        To exercise these rights, please contact us at privacy@finpilot.com.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We use cookies and similar technologies to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Remember your login status and preferences</li>
                        <li>Analyze usage patterns and improve our services</li>
                        <li>Provide personalized content and recommendations</li>
                        <li>Ensure security and prevent fraud</li>
                      </ul>
                      <p>
                        You can control cookie settings through your browser preferences.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Our services are designed for users 18 years of age and older. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">8. International Users</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        If you are accessing our services from outside the United States, please note that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our services, you consent to this transfer.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        If you have any questions about this privacy policy or our data practices, please contact us:
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p><strong>Email:</strong> privacy@finpilot.com</p>
                        <p><strong>Phone:</strong> 1-800-FINPILOT</p>
                        <p><strong>Address:</strong> FinPilot Data Protection Office</p>
                      </div>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
            
            <FinPilotBrandFooter />
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;