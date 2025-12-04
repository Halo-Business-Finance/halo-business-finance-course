import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  current_streak: number;
  rank: number;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [pointsLeaders, setPointsLeaders] = useState<LeaderboardEntry[]>([]);
  const [streakLeaders, setStreakLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch top users by points
      const { data: pointsData } = await supabase
        .from('learning_streaks')
        .select('user_id, total_points, current_streak')
        .order('total_points', { ascending: false })
        .limit(10);

      // Fetch top users by streak
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('user_id, total_points, current_streak')
        .order('current_streak', { ascending: false })
        .limit(10);

      // Get profiles for display names
      const userIds = [...new Set([
        ...(pointsData || []).map(d => d.user_id),
        ...(streakData || []).map(d => d.user_id)
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [
        p.user_id, 
        p.name || 'Anonymous'
      ]));

      setPointsLeaders((pointsData || []).map((d, i) => ({
        ...d,
        display_name: profileMap.get(d.user_id) || 'Anonymous',
        rank: i + 1
      })));

      setStreakLeaders((streakData || []).map((d, i) => ({
        ...d,
        display_name: profileMap.get(d.user_id) || 'Anonymous',
        rank: i + 1
      })));
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardList = ({ entries, type }: { entries: LeaderboardEntry[], type: 'points' | 'streak' }) => (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.user_id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`
            flex items-center gap-4 p-3 rounded-lg transition-colors
            ${entry.user_id === user?.id 
              ? 'bg-primary/10 border border-primary/30' 
              : 'bg-muted/30 hover:bg-muted/50'
            }
          `}
        >
          <div className="w-8 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {entry.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {entry.display_name}
              {entry.user_id === user?.id && (
                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
              )}
            </p>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-foreground">
              {type === 'points' 
                ? `${entry.total_points.toLocaleString()} pts`
                : `${entry.current_streak} days`
              }
            </p>
          </div>
        </motion.div>
      ))}
      
      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No data yet. Start learning to climb the leaderboard!</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="points">Top Points</TabsTrigger>
            <TabsTrigger value="streaks">Top Streaks</TabsTrigger>
          </TabsList>
          <TabsContent value="points">
            <LeaderboardList entries={pointsLeaders} type="points" />
          </TabsContent>
          <TabsContent value="streaks">
            <LeaderboardList entries={streakLeaders} type="streak" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
