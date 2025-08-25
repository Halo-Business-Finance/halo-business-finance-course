import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

export type DataRightType = 
  | "access-portability"
  | "correction" 
  | "deletion"
  | "restriction"
  | "objection"
  | "withdraw-consent";

interface DataRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: DataRightType | null;
}

const requestTypeConfig = {
  "access-portability": {
    title: "Request Data Access & Portability",
    description: "Request a copy of your personal data in a portable format",
    formFields: ["format", "reason"],
  },
  "correction": {
    title: "Request Data Correction",
    description: "Update or correct inaccurate personal information",
    formFields: ["dataField", "currentValue", "correctedValue", "reason"],
  },
  "deletion": {
    title: "Request Data Deletion",
    description: "Request deletion of your personal data when no longer needed",
    formFields: ["dataCategory", "reason"],
  },
  "restriction": {
    title: "Request Processing Restriction",
    description: "Limit how we process your personal information",
    formFields: ["dataCategory", "reason"],
  },
  "objection": {
    title: "Object to Data Processing",
    description: "Object to processing based on legitimate interests",
    formFields: ["processingType", "reason"],
  },
  "withdraw-consent": {
    title: "Withdraw Consent",
    description: "Withdraw consent for data processing at any time",
    formFields: ["consentType", "reason"],
  },
};

export const DataRightsModal = ({ isOpen, onClose, requestType }: DataRightsModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const config = requestType ? requestTypeConfig[requestType] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Request Submitted Successfully",
      description: "We'll process your request within 30 days and contact you via email.",
      duration: 5000,
    });
    
    setIsSubmitting(false);
    setFormData({});
    onClose();
  };

  const renderFormField = (field: string) => {
    switch (field) {
      case "format":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Preferred Data Format</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, [field]: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case "dataField":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Data Field to Correct</Label>
            <Input
              id={field}
              placeholder="e.g., Name, Email, Phone Number"
              value={formData[field] || ""}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          </div>
        );
        
      case "currentValue":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Current Incorrect Value</Label>
            <Input
              id={field}
              placeholder="Enter the current incorrect information"
              value={formData[field] || ""}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          </div>
        );
        
      case "correctedValue":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Corrected Value</Label>
            <Input
              id={field}
              placeholder="Enter the correct information"
              value={formData[field] || ""}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          </div>
        );
        
      case "dataCategory":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Data Category</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, [field]: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select data category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">Profile Information</SelectItem>
                <SelectItem value="learning">Learning Data</SelectItem>
                <SelectItem value="communications">Communications</SelectItem>
                <SelectItem value="all">All Personal Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case "processingType":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Processing Type</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, [field]: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select processing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing Communications</SelectItem>
                <SelectItem value="analytics">Data Analytics</SelectItem>
                <SelectItem value="profiling">User Profiling</SelectItem>
                <SelectItem value="other">Other Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case "consentType":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Consent Type</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, [field]: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select consent type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing Emails</SelectItem>
                <SelectItem value="analytics">Analytics Tracking</SelectItem>
                <SelectItem value="cookies">Non-Essential Cookies</SelectItem>
                <SelectItem value="all">All Consents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case "reason":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>Reason for Request (Optional)</Label>
            <Textarea
              id={field}
              placeholder="Please provide additional context for your request..."
              value={formData[field] || ""}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              rows={3}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen || !config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-halo-orange" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.formFields.map(renderFormField)}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Processing Timeline</p>
                <p>We'll process your request within 30 days and contact you via email with updates or any additional information needed.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};