import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star } from "lucide-react";

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "Commercial Lending Fundamentals",
      description: "Master the basics of commercial lending with comprehensive training modules.",
      duration: "8 weeks",
      students: 1200,
      rating: 4.8,
      level: "Beginner",
      category: "Finance"
    },
    {
      id: 2,
      title: "Advanced Credit Analysis",
      description: "Deep dive into credit analysis techniques and risk assessment.",
      duration: "6 weeks",
      students: 850,
      rating: 4.9,
      level: "Advanced",
      category: "Finance"
    },
    {
      id: 3,
      title: "Business Valuation Methods",
      description: "Learn comprehensive business valuation techniques and methodologies.",
      duration: "10 weeks",
      students: 650,
      rating: 4.7,
      level: "Intermediate",
      category: "Finance"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Course Catalog</h1>
        <p className="text-lg text-muted-foreground">
          Explore our comprehensive collection of professional training courses designed to advance your career.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;