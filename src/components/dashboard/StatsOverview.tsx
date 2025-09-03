// Dashboard statistics overview component

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
  error?: string | null;
}

export const StatsOverview = ({ stats, loading, error }: StatsOverviewProps) => {
  if (loading) {
    return <SkeletonLoader variant="stats" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  const statsItems = [
    {
      label: "Modules Completed",
      value: stats?.modulesCompleted || 0,
      icon: Trophy,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Hours Studied",
      value: `${stats?.timeSpentHours || 0}h`,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak || 0} days`,
      icon: Target,
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      label: "Progress Score",
      value: `${stats?.progressScore || 0}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {statsItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="hover-scale">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {item.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};