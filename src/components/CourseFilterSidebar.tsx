import { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Filter } from "lucide-react";

interface CourseFilterSidebarProps {
  selectedLevel: string;
  onLevelChange: Dispatch<SetStateAction<string>>;
  titleFilter: string;
  onTitleFilterChange: Dispatch<SetStateAction<string>>;
  counts: {
    all: number;
    beginner: number;
    expert: number;
  };
}

export function CourseFilterSidebar({ 
  selectedLevel, 
  onLevelChange, 
  titleFilter, 
  onTitleFilterChange,
  counts 
}: CourseFilterSidebarProps) {

  const skillLevels = [
    { key: "all", label: "All Levels", count: counts.all },
    { key: "beginner", label: "Beginner", count: counts.beginner },
    { key: "expert", label: "Expert", count: counts.expert }
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {(selectedLevel !== "all" || titleFilter) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                onLevelChange("all");
                onTitleFilterChange("");
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="course-search" className="text-sm font-medium">
            Search Courses
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="course-search"
              placeholder="Search by course name..."
              value={titleFilter}
              onChange={(e) => onTitleFilterChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        {/* Skill Level Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Skill Level</Label>
          <div className="space-y-2">
            {skillLevels.map((level) => (
              <Button
                key={level.key}
                variant={selectedLevel === level.key ? "default" : "outline"}
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => onLevelChange(level.key)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="font-medium">{level.label}</div>
                  <Badge variant="secondary" className="ml-2">
                    {level.count}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedLevel !== "all" || titleFilter) && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
              <div className="font-medium mb-1">Active Filters:</div>
              <div className="space-y-1">
                {selectedLevel !== "all" && (
                  <div>• Level: {skillLevels.find(l => l.key === selectedLevel)?.label}</div>
                )}
                {titleFilter && (
                  <div>• Search: "{titleFilter}"</div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}