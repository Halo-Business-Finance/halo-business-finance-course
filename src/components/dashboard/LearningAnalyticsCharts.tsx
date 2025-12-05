import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningAnalyticsChartsProps {
  weeklyData?: Array<{ day: string; minutes: number; modules: number }>;
  skillProgress?: Array<{ skill: string; progress: number; color: string }>;
  className?: string;
}

const defaultWeeklyData = [
  { day: "Mon", minutes: 45, modules: 2 },
  { day: "Tue", minutes: 30, modules: 1 },
  { day: "Wed", minutes: 60, modules: 3 },
  { day: "Thu", minutes: 25, modules: 1 },
  { day: "Fri", minutes: 55, modules: 2 },
  { day: "Sat", minutes: 40, modules: 2 },
  { day: "Sun", minutes: 20, modules: 1 },
];

const defaultSkillProgress = [
  { skill: "SBA Lending", progress: 85, color: "hsl(var(--primary))" },
  { skill: "Credit Analysis", progress: 65, color: "hsl(var(--chart-2))" },
  { skill: "Risk Assessment", progress: 45, color: "hsl(var(--chart-3))" },
  { skill: "Financial Modeling", progress: 30, color: "hsl(var(--chart-4))" },
];

export function LearningAnalyticsCharts({
  weeklyData = defaultWeeklyData,
  skillProgress = defaultSkillProgress,
  className,
}: LearningAnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  
  const totalMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const totalModules = weeklyData.reduce((sum, d) => sum + d.modules, 0);
  const avgMinutesPerDay = Math.round(totalMinutes / 7);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Time", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: Clock, trend: "+12%" },
          { label: "Modules Done", value: totalModules.toString(), icon: BookOpen, trend: "+3" },
          { label: "Daily Average", value: `${avgMinutesPerDay}m`, icon: Target, trend: "+8%" },
          { label: "Streak", value: "7 days", icon: TrendingUp, trend: "Best!" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-emerald-500 font-medium">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time Spent Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Learning Activity</CardTitle>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "week" | "month")}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skill Progress */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Skill Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="skill" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Progress"]}
                />
                <Bar 
                  dataKey="progress" 
                  radius={[0, 4, 4, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
