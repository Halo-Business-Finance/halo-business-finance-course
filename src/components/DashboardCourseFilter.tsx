import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Building2, FileCheck, X, Filter } from "lucide-react";
import { useCourses, Course } from "@/hooks/useCourses";

interface DashboardCourseFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  className?: string;
}

export function DashboardCourseFilter({ 
  selectedCategory, 
  onCategorySelect, 
  className = "" 
}: DashboardCourseFilterProps) {
  const { courses, getCoursesByCategory } = useCourses();
  const [categorizedCourses, setCategorizedCourses] = useState<Record<string, Course[]>>({});

  useEffect(() => {
    if (courses.length > 0) {
      const categories = getCoursesByCategory();
      setCategorizedCourses(categories);
    }
  }, [courses, getCoursesByCategory]);

  const categoryConfig = [
    {
      key: "Loan Originator",
      label: "Loan Originator",
      icon: GraduationCap,
      description: "Sales and client relationship courses",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      key: "Loan Processing", 
      label: "Loan Processor",
      icon: Building2,
      description: "Documentation and workflow courses",
      color: "bg-accent/10 text-accent border-accent/20"
    },
    {
      key: "Loan Underwriting",
      label: "Loan Underwriter", 
      icon: FileCheck,
      description: "Risk assessment and analysis courses",
      color: "bg-secondary/10 text-secondary border-secondary/20"
    }
  ];

  const getTotalCourses = () => {
    return Object.values(categorizedCourses).reduce((total, categoryItems) => total + categoryItems.length, 0);
  };

  const getCategoryCount = (categoryKey: string) => {
    return categorizedCourses[categoryKey]?.length || 0;
  };

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Course Categories</CardTitle>
          </div>
          {selectedCategory && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCategorySelect(null)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Filter courses by specialization area
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* All Courses Option */}
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="w-full justify-start h-auto p-4 text-left"
          onClick={() => onCategorySelect(null)}
        >
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="font-medium">All Courses</div>
              <div className="text-xs text-muted-foreground">
                View all available courses
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">
              {getTotalCourses()}
            </Badge>
          </div>
        </Button>

        <Separator />

        <ScrollArea className="h-auto">
          <div className="space-y-3">
            {categoryConfig.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;
              const count = getCategoryCount(category.key);
              
              return (
                <Button
                  key={category.key}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => onCategorySelect(category.key)}
                  disabled={count === 0}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-foreground/20' : category.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm leading-tight">
                          {category.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-tight">
                          {category.description}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={isSelected ? "secondary" : "outline"} 
                      className="ml-2 shrink-0"
                    >
                      {count}
                    </Badge>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {selectedCategory && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
              <div className="font-medium mb-1">
                Showing {getCategoryCount(selectedCategory)} {selectedCategory} courses
              </div>
              <div>
                These courses are designed for professionals specializing in {selectedCategory.toLowerCase()} roles.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}