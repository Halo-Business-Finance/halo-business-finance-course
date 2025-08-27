import { useCourseSelection } from '@/contexts/CourseSelectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';

export const CourseSelector = () => {
  const { selectedCourse, setSelectedCourse, availableCourses, loadingCourses } = useCourseSelection();

  if (loadingCourses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Your Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Your Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No courses available at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Select Your Course
        </CardTitle>
        {selectedCourse && (
          <p className="text-sm text-muted-foreground">
            Currently selected: <span className="font-medium text-primary">{selectedCourse.title}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {availableCourses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourse?.id === course.id ? "default" : "outline"}
              className="justify-between h-auto p-4"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="text-left">
                <div className="font-medium">{course.title}</div>
                {course.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {course.description}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};