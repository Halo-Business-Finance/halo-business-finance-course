import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, BookOpen, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CourseModule {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  skill_level: 'beginner' | 'intermediate' | 'expert';
  duration?: string;
  lessons_count: number;
  order_index: number;
  is_active: boolean;
  public_preview: boolean;
}

interface AssociatedModulesViewProps {
  courseId: string;
}

export function AssociatedModulesView({ courseId }: AssociatedModulesViewProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAssociatedModules();
  }, [courseId]);

  const loadAssociatedModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      console.error('Error loading associated modules:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load associated modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelBadge = (level: string) => {
    const variants = {
      beginner: "bg-emerald-100 text-emerald-800",
      intermediate: "bg-amber-100 text-amber-800", 
      expert: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={variants[level as keyof typeof variants] || variants.beginner}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Associated Modules</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This course program doesn't have any associated modules yet. 
            You can create modules and assign them to this course in the Course Modules tab.
          </p>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add First Module
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module) => (
        <Card key={module.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium">{module.title}</h5>
                  {getSkillLevelBadge(module.skill_level)}
                  {!module.is_active && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  {module.public_preview && (
                    <Badge variant="outline" className="text-xs">Public Preview</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ID: {module.module_id}
                </p>
                {module.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {module.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {module.duration || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {module.lessons_count}
                </div>
                <Badge variant="outline" className="text-xs">
                  #{module.order_index}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}