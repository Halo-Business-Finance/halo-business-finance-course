import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Tag, GraduationCap, SlidersHorizontal } from "lucide-react";

interface CourseFilterSidebarProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  titleFilter: string;
  onTitleFilterChange: (title: string) => void;
  counts: {
    all: number;
    beginner: number;
    intermediate: number;
    expert: number;
  };
}

const FilterContent = ({ 
  selectedLevel, 
  onLevelChange, 
  titleFilter, 
  onTitleFilterChange, 
  counts,
  onCloseSheet
}: CourseFilterSidebarProps & { onCloseSheet?: () => void }) => {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const skillLevels = [
    { id: 'all', label: 'All Levels', count: counts.all },
    { id: 'beginner', label: 'Beginner', count: counts.beginner },
    { id: 'intermediate', label: 'Intermediate', count: counts.intermediate },
    { id: 'expert', label: 'Expert', count: counts.expert }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', count: counts.all },
    { id: 'commercial-lending', label: 'Commercial Lending', count: Math.floor(counts.all * 0.3) },
    { id: 'credit-analysis', label: 'Credit Analysis', count: Math.floor(counts.all * 0.25) },
    { id: 'risk-management', label: 'Risk Management', count: Math.floor(counts.all * 0.2) },
    { id: 'sba-loans', label: 'SBA Loans', count: Math.floor(counts.all * 0.15) },
    { id: 'compliance', label: 'Compliance', count: Math.floor(counts.all * 0.1) }
  ];

  const durations = [
    { id: 'all', label: 'Any Duration' },
    { id: 'short', label: 'Under 2 hours' },
    { id: 'medium', label: '2-5 hours' },
    { id: 'long', label: '5+ hours' }
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  const clearAllFilters = () => {
    onLevelChange('all');
    onTitleFilterChange('');
    setSelectedCategory('all');
    setSelectedDuration('all');
  };

  const handleLevelChange = (level: string) => {
    onLevelChange(level);
    onCloseSheet?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filter Courses</h3>
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
          Search Courses
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by course title..."
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value)}
          className="w-full"
        />
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
                selectedLevel === level.id && level.id !== 'all'
                  ? getSkillLevelColor(level.id)
                  : 'justify-between'
              } transition-all duration-200`}
            >
              <span>{level.label}</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                {level.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Category
        </Label>
        <div className="space-y-2">
          {categories.slice(0, 4).map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="w-full justify-between"
            >
              <span>{category.label}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
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
          {/* Additional Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">More Categories</Label>
            <div className="space-y-2">
              {categories.slice(4).map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="w-full justify-between"
                >
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Duration
            </Label>
            <div className="space-y-2">
              {durations.map(duration => (
                <Button
                  key={duration.id}
                  variant={selectedDuration === duration.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDuration(duration.id)}
                  className="w-full justify-start"
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Summary */}
      {(selectedLevel !== 'all' || titleFilter || selectedCategory !== 'all' || selectedDuration !== 'all') && (
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-1">
            {selectedLevel !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {skillLevels.find(l => l.id === selectedLevel)?.label}
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.id === selectedCategory)?.label}
              </Badge>
            )}
            {selectedDuration !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {durations.find(d => d.id === selectedDuration)?.label}
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

export function CourseFilterSidebar(props: CourseFilterSidebarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter & Search Courses
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-6">
            <SheetHeader>
              <SheetTitle>Course Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...props} onCloseSheet={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <Card className="hidden lg:block sticky top-4 h-fit w-full p-6 bg-background border shadow-lg">
        <FilterContent {...props} />
      </Card>
    </>
  );
}