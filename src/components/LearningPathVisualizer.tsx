import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  Play, 
  Clock, 
  Brain,
  Target,
  Zap,
  ArrowDown,
  Star
} from 'lucide-react';

interface LearningPathVisualizerProps {
  learningPath: any[];
  currentLessonId?: string;
  onLessonSelect: (lesson: any) => void;
}

export const LearningPathVisualizer = ({ 
  learningPath, 
  currentLessonId, 
  onLessonSelect 
}: LearningPathVisualizerProps) => {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Play className="h-6 w-6 text-blue-500" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-gray-400" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50 shadow-lg';
      case 'locked':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'interactive':
        return <Zap className="h-4 w-4" />;
      case 'text':
        return <Target className="h-4 w-4" />;
      case 'simulation':
        return <Brain className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const completedLessons = learningPath.filter(p => p.status === 'completed').length;
  const totalLessons = learningPath.length;
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Path Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedLessons} of {totalLessons} lessons completed
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedLessons}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {learningPath.filter(p => p.status === 'current').length}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {learningPath.filter(p => p.status === 'locked').length}
              </div>
              <div className="text-xs text-muted-foreground">Upcoming</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <div className="space-y-4">
        {learningPath.map((pathItem, index) => (
          <div key={pathItem.lesson.id} className="relative">
            {/* Connection Line */}
            {index < learningPath.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-8 bg-gray-300 z-0" />
            )}
            
            {/* Lesson Card */}
            <Card className={`relative z-10 transition-all duration-200 hover:shadow-md ${getStatusColor(pathItem.status)}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(pathItem.status)}
                  </div>
                  
                  {/* Lesson Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{pathItem.lesson.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Step {pathItem.step} • {pathItem.lesson.content_type}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {pathItem.estimatedCompletionTime} min
                        </span>
                        {pathItem.status === 'current' && (
                          <Button
                            size="sm"
                            onClick={() => onLessonSelect(pathItem.lesson)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {pathItem.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onLessonSelect(pathItem.lesson)}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Adaptations Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getContentTypeIcon(pathItem.lesson.content_type)}
                        <span className="text-muted-foreground">
                          {pathItem.lesson.content_type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <div className="flex">
                          {getDifficultyStars(pathItem.adaptations.difficulty)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          {pathItem.adaptations.interactiveElements} interactive elements
                        </span>
                      </div>
                    </div>

                    {/* Learning Objectives Preview */}
                    {pathItem.lesson.learning_objectives && pathItem.lesson.learning_objectives.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Learning Objectives:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {pathItem.lesson.learning_objectives.slice(0, 2).map((objective: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                          {pathItem.lesson.learning_objectives.length > 2 && (
                            <li className="text-xs">
                              +{pathItem.lesson.learning_objectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {pathItem.lesson.prerequisites && pathItem.lesson.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Prerequisites:</h4>
                        <div className="flex flex-wrap gap-1">
                          {pathItem.lesson.prerequisites.map((prereq: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Path Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Path Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Total Duration:</span>
              <span className="font-medium">
                {learningPath.reduce((total, item) => total + item.estimatedCompletionTime, 0)} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Difficulty:</span>
              <div className="flex">
                {getDifficultyStars(
                  Math.round(
                    learningPath.reduce((total, item) => total + item.adaptations.difficulty, 0) / 
                    learningPath.length
                  )
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span>Interactive Elements:</span>
              <span className="font-medium">
                {learningPath.reduce((total, item) => total + item.adaptations.interactiveElements, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Content Types:</span>
              <span className="font-medium">
                {new Set(learningPath.map(item => item.lesson.content_type)).size} types
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};