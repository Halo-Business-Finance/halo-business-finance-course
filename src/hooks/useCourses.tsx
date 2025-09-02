import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'expert' | 'none';
  image_url?: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseData {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'expert' | 'none';
  image_url?: string;
  order_index?: number;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  is_active?: boolean;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Type assertion to ensure data matches our Course interface
      const typedCourses = (data || []).map(course => ({
        ...course,
        level: course.level as 'beginner' | 'expert' | 'none'
      }));

      setCourses(typedCourses);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new course
  const createCourse = async (courseData: CreateCourseData): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          is_active: true,
          order_index: courseData.order_index || 0,
        }])
        .select()
        .single();

      if (error) throw error;

      const typedCourse = {
        ...data,
        level: data.level as 'beginner' | 'expert' | 'none'
      };

      setCourses(prev => [...prev, typedCourse].sort((a, b) => a.order_index - b.order_index));
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });

      return typedCourse;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating course:', err);
      return null;
    }
  };

  // Update an existing course
  const updateCourse = async (id: string, updates: UpdateCourseData): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedCourse = {
        ...data,
        level: data.level as 'beginner' | 'expert' | 'none'
      };

      setCourses(prev => 
        prev.map(course => 
          course.id === id ? typedCourse : course
        ).sort((a, b) => a.order_index - b.order_index)
      );

      toast({
        title: "Success",
        description: "Course updated successfully",
      });

      return typedCourse;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating course:', err);
      return null;
    }
  };

  // Delete a course
  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== id));

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting course:', err);
      return false;
    }
  };

  // Get courses grouped by category (Loan Originator, Loan Processing, Loan Underwriting)
  const getCoursesByCategory = () => {
    return courses.reduce((acc, course) => {
      let category = 'Loan Originator'; // Default category
      
      if (course.title.toLowerCase().includes('processing')) {
        category = 'Loan Processing';
      } else if (course.title.toLowerCase().includes('underwriting')) {
        category = 'Loan Underwriting';
      } else if (course.title.toLowerCase().includes('originator') || course.title.toLowerCase().includes('origination')) {
        category = 'Loan Originator';
      }
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(course);
      return acc;
    }, {} as Record<string, Course[]>);
  };

  // Get courses grouped by type (removing skill level from title) - kept for backward compatibility
  const getCoursesByType = () => {
    return courses.reduce((acc, course) => {
      const baseTitle = course.title.replace(/ - (Beginner|Expert)$/, '');
      if (!acc[baseTitle]) {
        acc[baseTitle] = [];
      }
      acc[baseTitle].push(course);
      return acc;
    }, {} as Record<string, Course[]>);
  };

  // Get unique course types
  const getCourseTypes = () => {
    const types = new Set<string>();
    courses.forEach(course => {
      const baseTitle = course.title.replace(/ - (Beginner|Expert)$/, '');
      types.add(baseTitle);
    });
    return Array.from(types);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByType,
    getCoursesByCategory,
    getCourseTypes,
  };
};