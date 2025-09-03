// Profile editing form component

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import type { UserProfile, UserEditForm } from "@/types";
import { validateRequired, validateEmail, validatePhone } from "@/utils/errorHandling";

interface ProfileEditFormProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UserEditForm>) => Promise<boolean>;
  loading?: boolean;
}

// Phone number formatting utility
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
};

const handlePhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  const limitedDigits = digits.slice(0, 10);
  
  if (limitedDigits.length >= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  } else if (limitedDigits.length >= 3) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else if (limitedDigits.length > 0) {
    return `(${limitedDigits}`;
  }
  
  return "";
};

export const ProfileEditForm = ({
  profile,
  isOpen,
  onClose,
  onSave,
  loading = false
}: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<Partial<UserEditForm>>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || "",
    title: profile.title || "",
    company: profile.company || "",
    location: profile.location || "",
    city: profile.city || "",
    state: profile.state || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof UserEditForm, value: string) => {
    if (field === 'phone') {
      value = handlePhoneInput(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      validateRequired(formData.name, "Name");
    } catch (error) {
      newErrors.name = error instanceof Error ? error.message : "Name is required";
    }

    try {
      validateRequired(formData.email, "Email");
      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } catch (error) {
      newErrors.email = error instanceof Error ? error.message : "Email is required";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      title: profile.title || "",
      company: profile.company || "",
      location: profile.location || "",
      city: profile.city || "",
      state: profile.state || ""
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. All fields except phone are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Your job title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company || ""}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Your city"
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state || ""}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};