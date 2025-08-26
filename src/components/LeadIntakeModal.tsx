import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Calendar, ArrowRight, Building, User, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkFormSubmissionRate } from "@/utils/secureFormHandling";

interface LeadIntakeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadType: 'sales' | 'demo' | 'support';
  leadSource?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  companySize: string;
  budget: string;
  timeline: string;
  message: string;
}

const LeadIntakeModal = ({ 
  isOpen, 
  onOpenChange, 
  leadType, 
  leadSource = 'contact_sales' 
}: LeadIntakeModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    companySize: '',
    budget: '',
    timeline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypotField, setHoneypotField] = useState('');
  const formLoadTimeRef = useRef<number>(Date.now());

  // Reset form load time when modal opens
  useEffect(() => {
    if (isOpen) {
      formLoadTimeRef.current = Date.now();
      setHoneypotField(''); // Reset honeypot on modal open
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      companySize: '',
      budget: '',
      timeline: '',
      message: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Rate limiting check - limit to 3 submissions per 10 minutes
    const identifier = formData.email || 'anonymous';
    const rateLimitCheck = checkFormSubmissionRate(identifier, 3, 600000); // 10 minutes
    
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.timeUntilReset || 0) / 60000);
      toast({
        title: "Rate Limit Exceeded",
        description: `Too many submissions. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return;
    }
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate form load time in seconds
      const formLoadTimeSeconds = Math.floor((Date.now() - formLoadTimeRef.current) / 1000);

      const { error } = await supabase
        .from('leads')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company,
          job_title: formData.jobTitle || null,
          company_size: formData.companySize || null,
          budget: formData.budget || null,
          timeline: formData.timeline || null,
          message: formData.message || null,
          lead_source: leadSource,
          lead_type: leadType,
          status: 'new',
          // Anti-spam fields
          honeypot_field: honeypotField || null,
          form_load_time: formLoadTimeSeconds
        });

      if (error) {
        console.error('Error submitting lead:', error);
        
        // Handle specific spam-related errors
        if (error.message?.includes('Rate limit exceeded') || 
            error.message?.includes('Submission too fast') ||
            error.message?.includes('Spam detected') ||
            error.message?.includes('Invalid submission') ||
            error.message?.includes('Duplicate submission')) {
          toast({
            title: "Submission Issue",
            description: error.message?.includes('Duplicate') 
              ? "You've already submitted this information recently. Please wait before submitting again."
              : "Your submission couldn't be processed. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Submission Failed",
            description: "There was an error submitting your information. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Thank You!",
        description: leadType === 'sales' 
          ? "Your inquiry has been submitted. Our sales team will contact you within 24 hours."
          : leadType === 'demo'
          ? "Your demo request has been submitted. We'll contact you to schedule your personalized demo."
          : "Your request has been submitted. Our team will get back to you soon.",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Submission Failed",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (leadType) {
      case 'sales':
        return 'Contact Sales Team';
      case 'demo':
        return 'Schedule Demo';
      case 'support':
        return 'Contact Support';
      default:
        return 'Contact Us';
    }
  };

  const getModalIcon = () => {
    switch (leadType) {
      case 'sales':
        return <Mail className="h-5 w-5 text-green-600" />;
      case 'demo':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case 'support':
        return <Mail className="h-5 w-5 text-blue-600" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getSubmitButtonText = () => {
    switch (leadType) {
      case 'sales':
        return 'Contact Sales';
      case 'demo':
        return 'Schedule Demo';
      case 'support':
        return 'Submit Request';
      default:
        return 'Submit';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden honeypot field for spam detection */}
          <input
            type="text"
            name="website"
            value={honeypotField}
            onChange={(e) => setHoneypotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: '0px',
              height: '0px',
              opacity: 0,
              overflow: 'hidden'
            }}
          />
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Enter your job title"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select onValueChange={(value) => handleInputChange('companySize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Information */}
          {leadType === 'sales' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-10k">Under $10,000</SelectItem>
                      <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k+">$100,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="1-3-months">1-3 months</SelectItem>
                      <SelectItem value="3-6-months">3-6 months</SelectItem>
                      <SelectItem value="6-12-months">6-12 months</SelectItem>
                      <SelectItem value="next-year">Next year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={
                leadType === 'sales' 
                  ? "Tell us about your project requirements, goals, or any specific questions you have..."
                  : leadType === 'demo'
                  ? "Tell us what you'd like to see in the demo or any specific features you're interested in..."
                  : "How can we help you? Please provide details about your inquiry..."
              }
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : getSubmitButtonText()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadIntakeModal;