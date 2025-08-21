import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'away' | 'offline';
  current_page?: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface LivePresenceIndicatorProps {
  courseId?: string;
  moduleId?: string;
  className?: string;
}

export const LivePresenceIndicator = ({ 
  courseId = 'business-finance-mastery', 
  moduleId,
  className = ""
}: LivePresenceIndicatorProps) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const roomName = moduleId ? `module-${moduleId}` : `course-${courseId}`;
    
    // Create presence channel
    const presenceChannel = supabase.channel(roomName, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Track current user's presence
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: UserPresence[] = [];
        
        // Extract user data from presence state
        Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0];
            if (presence.user_id) {
              users.push(presence as UserPresence);
            }
          }
        });
        
        console.log('👥 Users online:', users);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          const presenceData = {
            user_id: user.id,
            online_at: new Date().toISOString(),
            status: 'online' as const,
            current_page: window.location.pathname,
            profiles: {
              name: user.user_metadata?.full_name || 'Anonymous',
              email: user.email || ''
            }
          };
          
          await presenceChannel.track(presenceData);
        }
      });

    setChannel(presenceChannel);

    // Update status on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          status: 'away' as const,
          current_page: window.location.pathname
        });
      } else {
        presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          status: 'online' as const,
          current_page: window.location.pathname
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user, courseId, moduleId]);

  const activeUsers = onlineUsers.filter(u => u.status === 'online');
  const awayUsers = onlineUsers.filter(u => u.status === 'away');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
        <span className="text-sm text-muted-foreground">
          {activeUsers.length} online
        </span>
      </div>
      
      {onlineUsers.length > 0 && (
        <TooltipProvider>
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 5).map((user) => (
              <Tooltip key={user.user_id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {user.profiles?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      user.status === 'online' ? 'bg-green-500' : 
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{user.profiles?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                    <p className="text-xs text-muted-foreground">
                      Last seen: {new Date(user.online_at).toLocaleTimeString()}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {onlineUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{onlineUsers.length - 5}
                </span>
              </div>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
};