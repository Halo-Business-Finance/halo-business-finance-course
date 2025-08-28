
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
      {
        id: "sba-7a-loans-beginner",
        name: "Beginner Level",
        count: 7,
        subcategories: [
          { id: "sba-7a-loans-beginner-module-1", name: "SBA 7(a) Fundamentals", count: 1 },
          { id: "sba-7a-loans-beginner-module-2", name: "Basic Eligibility Requirements", count: 1 },
          { id: "sba-7a-loans-beginner-module-3", name: "Application Process", count: 1 },
          { id: "sba-7a-loans-beginner-module-4", name: "Documentation Requirements", count: 1 },
          { id: "sba-7a-loans-beginner-module-5", name: "Basic Underwriting", count: 1 },
          { id: "sba-7a-loans-beginner-module-6", name: "SBA Guidelines", count: 1 },
          { id: "sba-7a-loans-beginner-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "sba-7a-loans-intermediate",
        name: "Intermediate Level",
        count: 7,
        subcategories: [
          { id: "sba-7a-loans-intermediate-module-1", name: "Advanced Underwriting", count: 1 },
          { id: "sba-7a-loans-intermediate-module-2", name: "Complex Eligibility Scenarios", count: 1 },
          { id: "sba-7a-loans-intermediate-module-3", name: "Risk Assessment", count: 1 },
          { id: "sba-7a-loans-intermediate-module-4", name: "Portfolio Management", count: 1 },
          { id: "sba-7a-loans-intermediate-module-5", name: "Compliance Issues", count: 1 },
          { id: "sba-7a-loans-intermediate-module-6", name: "Case Studies", count: 1 },
          { id: "sba-7a-loans-intermediate-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "sba-7a-loans-expert",
        name: "Expert Level",
        count: 7,
        subcategories: [
          { id: "sba-7a-loans-expert-module-1", name: "Portfolio Optimization", count: 1 },
          { id: "sba-7a-loans-expert-module-2", name: "Advanced Risk Mitigation", count: 1 },
          { id: "sba-7a-loans-expert-module-3", name: "Strategic Planning", count: 1 },
          { id: "sba-7a-loans-expert-module-4", name: "Market Analysis", count: 1 },
          { id: "sba-7a-loans-expert-module-5", name: "Leadership in SBA Lending", count: 1 },
          { id: "sba-7a-loans-expert-module-6", name: "Innovation Strategies", count: 1 },
          { id: "sba-7a-loans-expert-module-7", name: "Final Assessment", count: 1 }
        ]
      }
    ]
  },
  {
    id: "sba-express",
    name: "SBA Express Loans",
    count: 21,
    subcategories: [
      {
        id: "sba-express-beginner",
        name: "Beginner Level",
        count: 7,
        subcategories: [
          { id: "sba-express-beginner-module-1", name: "Express Program Basics", count: 1 },
          { id: "sba-express-beginner-module-2", name: "Fast-Track Processing", count: 1 },
          { id: "sba-express-beginner-module-3", name: "Application Requirements", count: 1 },
          { id: "sba-express-beginner-module-4", name: "Documentation Process", count: 1 },
          { id: "sba-express-beginner-module-5", name: "Basic Guidelines", count: 1 },
          { id: "sba-express-beginner-module-6", name: "Customer Service", count: 1 },
          { id: "sba-express-beginner-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "sba-express-intermediate",
        name: "Intermediate Level",
        count: 7,
        subcategories: [
          { id: "sba-express-intermediate-module-1", name: "Advanced Processing", count: 1 },
          { id: "sba-express-intermediate-module-2", name: "Complex Applications", count: 1 },
          { id: "sba-express-intermediate-module-3", name: "Risk Management", count: 1 },
          { id: "sba-express-intermediate-module-4", name: "Portfolio Analysis", count: 1 },
          { id: "sba-express-intermediate-module-5", name: "Compliance Standards", count: 1 },
          { id: "sba-express-intermediate-module-6", name: "Performance Metrics", count: 1 },
          { id: "sba-express-intermediate-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "sba-express-expert",
        name: "Expert Level",
        count: 7,
        subcategories: [
          { id: "sba-express-expert-module-1", name: "Express Program Leadership", count: 1 },
          { id: "sba-express-expert-module-2", name: "Strategic Implementation", count: 1 },
          { id: "sba-express-expert-module-3", name: "Process Innovation", count: 1 },
          { id: "sba-express-expert-module-4", name: "Team Management", count: 1 },
          { id: "sba-express-expert-module-5", name: "Market Development", count: 1 },
          { id: "sba-express-expert-module-6", name: "Best Practices", count: 1 },
          { id: "sba-express-expert-module-7", name: "Final Assessment", count: 1 }
        ]
      }
    ]
  },
  {
    id: "commercial-real-estate",
    name: "Commercial Real Estate",
    count: 21,
    subcategories: [
      {
        id: "commercial-real-estate-beginner",
        name: "Beginner Level",
        count: 7,
        subcategories: [
          { id: "commercial-real-estate-beginner-module-1", name: "CRE Fundamentals", count: 1 },
          { id: "commercial-real-estate-beginner-module-2", name: "Property Analysis", count: 1 },
          { id: "commercial-real-estate-beginner-module-3", name: "Market Evaluation", count: 1 },
          { id: "commercial-real-estate-beginner-module-4", name: "Financial Modeling", count: 1 },
          { id: "commercial-real-estate-beginner-module-5", name: "Risk Assessment", count: 1 },
          { id: "commercial-real-estate-beginner-module-6", name: "Due Diligence", count: 1 },
          { id: "commercial-real-estate-beginner-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "commercial-real-estate-intermediate",
        name: "Intermediate Level",
        count: 7,
        subcategories: [
          { id: "commercial-real-estate-intermediate-module-1", name: "Advanced Analysis", count: 1 },
          { id: "commercial-real-estate-intermediate-module-2", name: "Complex Transactions", count: 1 },
          { id: "commercial-real-estate-intermediate-module-3", name: "Portfolio Management", count: 1 },
          { id: "commercial-real-estate-intermediate-module-4", name: "Market Trends", count: 1 },
          { id: "commercial-real-estate-intermediate-module-5", name: "Regulatory Compliance", count: 1 },
          { id: "commercial-real-estate-intermediate-module-6", name: "Investment Strategies", count: 1 },
          { id: "commercial-real-estate-intermediate-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "commercial-real-estate-expert",
        name: "Expert Level",
        count: 7,
        subcategories: [
          { id: "commercial-real-estate-expert-module-1", name: "CRE Leadership", count: 1 },
          { id: "commercial-real-estate-expert-module-2", name: "Strategic Planning", count: 1 },
          { id: "commercial-real-estate-expert-module-3", name: "Market Innovation", count: 1 },
          { id: "commercial-real-estate-expert-module-4", name: "Team Development", count: 1 },
          { id: "commercial-real-estate-expert-module-5", name: "Advanced Modeling", count: 1 },
          { id: "commercial-real-estate-expert-module-6", name: "Industry Expertise", count: 1 },
          { id: "commercial-real-estate-expert-module-7", name: "Final Assessment", count: 1 }
        ]
      }
    ]
  },
  {
    id: "equipment-financing",
    name: "Equipment Financing",
    count: 21,
    subcategories: [
      {
        id: "equipment-financing-beginner",
        name: "Beginner Level",
        count: 7,
        subcategories: [
          { id: "equipment-financing-beginner-module-1", name: "Equipment Finance Basics", count: 1 },
          { id: "equipment-financing-beginner-module-2", name: "Lease vs Purchase", count: 1 },
          { id: "equipment-financing-beginner-module-3", name: "Vendor Programs", count: 1 },
          { id: "equipment-financing-beginner-module-4", name: "Credit Analysis", count: 1 },
          { id: "equipment-financing-beginner-module-5", name: "Documentation", count: 1 },
          { id: "equipment-financing-beginner-module-6", name: "Industry Overview", count: 1 },
          { id: "equipment-financing-beginner-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "equipment-financing-intermediate",
        name: "Intermediate Level",
        count: 7,
        subcategories: [
          { id: "equipment-financing-intermediate-module-1", name: "Advanced Structures", count: 1 },
          { id: "equipment-financing-intermediate-module-2", name: "Complex Transactions", count: 1 },
          { id: "equipment-financing-intermediate-module-3", name: "Portfolio Management", count: 1 },
          { id: "equipment-financing-intermediate-module-4", name: "Risk Mitigation", count: 1 },
          { id: "equipment-financing-intermediate-module-5", name: "Vendor Relations", count: 1 },
          { id: "equipment-financing-intermediate-module-6", name: "Market Analysis", count: 1 },
          { id: "equipment-financing-intermediate-module-7", name: "Final Assessment", count: 1 }
        ]
      },
      {
        id: "equipment-financing-expert",
        name: "Expert Level",
        count: 7,
        subcategories: [
          { id: "equipment-financing-expert-module-1", name: "Strategic Leadership", count: 1 },
          { id: "equipment-financing-expert-module-2", name: "Innovation Strategies", count: 1 },
          { id: "equipment-financing-expert-module-3", name: "Team Management", count: 1 },
          { id: "equipment-financing-expert-module-4", name: "Market Development", count: 1 },
          { id: "equipment-financing-expert-module-5", name: "Advanced Analytics", count: 1 },
          { id: "equipment-financing-expert-module-6", name: "Industry Expertise", count: 1 },
          { id: "equipment-financing-expert-module-7", name: "Final Assessment", count: 1 }
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
