import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Award, Calendar } from "lucide-react";

const InstructorInfo = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Course Instructors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            SM
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Sarah Mitchell</h4>
            <p className="text-sm text-muted-foreground">Senior Vice President, Business Finance</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>15+ years experience</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Halo Business Finance</span>
              </div>
            </div>
            <p className="text-sm mt-2">
              Expert in SBA lending and commercial finance with extensive experience 
              in business development and client relationship management.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center text-white font-bold text-lg">
            DT
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">David Thompson</h4>
            <p className="text-sm text-muted-foreground">Director of Credit Analysis</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>12+ years experience</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Halo Business Finance</span>
              </div>
            </div>
            <p className="text-sm mt-2">
              Specialist in risk assessment and credit analysis with deep knowledge 
              of regulatory compliance and underwriting standards.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorInfo;