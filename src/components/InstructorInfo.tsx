import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface Instructor {
  id: string;
  name: string;
  title: string;
  company: string;
  years_experience: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  display_order: number;
  is_active: boolean;
}
const InstructorInfo = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadInstructors();
  }, []);
  const loadInstructors = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('instructors').select('*').eq('is_active', true).order('display_order', {
        ascending: true
      });
      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Course Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>;
  }
  if (instructors.length === 0) {
    return <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Course Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No instructors available at this time.</p>
        </CardContent>
      </Card>;
  }
  return <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Course Instructors
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3">
          {instructors.map(instructor => <div key={instructor.id} className="flex flex-col space-y-1.5">
              <div>
                <h4 className="font-semibold text-xs">{instructor.name}</h4>
                <p className="text-[10px] text-muted-foreground">{instructor.title}</p>
              </div>
              <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="truncate">{instructor.years_experience}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="truncate">{instructor.company}</span>
                </div>
              </div>
              <p className="text-[10px] leading-snug line-clamp-2">{instructor.bio}</p>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default InstructorInfo;