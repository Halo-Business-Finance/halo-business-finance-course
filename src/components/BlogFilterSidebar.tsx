import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Tag, SlidersHorizontal, BookOpen } from "lucide-react";

interface BlogFilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  titleFilter: string;
  onTitleFilterChange: (title: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  counts: {
    all: number;
    [key: string]: number;
  };
}

const FilterContent = ({ 
  selectedCategory, 
  onCategoryChange, 
  titleFilter, 
  onTitleFilterChange,
  selectedDateRange,
  onDateRangeChange,
  counts,
  onCloseSheet
}: BlogFilterSidebarProps & { onCloseSheet?: () => void }) => {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const categories = [
    { id: 'All', label: 'All Categories', count: counts.all },
    { id: 'Commercial Lending', label: 'Commercial Lending', count: counts['Commercial Lending'] || 0 },
    { id: 'Business Finance', label: 'Business Finance', count: counts['Business Finance'] || 0 },
    { id: 'Technology', label: 'Technology', count: counts['Technology'] || 0 },
    { id: 'Career Development', label: 'Career Development', count: counts['Career Development'] || 0 },
    { id: 'Risk Management', label: 'Risk Management', count: counts['Risk Management'] || 0 },
    { id: 'SBA Loans', label: 'SBA Loans', count: counts['SBA Loans'] || 0 },
    { id: 'USDA Loans', label: 'USDA Loans', count: counts['USDA Loans'] || 0 },
    { id: 'Capital Markets', label: 'Capital Markets', count: counts['Capital Markets'] || 0 }
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-3-months', label: 'Last 3 Months' },
    { id: 'last-6-months', label: 'Last 6 Months' },
    { id: 'this-year', label: 'This Year' },
    { id: 'last-year', label: 'Last Year' }
  ];

  const clearAllFilters = () => {
    onCategoryChange('All');
    onTitleFilterChange('');
    onDateRangeChange('all');
  };

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category);
    onCloseSheet?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filter Articles</h3>
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
          Search Articles
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by article title..."
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Subject
        </Label>
        <div className="space-y-2">
          {categories.slice(0, 5).map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className={`w-full justify-between ${
                selectedCategory === category.id 
                  ? 'bg-halo-navy hover:bg-halo-navy/90 text-white'
                  : ''
              } transition-all duration-200`}
            >
              <span>{category.label}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs rounded-full w-6 h-6 flex items-center justify-center ${
                  selectedCategory === category.id 
                    ? 'bg-white text-halo-navy border-white' 
                    : 'bg-halo-navy text-white'
                }`}
              >
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Label>
        <div className="space-y-2">
          {dateRanges.slice(0, 4).map(range => (
            <Button
              key={range.id}
              variant={selectedDateRange === range.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onDateRangeChange(range.id)}
              className={`w-full justify-start ${
                selectedDateRange === range.id 
                  ? 'bg-halo-navy hover:bg-halo-navy/90 text-white'
                  : ''
              }`}
            >
              {range.label}
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
            <Label className="text-sm font-medium">More Subjects</Label>
            <div className="space-y-2">
              {categories.slice(5).map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full justify-between ${
                    selectedCategory === category.id 
                      ? 'bg-halo-navy hover:bg-halo-navy/90 text-white'
                      : ''
                  }`}
                >
                  <span>{category.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs rounded-full w-6 h-6 flex items-center justify-center ${
                      selectedCategory === category.id 
                        ? 'bg-white text-halo-navy border-white' 
                        : 'bg-halo-navy text-white'
                    }`}
                  >
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Date Ranges */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">More Date Options</Label>
            <div className="space-y-2">
              {dateRanges.slice(4).map(range => (
                <Button
                  key={range.id}
                  variant={selectedDateRange === range.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onDateRangeChange(range.id)}
                  className={`w-full justify-start ${
                    selectedDateRange === range.id 
                      ? 'bg-halo-navy hover:bg-halo-navy/90 text-white'
                      : ''
                  }`}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Summary */}
      {(selectedCategory !== 'All' || titleFilter || selectedDateRange !== 'all') && (
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-1">
            {selectedCategory !== 'All' && (
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.id === selectedCategory)?.label}
              </Badge>
            )}
            {selectedDateRange !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {dateRanges.find(d => d.id === selectedDateRange)?.label}
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

export function BlogFilterSidebar(props: BlogFilterSidebarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter & Search Articles
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-6 overflow-y-auto max-h-screen">
            <SheetHeader>
              <SheetTitle>Article Filters</SheetTitle>
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