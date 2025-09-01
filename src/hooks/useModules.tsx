import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration: string;
  lessons_count: number;
  order_index: number;
  topics: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModuleData {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration: string;
  lessons_count: number;
  order_index: number;
  topics?: string[];
  status?: 'locked' | 'available' | 'in-progress' | 'completed';
}

export interface UpdateModuleData extends Partial<CreateModuleData> {
  is_active?: boolean;
}

export const useModules = (courseId?: string) => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch modules (optionally filtered by course)
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('course_content_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Type assertion to ensure data matches our CourseModule interface
      const typedModules = (data || []).map(module => ({
        ...module,
        topics: Array.isArray(module.topics) ? module.topics as string[] : [],
        status: module.status as 'locked' | 'available' | 'in-progress' | 'completed'
      }));

      setModules(typedModules);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch modules';
      setError(errorMessage);
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new module
  const createModule = async (moduleData: CreateModuleData): Promise<CourseModule | null> => {
    try {
      const { data, error } = await supabase
        .from('course_content_modules')
        .insert([{
          ...moduleData,
          topics: moduleData.topics || [],
          status: moduleData.status || 'locked',
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;

      const typedModule = {
        ...data,
        topics: Array.isArray(data.topics) ? data.topics as string[] : [],
        status: data.status as 'locked' | 'available' | 'in-progress' | 'completed'
      };

      setModules(prev => [...prev, typedModule].sort((a, b) => a.order_index - b.order_index));
      
      toast({
        title: "Success",
        description: "Module created successfully",
      });

      return typedModule;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create module';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating module:', err);
      return null;
    }
  };

  // Update an existing module
  const updateModule = async (id: string, updates: UpdateModuleData): Promise<CourseModule | null> => {
    try {
      const { data, error } = await supabase
        .from('course_content_modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedModule = {
        ...data,
        topics: Array.isArray(data.topics) ? data.topics as string[] : [],
        status: data.status as 'locked' | 'available' | 'in-progress' | 'completed'
      };

      setModules(prev => 
        prev.map(module => 
          module.id === id ? typedModule : module
        ).sort((a, b) => a.order_index - b.order_index)
      );

      toast({
        title: "Success",
        description: "Module updated successfully",
      });

      return typedModule;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update module';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating module:', err);
      return null;
    }
  };

  // Delete a module
  const deleteModule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('course_content_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setModules(prev => prev.filter(module => module.id !== id));

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete module';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting module:', err);
      return false;
    }
  };

  // Get modules by course
  const getModulesByCourse = (targetCourseId: string) => {
    return modules.filter(module => module.course_id === targetCourseId);
  };

  // Get module statistics
  const getModuleStats = (targetCourseId?: string) => {
    const filteredModules = targetCourseId 
      ? modules.filter(m => m.course_id === targetCourseId)
      : modules;

    const total = filteredModules.length;
    const completed = filteredModules.filter(m => m.status === 'completed').length;
    const inProgress = filteredModules.filter(m => m.status === 'in-progress').length;
    const available = filteredModules.filter(m => m.status === 'available').length;

    return {
      total,
      completed,
      inProgress,
      available,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  return {
    modules,
    loading,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    getModulesByCourse,
    getModuleStats,
  };
};