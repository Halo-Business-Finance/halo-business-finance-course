import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCourses, Course } from "@/hooks/useCourses";
import { GraduationCap, FileText, ClipboardCheck, Sparkles } from "lucide-react";

interface DashboardCourseFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
  className?: string;
}

export function DashboardCourseFilter({
  selectedCategory,
  onCategorySelect,
  selectedTopic,
  onTopicSelect,
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
    { key: "Loan Originator", label: "Loan Originator", icon: GraduationCap },
    { key: "Loan Processing", label: "Loan Processor", icon: FileText },
    { key: "Loan Underwriting", label: "Loan Underwriter", icon: ClipboardCheck },
  ];

  const filterTopics = [
    { label: "Featured", icon: Sparkles },
    { label: "SBA Lending" },
    { label: "Commercial Real Estate" },
    { label: "Equipment Financing" },
    { label: "Working Capital" },
    { label: "Credit Analysis" },
    { label: "Risk Management" },
  ];

  const getCategoryCount = (categoryKey: string) => {
    return categorizedCourses[categoryKey]?.length || 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Category Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onCategorySelect(null)}
          className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              : "bg-background border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30"
          }`}
        >
          All Programs
        </Button>
        
        {categoryConfig.map((category) => {
          const count = getCategoryCount(category.key);
          const Icon = category.icon;
          const isSelected = selectedCategory === category.key;
          
          return (
            <Button
              key={category.key}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onCategorySelect(category.key)}
              disabled={count === 0}
              className={`h-11 px-6 rounded-lg font-medium transition-all duration-200 gap-2 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  : "bg-background border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 disabled:opacity-40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.label}
              {count > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {filterTopics.map((topic, index) => {
          const isSelected = selectedTopic === topic.label;
          
          return (
            <button
              key={index}
              onClick={() => onTopicSelect(isSelected ? null : topic.label)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50"
              }`}
            >
              {topic.icon && <topic.icon className="h-3.5 w-3.5" />}
              {topic.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
