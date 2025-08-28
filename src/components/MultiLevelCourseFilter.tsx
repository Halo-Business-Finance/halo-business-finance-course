
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

// Three-level hierarchy: Categories → User Levels → Module Levels
const categoryHierarchy: CategoryLevel[] = [
  {
    id: "sba",
    name: "SBA Financing",
    count: 84,
    subcategories: [
      {
        id: "sba-beginner",
        name: "Beginner Level",
        count: 28,
        subcategories: [
          { id: "sba-7a-beginner", name: "SBA 7(a) Loan Fundamentals", count: 7 },
          { id: "sba-express-beginner", name: "SBA Express Processing", count: 7 },
          { id: "sba-504-beginner", name: "SBA 504 Real Estate", count: 7 },
          { id: "sba-microloans-beginner", name: "SBA Microloan Strategy", count: 7 }
        ]
      },
      {
        id: "sba-intermediate",
        name: "Intermediate Level", 
        count: 28,
        subcategories: [
          { id: "sba-7a-intermediate", name: "SBA 7(a) Advanced Techniques", count: 7 },
          { id: "sba-express-intermediate", name: "SBA Express Optimization", count: 7 },
          { id: "sba-504-intermediate", name: "SBA 504 Complex Structures", count: 7 },
          { id: "sba-microloans-intermediate", name: "Microloan Portfolio Management", count: 7 }
        ]
      },
      {
        id: "sba-expert",
        name: "Expert Level",
        count: 28,
        subcategories: [
          { id: "sba-7a-expert", name: "SBA 7(a) Master Class", count: 7 },
          { id: "sba-express-expert", name: "SBA Express Innovation", count: 7 },
          { id: "sba-504-expert", name: "SBA 504 Leadership", count: 7 },
          { id: "sba-microloans-expert", name: "Microloan Strategy Expert", count: 7 }
        ]
      }
    ]
  },
  {
    id: "commercial",
    name: "Commercial Lending",
    count: 63,
    subcategories: [
      {
        id: "commercial-beginner",
        name: "Beginner Level",
        count: 21,
        subcategories: [
          { id: "cre-beginner", name: "Commercial Real Estate Analysis", count: 7 },
          { id: "equipment-beginner", name: "Equipment Financing Strategies", count: 7 },
          { id: "working-capital-beginner", name: "Working Capital Solutions", count: 7 }
        ]
      },
      {
        id: "commercial-intermediate",
        name: "Intermediate Level",
        count: 21,
        subcategories: [
          { id: "cre-intermediate", name: "Advanced CRE Analysis", count: 7 },
          { id: "equipment-intermediate", name: "Equipment Finance Optimization", count: 7 },
          { id: "working-capital-intermediate", name: "Complex Working Capital", count: 7 }
        ]
      },
      {
        id: "commercial-expert",
        name: "Expert Level",
        count: 21,
        subcategories: [
          { id: "cre-expert", name: "CRE Master Class", count: 7 },
          { id: "equipment-expert", name: "Equipment Finance Leadership", count: 7 },
          { id: "working-capital-expert", name: "Working Capital Innovation", count: 7 }
        ]
      }
    ]
  },
  {
    id: "specialty",
    name: "Specialty Financing",
    count: 84,
    subcategories: [
      {
        id: "specialty-beginner",
        name: "Beginner Level",
        count: 28,
        subcategories: [
          { id: "factoring-beginner", name: "Invoice Factoring Mastery", count: 7 },
          { id: "mca-beginner", name: "Merchant Cash Advance Training", count: 7 },
          { id: "abl-beginner", name: "Asset-Based Lending Essentials", count: 7 },
          { id: "construction-beginner", name: "Construction Loan Expertise", count: 7 }
        ]
      },
      {
        id: "specialty-intermediate",
        name: "Intermediate Level", 
        count: 28,
        subcategories: [
          { id: "factoring-intermediate", name: "Advanced Invoice Factoring", count: 7 },
          { id: "mca-intermediate", name: "MCA Portfolio Management", count: 7 },
          { id: "abl-intermediate", name: "Complex Asset-Based Lending", count: 7 },
          { id: "construction-intermediate", name: "Advanced Construction Finance", count: 7 }
        ]
      },
      {
        id: "specialty-expert",
        name: "Expert Level",
        count: 28,
        subcategories: [
          { id: "factoring-expert", name: "Factoring Innovation Leader", count: 7 },
          { id: "mca-expert", name: "MCA Strategy Expert", count: 7 },
          { id: "abl-expert", name: "ABL Master Class", count: 7 },
          { id: "construction-expert", name: "Construction Finance Leadership", count: 7 }
        ]
      }
    ]
  },
  {
    id: "industry",
    name: "Industry-Specific Programs",
    count: 42,
    subcategories: [
      {
        id: "industry-beginner",
        name: "Beginner Level",
        count: 14,
        subcategories: [
          { id: "healthcare-beginner", name: "Healthcare Financing Certification", count: 7 },
          { id: "restaurant-beginner", name: "Restaurant Financing Specialist", count: 7 }
        ]
      },
      {
        id: "industry-intermediate",
        name: "Intermediate Level",
        count: 14,
        subcategories: [
          { id: "healthcare-intermediate", name: "Advanced Healthcare Finance", count: 7 },
          { id: "restaurant-intermediate", name: "Restaurant Finance Optimization", count: 7 }
        ]
      },
      {
        id: "industry-expert",
        name: "Expert Level",
        count: 14,
        subcategories: [
          { id: "healthcare-expert", name: "Healthcare Finance Leadership", count: 7 },
          { id: "restaurant-expert", name: "Restaurant Finance Innovation", count: 7 }
        ]
      }
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
      return categoryHierarchy;
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
              
              const categoryName = findCategoryName(categoryHierarchy, categoryId);
              
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
