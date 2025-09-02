import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";

interface SkillLevelFilterProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  titleFilter?: string;
  onTitleFilterChange?: (title: string) => void;
  counts?: {
    all: number;
    beginner: number;
    expert: number;
  };
}

export function SkillLevelFilter({ selectedLevel, onLevelChange, titleFilter, onTitleFilterChange, counts }: SkillLevelFilterProps) {
  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'expert', label: 'Expert' }
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Filter - only show if props are provided */}
      {titleFilter !== undefined && onTitleFilterChange && (
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="font-medium">Search courses:</span>
          </div>
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by course title..."
              value={titleFilter}
              onChange={(e) => onTitleFilterChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Skill Level Filter */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter by skill level:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {levels.map(level => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "default" : "outline"}
              size="sm"
              onClick={() => onLevelChange(level.id)}
              className={`${
                selectedLevel === level.id && level.id !== 'all'
                  ? getSkillLevelColor(level.id)
                  : ''
              } transition-all duration-200`}
            >
              {level.label}
              {counts && counts[level.id as keyof typeof counts] !== undefined && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-white/20 text-inherit border-0"
                >
                  {counts[level.id as keyof typeof counts]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}