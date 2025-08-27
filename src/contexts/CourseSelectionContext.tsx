import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Course {
  id: string;
  title: string;
  description?: string;
}

interface CourseSelectionContextType {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  availableCourses: Course[];
  loadingCourses: boolean;
}

const CourseSelectionContext = createContext<CourseSelectionContextType | undefined>(undefined);

export const useCourseSelection = () => {
  const context = useContext(CourseSelectionContext);
  if (context === undefined) {
    throw new Error('useCourseSelection must be used within a CourseSelectionProvider');
  }
  return context;
};

export const CourseSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAvailableCourses();
    }
  }, [user]);

  const fetchAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      
      // Get unique course IDs from course_modules table
      const { data: modules, error } = await supabase
        .from('course_modules')
        .select('module_id')
        .eq('is_active', true);

      if (error) throw error;

      // Extract unique course identifiers from module_ids
      // Assuming module_id format is like "course-name-module-1"
      const courseIds = new Set<string>();
      modules?.forEach(module => {
        // Extract course part from module_id (everything before the last hyphen and number)
        const parts = module.module_id.split('-');
        if (parts.length > 2) {
          // Reconstruct course name from parts, excluding the last part if it's a number
          const lastPart = parts[parts.length - 1];
          const isLastPartNumber = /^\d+$/.test(lastPart);
          const courseParts = isLastPartNumber ? parts.slice(0, -1) : parts;
          const courseId = courseParts.join('-');
          courseIds.add(courseId);
        }
      });

      // Create course objects
      const courses: Course[] = Array.from(courseIds).map(courseId => ({
        id: courseId,
        title: courseId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }));

      setAvailableCourses(courses);
      
      // Auto-select first course if none selected
      if (!selectedCourse && courses.length > 0) {
        setSelectedCourse(courses[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  return (
    <CourseSelectionContext.Provider
      value={{
        selectedCourse,
        setSelectedCourse,
        availableCourses,
        loadingCourses,
      }}
    >
      {children}
    </CourseSelectionContext.Provider>
  );
};