
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
  onFilterChange: (selectedCategories: string[], searchTerm: string) => void;
  totalCount: number;
}

// Three-level hierarchy: Course Programs → User Levels → Individual Modules
const coursePrograms: CategoryLevel[] = [
  {
    id: "sba-7a-loans",
    name: "SBA 7(a) Loans",
    count: 21,
    subcategories: [
      { id: "sba-7a-loans-beginner", name: "Beginner Level", count: 7 },
      { id: "sba-7a-loans-intermediate", name: "Intermediate Level", count: 7 },
      { id: "sba-7a-loans-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "sba-express",
    name: "SBA Express Loans", 
    count: 21,
    subcategories: [
      { id: "sba-express-beginner", name: "Beginner Level", count: 7 },
      { id: "sba-express-intermediate", name: "Intermediate Level", count: 7 },
      { id: "sba-express-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "commercial-real-estate",
    name: "Commercial Real Estate Financing",
    count: 21,
    subcategories: [
      { id: "commercial-real-estate-beginner", name: "Beginner Level", count: 7 },
      { id: "commercial-real-estate-intermediate", name: "Intermediate Level", count: 7 },
      { id: "commercial-real-estate-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "equipment-financing",
    name: "Equipment Financing",
    count: 21,
    subcategories: [
      { id: "equipment-financing-beginner", name: "Beginner Level", count: 7 },
      { id: "equipment-financing-intermediate", name: "Intermediate Level", count: 7 },
      { id: "equipment-financing-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "business-lines-credit",
    name: "Business Lines of Credit",
    count: 21,
    subcategories: [
      { id: "business-lines-credit-beginner", name: "Beginner Level", count: 7 },
      { id: "business-lines-credit-intermediate", name: "Intermediate Level", count: 7 },
      { id: "business-lines-credit-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "invoice-factoring",
    name: "Invoice Factoring",
    count: 21,
    subcategories: [
      { id: "invoice-factoring-beginner", name: "Beginner Level", count: 7 },
      { id: "invoice-factoring-intermediate", name: "Intermediate Level", count: 7 },
      { id: "invoice-factoring-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "merchant-cash-advances",
    name: "Merchant Cash Advances",
    count: 21,
    subcategories: [
      { id: "merchant-cash-advances-beginner", name: "Beginner Level", count: 7 },
      { id: "merchant-cash-advances-intermediate", name: "Intermediate Level", count: 7 },
      { id: "merchant-cash-advances-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "asset-based-lending",
    name: "Asset-Based Lending",
    count: 21,
    subcategories: [
      { id: "asset-based-lending-beginner", name: "Beginner Level", count: 7 },
      { id: "asset-based-lending-intermediate", name: "Intermediate Level", count: 7 },
      { id: "asset-based-lending-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "construction-loans",
    name: "Construction Loans",
    count: 21,
    subcategories: [
      { id: "construction-loans-beginner", name: "Beginner Level", count: 7 },
      { id: "construction-loans-intermediate", name: "Intermediate Level", count: 7 },
      { id: "construction-loans-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "franchise-financing",
    name: "Franchise Financing",
    count: 21,
    subcategories: [
      { id: "franchise-financing-beginner", name: "Beginner Level", count: 7 },
      { id: "franchise-financing-intermediate", name: "Intermediate Level", count: 7 },
      { id: "franchise-financing-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "working-capital",
    name: "Working Capital Loans",
    count: 21,
    subcategories: [
      { id: "working-capital-beginner", name: "Beginner Level", count: 7 },
      { id: "working-capital-intermediate", name: "Intermediate Level", count: 7 },
      { id: "working-capital-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "healthcare-financing",
    name: "Healthcare Financing",
    count: 21,
    subcategories: [
      { id: "healthcare-financing-beginner", name: "Beginner Level", count: 7 },
      { id: "healthcare-financing-intermediate", name: "Intermediate Level", count: 7 },
      { id: "healthcare-financing-expert", name: "Expert Level", count: 7 }
    ]
  },
  {
    id: "restaurant-financing",
    name: "Restaurant Financing",
    count: 21,
    subcategories: [
      { id: "restaurant-financing-beginner", name: "Beginner Level", count: 7 },
      { id: "restaurant-financing-intermediate", name: "Intermediate Level", count: 7 },
      { id: "restaurant-financing-expert", name: "Expert Level", count: 7 }
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
    onFilterChange(selectedCategories, searchTerm);
  }, [selectedCategories, searchTerm, onFilterChange]);

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
      return "Loan Program Categories";
    } else if (currentLevel === 1) {
      return `${navigationPath[0]?.name} - User Levels`;
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
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Loan Program Filter</h3>
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
            <Home className="h-4 w-4" />
          </Button>
          {currentLevel > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Loan Programs
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search loan programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Current Level Categories */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-3">
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
              <span className="truncate">{category.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs rounded-full w-8 h-5 flex items-center justify-center ${
                  selectedCategories.includes(category.id) 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {category.count}
              </Badge>
              {(currentLevel < 2 && category.subcategories) && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        ))}
      </div>

      {/* Selected Categories Summary */}
      {selectedCategories.length > 0 && (
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            Selected Programs ({selectedCategories.length}):
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
        <div className="text-sm text-muted-foreground">
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
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Loan Program Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-6 overflow-y-auto max-h-screen">
            <SheetHeader>
              <SheetTitle>Loan Program Course Filter</SheetTitle>
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
