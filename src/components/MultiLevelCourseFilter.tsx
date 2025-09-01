
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, Layers, ChevronRight, ArrowLeft, Home } from "lucide-react";

interface CategoryLevel {
  id: string;
  name: string;
  count: number;
  subcategories?: CategoryLevel[];
}

interface MultiLevelCourseFilterProps {
  onFilterChange: (selectedCategories: string[], searchTerm: string, currentLevel: number, navigationPath: CategoryLevel[]) => void;
  totalCount: number;
}

// Three-level hierarchy: Course Categories → Course Types → Individual Modules
const coursePrograms: CategoryLevel[] = [
  {
    id: "loan-originator",
    name: "Loan Originator",
    count: 0, // Will be populated dynamically based on actual courses
    subcategories: []
  },
  {
    id: "loan-processing",
    name: "Loan Processing",
    count: 4, // Current count based on existing courses
    subcategories: [
      { id: "equipment-loan-processing", name: "Equipment Loan Processing", count: 7 },
      { id: "bridge-loan-processing", name: "Bridge Loan Processing", count: 7 },
      { id: "agriculture-loan-processing", name: "Agriculture Loan Processing", count: 7 },
      { id: "apartment-multifamily-processing", name: "Apartment & Multi-Family Loan Processing", count: 7 }
    ]
  },
  {
    id: "loan-underwriting",
    name: "Loan Underwriting",
    count: 6, // Current count based on existing courses
    subcategories: [
      { id: "sba-loan-underwriting", name: "SBA Loan Underwriting", count: 7 },
      { id: "construction-loan-underwriting", name: "Construction Loan Underwriting", count: 7 },
      { id: "usda-loan-underwriting", name: "USDA Loan Underwriting", count: 7 },
      { id: "equipment-finance-loan-underwriting", name: "Equipment Finance Loan Underwriting", count: 7 },
      { id: "bridge-loan-underwriting", name: "Bridge Loan Underwriting", count: 7 },
      { id: "commercial-loan-underwriting", name: "Commercial Loan Underwriting", count: 7 }
    ]
  }
];

const FilterContent = ({ 
  onFilterChange, 
  totalCount,
  onCloseSheet 
}: MultiLevelCourseFilterProps & { onCloseSheet?: () => void }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLevel, setCurrentLevel] = useState(0); // 0=categories, 1=user levels, 2=modules
  const [navigationPath, setNavigationPath] = useState<CategoryLevel[]>([]);

  useEffect(() => {
    onFilterChange(selectedCategories, searchTerm, currentLevel, navigationPath);
  }, [selectedCategories, searchTerm, currentLevel, navigationPath, onFilterChange]);

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
    setCurrentLevel(0);
    setNavigationPath([]);
  };

  const navigateToLevel = (level: number, category?: CategoryLevel) => {
    setCurrentLevel(level);
    if (category) {
      setNavigationPath(prev => [...prev.slice(0, level), category]);
    }
  };

  const goBack = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
      setNavigationPath(prev => prev.slice(0, -1));
    }
  };

  const getCurrentCategories = () => {
    if (currentLevel === 0) {
      return coursePrograms;
    } else if (currentLevel === 1) {
      return navigationPath[0]?.subcategories || [];
    } else {
      return navigationPath[1]?.subcategories || [];
    }
  };

  const getCurrentTitle = () => {
    if (currentLevel === 0) {
      return "Course Categories";
    } else if (currentLevel === 1) {
      return `${navigationPath[0]?.name} - Course Types`;
    } else {
      return `${navigationPath[0]?.name} - ${navigationPath[1]?.name} - Modules`;
    }
  };

  const categories = getCurrentCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-base">Course Filter</h3>
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

      {/* Navigation Breadcrumb */}
      {currentLevel > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentLevel(0);
              setNavigationPath([]);
            }}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <Home className="h-3 w-3" />
          </Button>
          {currentLevel > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              <span className="text-xs">Back</span>
            </Button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-xs font-medium flex items-center gap-2">
          <Search className="h-3 w-3" />
          Search Courses
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Current Level Categories */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-3">
          {getCurrentTitle()}
        </div>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategories.includes(category.id) ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              if (currentLevel === 2 || !category.subcategories) {
                // At module level or no subcategories - select the item
                toggleCategorySelection(category.id);
                onCloseSheet?.();
              } else {
                // Navigate deeper
                navigateToLevel(currentLevel + 1, category);
              }
            }}
            className={`w-full justify-between group hover:bg-accent transition-all duration-200 ${
              selectedCategories.includes(category.id) 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : ''
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="truncate text-xs">{category.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs rounded-full w-7 h-4 flex items-center justify-center ${
                  selectedCategories.includes(category.id) 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {category.count}
              </Badge>
              {(currentLevel < 2 && category.subcategories) && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </Button>
        ))}
      </div>

      {/* Selected Categories Summary */}
      {selectedCategories.length > 0 && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Selected Courses ({selectedCategories.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(categoryId => {
              // Find category name from any level
              const findCategoryName = (categories: CategoryLevel[], id: string): string => {
                for (const cat of categories) {
                  if (cat.id === id) return cat.name;
                  if (cat.subcategories) {
                    const found = findCategoryName(cat.subcategories, id);
                    if (found) return found;
                  }
                }
                return id;
              };
              
              const categoryName = findCategoryName(coursePrograms, categoryId);
              
              return (
                <Badge 
                  key={categoryId} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => toggleCategorySelection(categoryId)}
                >
                  {categoryName} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Results Summary */}
      <div className="pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          {selectedCategories.length > 0 || searchTerm ? (
            <>Showing filtered results</>
          ) : (
            <>Total: {totalCount} modules available</>
          )}
        </div>
      </div>
    </div>
  );
};

export function MultiLevelCourseFilter(props: MultiLevelCourseFilterProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-3 w-3 mr-2" />
              <span className="text-xs">Course Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-6 overflow-y-auto max-h-screen">
            <SheetHeader>
              <SheetTitle>Course Filter</SheetTitle>
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
