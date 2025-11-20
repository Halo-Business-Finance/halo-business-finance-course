import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCourses, Course } from "@/hooks/useCourses";
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
  const {
    courses,
    getCoursesByCategory
  } = useCourses();
  const [categorizedCourses, setCategorizedCourses] = useState<Record<string, Course[]>>({});
  useEffect(() => {
    if (courses.length > 0) {
      const categories = getCoursesByCategory();
      setCategorizedCourses(categories);
    }
  }, [courses, getCoursesByCategory]);
  const categoryConfig = [{
    key: "Loan Originator",
    label: "Loan Originator"
  }, {
    key: "Loan Processing",
    label: "Loan Processor"
  }, {
    key: "Loan Underwriting",
    label: "Loan Underwriter"
  }];
  
  const filterTopics = [
    "Featured",
    "SBA Lending",
    "Commercial Real Estate",
    "Equipment Financing",
    "Working Capital",
    "Credit Analysis",
    "Risk Management"
  ];
  const getTotalCourses = () => {
    return Object.values(categorizedCourses).reduce((total, categoryItems) => total + categoryItems.length, 0);
  };
  const getCategoryCount = (categoryKey: string) => {
    return categorizedCourses[categoryKey]?.length || 0;
  };
  return <div className={`space-y-4 ${className}`}>
      {/* Main Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          onClick={() => {
            console.log('Clicking All Programs');
            onCategorySelect(null);
          }}
          className={`flex-shrink-0 h-12 px-8 ${
            selectedCategory === null 
              ? "bg-navy-900 hover:bg-navy-800 text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
          }`}
        >
          All Programs
        </Button>
        {categoryConfig.map(category => {
          const count = getCategoryCount(category.key);
          return (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "ghost"}
              onClick={() => {
                console.log('Clicking category:', category.key);
                onCategorySelect(category.key);
              }}
              disabled={count === 0}
              className={`flex-shrink-0 h-12 px-8 ${
                selectedCategory === category.key
                  ? "bg-navy-900 hover:bg-navy-800 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Filter Pills Row */}
      <ScrollArea className="w-full">
        <div className="flex items-center gap-2 pb-2">
          {filterTopics.map((topic, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onTopicSelect(selectedTopic === topic ? null : topic)}
              className={`flex-shrink-0 rounded-full border-2 px-6 h-10 ${
                selectedTopic === topic
                  ? "border-navy-900 bg-navy-900 text-white hover:bg-navy-800"
                  : "border-gray-300 hover:border-navy-900 hover:bg-gray-50"
              }`}
            >
              {topic}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>;
}