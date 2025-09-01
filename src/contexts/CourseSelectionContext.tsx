import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useCourses } from '@/hooks/useCourses';

interface SimpleCourse {
  id: string;
  title: string;
  description?: string;
}

interface CourseSelectionContextType {
  selectedCourse: SimpleCourse | null;
  setSelectedCourse: (course: SimpleCourse | null) => void;
  availableCourses: SimpleCourse[];
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
  const [selectedCourse, setSelectedCourse] = useState<SimpleCourse | null>(null);
  const { user } = useAuth();
  const { courses, loading: loadingCourses } = useCourses();

  // Convert courses to the simplified format expected by the context
  const availableCourses: SimpleCourse[] = courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description
  }));

  useEffect(() => {
    // Auto-select first course if none selected and courses are available
    if (!selectedCourse && availableCourses.length > 0) {
      setSelectedCourse(availableCourses[0]);
    }
  }, [availableCourses, selectedCourse]);

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