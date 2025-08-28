
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter, ChevronRight, ChevronLeft, SlidersHorizontal, ArrowLeft, Home, Layers } from "lucide-react";

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

const categoryHierarchy: CategoryLevel[] = [
  {
    id: "sba",
    name: "SBA Financing",
    count: 84,
    subcategories: [
      {
        id: "sba-7a",
        name: "SBA 7(a) Loan Fundamentals",
        count: 21,
        subcategories: [
          { id: "sba-7a-beginner", name: "Beginner Level", count: 7 },
          { id: "sba-7a-intermediate", name: "Intermediate Level", count: 7 },
          { id: "sba-7a-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "sba-express",
        name: "SBA Express Processing",
        count: 21,
        subcategories: [
          { id: "sba-express-beginner", name: "Beginner Level", count: 7 },
          { id: "sba-express-intermediate", name: "Intermediate Level", count: 7 },
          { id: "sba-express-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "sba-504",
        name: "SBA 504 Real Estate",
        count: 21,
        subcategories: [
          { id: "sba-504-beginner", name: "Beginner Level", count: 7 },
          { id: "sba-504-intermediate", name: "Intermediate Level", count: 7 },
          { id: "sba-504-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "sba-microloans",
        name: "SBA Microloan Strategy",
        count: 21,
        subcategories: [
          { id: "sba-microloans-beginner", name: "Beginner Level", count: 7 },
          { id: "sba-microloans-intermediate", name: "Intermediate Level", count: 7 },
          { id: "sba-microloans-expert", name: "Expert Level", count: 7 }
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
        id: "commercial-real-estate",
        name: "Commercial Real Estate Analysis",
        count: 21,
        subcategories: [
          { id: "cre-beginner", name: "Beginner Level", count: 7 },
          { id: "cre-intermediate", name: "Intermediate Level", count: 7 },
          { id: "cre-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "equipment-financing",
        name: "Equipment Financing Strategies",
        count: 21,
        subcategories: [
          { id: "equipment-beginner", name: "Beginner Level", count: 7 },
          { id: "equipment-intermediate", name: "Intermediate Level", count: 7 },
          { id: "equipment-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "working-capital",
        name: "Working Capital Solutions",
        count: 21,
        subcategories: [
          { id: "working-capital-beginner", name: "Beginner Level", count: 7 },
          { id: "working-capital-intermediate", name: "Intermediate Level", count: 7 },
          { id: "working-capital-expert", name: "Expert Level", count: 7 }
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
        id: "invoice-factoring",
        name: "Invoice Factoring Mastery",
        count: 21,
        subcategories: [
          { id: "factoring-beginner", name: "Beginner Level", count: 7 },
          { id: "factoring-intermediate", name: "Intermediate Level", count: 7 },
          { id: "factoring-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "merchant-cash",
        name: "Merchant Cash Advance Training",
        count: 21,
        subcategories: [
          { id: "mca-beginner", name: "Beginner Level", count: 7 },
          { id: "mca-intermediate", name: "Intermediate Level", count: 7 },
          { id: "mca-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "asset-based",
        name: "Asset-Based Lending Essentials",
        count: 21,
        subcategories: [
          { id: "abl-beginner", name: "Beginner Level", count: 7 },
          { id: "abl-intermediate", name: "Intermediate Level", count: 7 },
          { id: "abl-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "construction",
        name: "Construction Loan Expertise",
        count: 21,
        subcategories: [
          { id: "construction-beginner", name: "Beginner Level", count: 7 },
          { id: "construction-intermediate", name: "Intermediate Level", count: 7 },
          { id: "construction-expert", name: "Expert Level", count: 7 }
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
        id: "healthcare",
        name: "Healthcare Financing Certification",
        count: 21,
        subcategories: [
          { id: "healthcare-beginner", name: "Beginner Level", count: 7 },
          { id: "healthcare-intermediate", name: "Intermediate Level", count: 7 },
          { id: "healthcare-expert", name: "Expert Level", count: 7 }
        ]
      },
      {
        id: "restaurant",
        name: "Restaurant Financing Specialist",
        count: 21,
        subcategories: [
          { id: "restaurant-beginner", name: "Beginner Level", count: 7 },
          { id: "restaurant-intermediate", name: "Intermediate Level", count: 7 },
          { id: "restaurant-expert", name: "Expert Level", count: 7 }
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
  };

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

      {/* Loan Program Categories - First Level Only */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Loan Program Categories
        </div>
        {categoryHierarchy.map(category => (
          <Button
            key={category.id}
            variant={selectedCategories.includes(category.id) ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              toggleCategorySelection(category.id);
              onCloseSheet?.();
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
              const category = categoryHierarchy.find(cat => cat.id === categoryId);
              return (
                <Badge 
                  key={categoryId} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => toggleCategorySelection(categoryId)}
                >
                  {category?.name || categoryId} ×
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
