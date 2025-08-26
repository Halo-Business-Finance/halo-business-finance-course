import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface SecurityStatusBannerProps {
  classification?: string;
  isEnrolled?: boolean;
}

export const SecurityStatusBanner = ({ classification, isEnrolled }: SecurityStatusBannerProps) => {
  if (classification === 'restricted' && !isEnrolled) {
    return (
      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This content requires enrollment. Sign up to access full course materials.
        </AlertDescription>
      </Alert>
    );
  }

  if (classification === 'preview') {
    return (
      <Alert className="border-primary bg-primary/10">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Preview content - Sign up to access complete lessons and assessments.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};