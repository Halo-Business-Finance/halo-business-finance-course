import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'course' | 'module' | 'profile' | 'stats';
  count?: number;
  className?: string;
}

export const SkeletonLoader = ({ variant = 'card', count = 1, className }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className="animate-fade-in">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-24" />
            </CardContent>
          </Card>
        );

      case 'course':
        return (
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        );

      case 'module':
        return (
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <div className="space-y-3 animate-fade-in">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </CardContent>
          </Card>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-12 w-12 rounded-lg mx-auto mb-3" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? "mb-4" : ""}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};