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
      <CardHeader className="pb-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Categories</CardTitle>
          </div>
          {selectedCategory && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCategorySelect(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-0">
        {/* All Courses Option */}
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="w-full justify-start h-auto p-2 text-left"
          onClick={() => onCategorySelect(null)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-medium">All Courses</div>
            <Badge variant="secondary" className="ml-2 text-xs">
              {getTotalCourses()}
            </Badge>
          </div>
        </Button>

        <Separator />

        <ScrollArea className="h-auto">
          <div className="space-y-1.5">
            {categoryConfig.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;
              const count = getCategoryCount(category.key);
              
              return (
                <Button
                  key={category.key}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start h-auto p-2 text-left"
                  onClick={() => onCategorySelect(category.key)}
                  disabled={count === 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${isSelected ? 'bg-primary-foreground/20' : category.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-medium">
                        {category.label}
                      </div>
                    </div>
                    <Badge 
                      variant={isSelected ? "secondary" : "outline"} 
                      className="ml-2 shrink-0 text-xs px-1.5 py-0.5"
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
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded text-center">
              {getCategoryCount(selectedCategory)} {selectedCategory} courses
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}