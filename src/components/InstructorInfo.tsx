import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const InstructorInfo = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Course Instructors
        </CardTitle>
      </CardHeader>
      <CardContent className="py-8">
        <div className="text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-sm">No instructors configured yet.</p>
          <p className="text-xs mt-1">Course instructors will appear here once added.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorInfo;