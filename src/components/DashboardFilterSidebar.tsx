import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Tag, GraduationCap, SlidersHorizontal, BookOpen, Users } from "lucide-react";

interface DashboardFilterSidebarProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  titleFilter: string;
  onTitleFilterChange: (title: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCourse: string;
  onCourseChange: (course: string) => void;
  counts: {
    all: number;
    beginner: number;
    
    expert: number;
  };
}

const FilterContent = ({ 
  selectedLevel, 
  onLevelChange, 
  titleFilter, 
  onTitleFilterChange,
  selectedStatus,
  onStatusChange,
  selectedCourse,
  onCourseChange,
  counts,
  onCloseSheet
}: DashboardFilterSidebarProps & { onCloseSheet?: () => void }) => {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const skillLevels = [
    { id: 'all', label: 'All Levels', count: counts.all },
    { id: 'beginner', label: 'Beginner', count: counts.beginner },
    
    { id: 'expert', label: 'Expert', count: counts.expert }
  ];

  const statuses = [
    { id: 'all', label: 'All Modules', count: counts.all },
    { id: 'available', label: 'Available', count: Math.floor(counts.all * 0.4) },
    { id: 'in-progress', label: 'In Progress', count: Math.floor(counts.all * 0.3) },
    { id: 'completed', label: 'Completed', count: Math.floor(counts.all * 0.3) }
  ];

  const courses = [
    { id: 'all', label: 'All Course Types', count: counts.all },
    { id: 'loan-originator', label: 'Loan Originator', count: Math.floor(counts.all * 0.35) },
    { id: 'loan-processing', label: 'Loan Processing', count: Math.floor(counts.all * 0.33) },
    { id: 'loan-underwriting', label: 'Loan Underwriting', count: Math.floor(counts.all * 0.32) }
  ];

  const clearAllFilters = () => {
    onLevelChange('all');
    onTitleFilterChange('');
    onStatusChange('all');
    onCourseChange('all');
  };

  const handleLevelChange = (level: string) => {
    onLevelChange(level);
    onCloseSheet?.();
  };

  const handleStatusChange = (status: string) => {
    onStatusChange(status);
    onCloseSheet?.();
  };

  const handleCourseChange = (course: string) => {
    onCourseChange(course);
    onCloseSheet?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filter Modules</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Modules
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by module title..."
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Progress Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Progress Status
        </Label>
        <div className="space-y-2">
          {statuses.map(status => (
            <Button
              key={status.id}
              variant={selectedStatus === status.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleStatusChange(status.id)}
              className={`w-full justify-between ${
                selectedStatus === status.id 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'justify-between'
              } transition-all duration-200`}
            >
              <span>{status.label}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs rounded-full w-6 h-6 flex items-center justify-center ${
                  selectedStatus === status.id 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {status.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Skill Level
        </Label>
        <div className="space-y-2">
          {skillLevels.map(level => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLevelChange(level.id)}
              className={`w-full justify-between ${
                selectedLevel === level.id 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'justify-between'
              } transition-all duration-200`}
            >
              <span>{level.label}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs rounded-full w-6 h-6 flex items-center justify-center ${
                  selectedLevel === level.id 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {level.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* More Filters Collapsible */}
      <Collapsible open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="text-sm font-medium">More Filters</span>
            {moreFiltersOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Course Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Course Type
            </Label>
            <div className="space-y-2">
              {courses.map(course => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCourseChange(course.id)}
                  className={`w-full justify-between ${
                    selectedCourse === course.id 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : ''
                  }`}
                >
                  <span className="text-left truncate">{course.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs rounded-full w-6 h-6 flex items-center justify-center ${
                      selectedCourse === course.id 
                        ? 'bg-primary-foreground text-primary' 
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {course.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Summary */}
      {(selectedLevel !== 'all' || titleFilter || selectedStatus !== 'all' || selectedCourse !== 'all') && (
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-1">
            {selectedLevel !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {skillLevels.find(l => l.id === selectedLevel)?.label}
              </Badge>
            )}
            {selectedStatus !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {statuses.find(s => s.id === selectedStatus)?.label}
              </Badge>
            )}
            {selectedCourse !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {courses.find(c => c.id === selectedCourse)?.label}
              </Badge>
            )}
            {titleFilter && (
              <Badge variant="secondary" className="text-xs">
                "{titleFilter}"
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function DashboardFilterSidebar(props: DashboardFilterSidebarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter & Search Modules
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-6 overflow-y-auto max-h-screen">
            <SheetHeader>
              <SheetTitle>Module Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...props} onCloseSheet={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <Card className="hidden lg:block sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto w-full p-6 bg-background border shadow-lg">
        <FilterContent {...props} />
      </Card>
    </>
  );
}