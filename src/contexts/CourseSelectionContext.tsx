import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SimpleCourse {
  id: string;
  title: string;
  description?: string;
  enrollment_status?: 'active' | 'locked_studying_other' | 'completed';
  is_active_study?: boolean;
  started_module_id?: string;
}

interface CourseSelectionContextType {
  selectedCourse: SimpleCourse | null;
  setSelectedCourse: (course: SimpleCourse | null) => void;
  availableCourses: SimpleCourse[];
  loadingCourses: boolean;
  canSelectCourse: (courseId: string) => boolean;
  getActiveStudyCourse: () => SimpleCourse | null;
  refreshCourses: () => Promise<void>;
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
  const [availableCourses, setAvailableCourses] = useState<SimpleCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!user) {
      setAvailableCourses([]);
      setSelectedCourse(null);
      setLoadingCourses(false);
      return;
    }

    try {
      setLoadingCourses(true);
      
      // First get enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('course_id, status, is_active_study, started_module_id')
        .eq('user_id', user.id);

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        setAvailableCourses([]);
        setSelectedCourse(null);
        setLoadingCourses(false);
        return;
      }

      // Get course details for enrolled courses
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, is_active')
        .in('id', courseIds)
        .eq('is_active', true);

      if (coursesError) throw coursesError;

      // Combine enrollment and course data
      const coursesWithStatus: SimpleCourse[] = (courses || [])
        .map(course => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            enrollment_status: enrollment?.status as 'active' | 'locked_studying_other' | 'completed',
            is_active_study: enrollment?.is_active_study,
            started_module_id: enrollment?.started_module_id,
          };
        });

      setAvailableCourses(coursesWithStatus);

      // Set selected course to the active study course or first available
      const activeStudyCourse = coursesWithStatus.find(course => course.is_active_study);
      if (activeStudyCourse && !selectedCourse) {
        setSelectedCourse(activeStudyCourse);
      } else if (!activeStudyCourse && !selectedCourse && coursesWithStatus.length > 0) {
        // If no active study course, select the first available course
        const availableCourse = coursesWithStatus.find(course => course.enrollment_status === 'active');
        if (availableCourse) {
          setSelectedCourse(availableCourse);
        }
      }

    } catch (error) {
      console.error('Error fetching courses:', error);
      if (toast) {
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  const canSelectCourse = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return false;
    
    // Users can only select courses with 'active' status
    return course.enrollment_status === 'active';
  };

  const getActiveStudyCourse = () => {
    return availableCourses.find(course => course.is_active_study) || null;
  };

  const handleCourseSelection = (course: SimpleCourse | null) => {
    if (course && !canSelectCourse(course.id)) {
      if (toast) {
        toast({
          title: "Course Locked",
          description: "Complete your current course before starting a new one.",
          variant: "destructive",
        });
      }
      return;
    }
    setSelectedCourse(course);
  };

  const handleCourseSelectionForNavigation = (course: SimpleCourse | null) => {
    // Set course for navigation context without validation
    setSelectedCourse(course);
  };

  const refreshCourses = async () => {
    await fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  return (
    <CourseSelectionContext.Provider
      value={{
        selectedCourse,
        setSelectedCourse: handleCourseSelection,
        availableCourses,
        loadingCourses,
        canSelectCourse,
        getActiveStudyCourse,
        refreshCourses,
      }}
    >
      {children}
    </CourseSelectionContext.Provider>
  );
};