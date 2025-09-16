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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          
          Course Instructors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {instructors.map(instructor => <div key={instructor.id} className="flex items-start gap-4">
            
            <div className="flex-1">
              <h4 className="font-semibold">{instructor.name}</h4>
              <p className="text-sm text-black">{instructor.title}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="text-black">{instructor.years_experience}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-black">{instructor.company}</span>
                </div>
              </div>
              <p className="text-sm mt-2">{instructor.bio}</p>
            </div>
          </div>)}
      </CardContent>
    </Card>;
};
export default InstructorInfo;