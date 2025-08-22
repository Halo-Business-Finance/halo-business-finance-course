import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface SkillLevelFilterProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  counts?: {
    all: number;
    beginner: number;
    intermediate: number;
    expert: number;
  };
}

export function SkillLevelFilter({ selectedLevel, onLevelChange, counts }: SkillLevelFilterProps) {
  const levels = [
    { id: 'all', label: 'All Levels', icon: '📚' },
    { id: 'beginner', label: 'Beginner', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', icon: '🌿' },
    { id: 'expert', label: 'Expert', icon: '🌳' }
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30';
      case 'intermediate':
        return 'bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary/70';
      case 'expert':
        return 'bg-destructive/20 text-destructive-foreground border-destructive/30 hover:bg-destructive/30';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
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
            <span className="mr-2">{level.icon}</span>
            {level.label}
            {counts && counts[level.id as keyof typeof counts] !== undefined && (
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-background/20 text-inherit border-0"
              >
                {counts[level.id as keyof typeof counts]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}