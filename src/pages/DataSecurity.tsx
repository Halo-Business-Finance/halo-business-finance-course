import { useState } from "react";
import { Shield, Lock, Eye, Database, FileCheck, Users, Globe, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { DataRightsModal, DataRightType } from "@/components/DataRightsModal";

const DataSecurity = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRightType, setSelectedRightType] = useState<DataRightType | null>(null);

  const handleRightRequest = (rightType: DataRightType) => {
    setSelectedRightType(rightType);
    setModalOpen(true);
  };
  return (
    <>
      <SEOHead 
        title="Data & Security | FinPilot Learning Platform"
        description="Learn about FinPilot's comprehensive data protection measures, security protocols, and privacy practices. Your data security is our top priority."
        keywords="data security, privacy protection, GDPR compliance, data encryption, learning platform security, user data protection"
        canonicalUrl="https://finpilot.com/data-security"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative bg-halo-navy text-white py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-navy-800/90"></div>
          <div className="relative container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Data & Security
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Data, Our Priority
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive security measures and transparent data practices to protect your learning journey
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          {/* Security Overview */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Framework</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our multi-layered security approach ensures your data remains protected at every level
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-halo-orange mx-auto mb-4" />
                  <CardTitle className="text-lg">Data Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    256-bit AES encryption for data at rest and TLS 1.3 for data in transit
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Lock className="h-12 w-12 text-halo-orange mx-auto mb-4" />
                  <CardTitle className="text-lg">Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Multi-factor authentication and role-based access controls
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Eye className="h-12 w-12 text-halo-orange mx-auto mb-4" />
                  <CardTitle className="text-lg">Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    24/7 security monitoring and automated threat detection
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <FileCheck className="h-12 w-12 text-halo-orange mx-auto mb-4" />
                  <CardTitle className="text-lg">Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    GDPR, CCPA, and SOC 2 Type II compliant security practices
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-halo-orange" />
                  Data Protection & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">What Data We Collect</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Name and email address</li>
                        <li>• Profile information</li>
                        <li>• Authentication credentials</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Learning Data</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Course progress and completion</li>
                        <li>• Quiz scores and assessments</li>
                        <li>• Learning preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">How We Protect Your Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Technical Safeguards</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• End-to-end encryption</li>
                        <li>• Secure data centers</li>
                        <li>• Regular security audits</li>
                        <li>• Automated backups</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Administrative Controls</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Staff security training</li>
                        <li>• Background checks</li>
                        <li>• Need-to-know access</li>
                        <li>• Incident response procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Rights */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-halo-orange" />
                  Your Data Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Access & Portability</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Request a copy of your personal data in a portable format
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("access-portability")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Request Data Copy
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Update or correct inaccurate personal information
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("correction")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Request Correction
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Request deletion of your personal data when no longer needed
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("deletion")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Request Deletion
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Restriction</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Limit how we process your personal information
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("restriction")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Request Restriction
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Objection</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Object to processing based on legitimate interests
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("objection")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Object to Processing
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Withdraw Consent</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Withdraw consent for data processing at any time
                    </p>
                    <Button 
                      onClick={() => handleRightRequest("withdraw-consent")}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Withdraw Consent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Compliance & Certifications */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-halo-orange" />
                  Compliance & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-3 text-sm">GDPR Compliant</Badge>
                    <p className="text-sm text-gray-600">
                      Full compliance with European data protection regulations
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-3 text-sm">CCPA Compliant</Badge>
                    <p className="text-sm text-gray-600">
                      California Consumer Privacy Act compliance for US users
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-3 text-sm">SOC 2 Type II</Badge>
                    <p className="text-sm text-gray-600">
                      Independent audit of security, availability, and confidentiality
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Incident Response */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-halo-orange" />
                  Security Incident Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  In the unlikely event of a security incident, we have established procedures to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Immediate Response</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Contain and assess the incident</li>
                      <li>• Preserve evidence for investigation</li>
                      <li>• Implement corrective measures</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Notify affected users within 72 hours</li>
                      <li>• Report to relevant authorities</li>
                      <li>• Provide regular updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="text-center">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Questions About Data & Security?
                </h2>
                <p className="text-gray-600 mb-6">
                  Our Data Protection Officer is available to address your concerns
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Email:</strong> privacy@finpilot.com
                  </p>
                  <p className="text-sm">
                    <strong>Address:</strong> Data Protection Officer, FinPilot, 123 Financial District, Suite 100
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <FinPilotBrandFooter />
      </div>
      
      <DataRightsModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requestType={selectedRightType}
      />
    </>
  );
};

export default DataSecurity;