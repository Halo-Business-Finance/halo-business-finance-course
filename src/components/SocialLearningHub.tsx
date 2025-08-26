import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Send, 
  Heart, 
  MessageCircle,
  BookOpen,
  Clock,
  Pin,
  ThumbsUp,
  ThumbsDown,
  Share,
  Flag,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  category: string;
  tags: string[];
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_solved: boolean;
  module_id?: string;
}

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  likes_count: number;
  is_solution: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  created_by: string;
  members_count: number;
  is_public: boolean;
  focus_modules: string[];
  created_at: string;
  current_members: any[];
}

export const SocialLearningHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discussions');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newReply, setNewReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: MessageSquare },
    { id: 'general', name: 'General Discussion', icon: MessageCircle },
    { id: 'homework', name: 'Homework Help', icon: BookOpen },
    { id: 'career', name: 'Career Advice', icon: Users },
    { id: 'technical', name: 'Technical Questions', icon: MessageSquare }
  ];

  useEffect(() => {
    if (user?.id) {
      loadForumData();
      loadStudyGroups();
      setupRealtimeSubscriptions();
    }
  }, [user?.id]);

  const setupRealtimeSubscriptions = () => {
    if (!user?.id) return;

    // Track user presence
    const presenceChannel = supabase.channel('social_learning_presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users = Object.values(presenceState).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => [...prev, ...newPresences]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers(prev => 
          prev.filter(u => !leftPresences.find(l => l.user_id === u.user_id))
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            user_name: user.email?.split('@')[0] || 'Anonymous',
            online_at: new Date().toISOString(),
            current_module: 'foundations', // This could be dynamic
            status: 'active'
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  };

  const loadForumData = async () => {
    // Simulate forum data since we don't have the tables yet
    const mockPosts: ForumPost[] = [
      {
        id: '1',
        title: 'Help with Financial Ratio Analysis',
        content: 'I\'m struggling to understand the difference between current ratio and quick ratio. Can someone explain with examples?',
        author: {
          id: 'user1',
          name: 'Sarah Chen',
          avatar_url: undefined
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'homework',
        tags: ['financial-ratios', 'analysis'],
        likes_count: 5,
        replies_count: 3,
        is_pinned: false,
        is_solved: true,
        module_id: 'foundations'
      },
      {
        id: '2',
        title: 'Study Group for Capital Markets Module',
        content: 'Looking to form a study group for the upcoming capital markets module. Who\'s interested?',
        author: {
          id: 'user2',
          name: 'Mike Rodriguez',
          avatar_url: undefined
        },
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'general',
        tags: ['study-group', 'capital-markets'],
        likes_count: 8,
        replies_count: 6,
        is_pinned: false,
        is_solved: false,
        module_id: 'capital-markets'
      },
      {
        id: '3',
        title: 'Best Practices for Credit Analysis',
        content: 'What are the most important factors to consider when analyzing a business loan application?',
        author: {
          id: 'user3',
          name: 'Jennifer Liu',
          avatar_url: undefined
        },
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'technical',
        tags: ['credit-analysis', 'best-practices'],
        likes_count: 12,
        replies_count: 9,
        is_pinned: true,
        is_solved: false,
        module_id: 'credit-analysis'
      }
    ];

    setForumPosts(mockPosts);
    setLoading(false);
  };

  const loadStudyGroups = async () => {
    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'Finance Fundamentals Cohort',
        description: 'Weekly study sessions covering core finance principles and practical applications.',
        created_by: 'instructor1',
        members_count: 12,
        is_public: true,
        focus_modules: ['foundations', 'capital-markets'],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        current_members: []
      },
      {
        id: '2',
        name: 'SBA Lending Specialists',
        description: 'Advanced group focusing on SBA loan programs and compliance requirements.',
        created_by: 'user4',
        members_count: 8,
        is_public: true,
        focus_modules: ['sba-lending'],
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        current_members: []
      },
      {
        id: '3',
        name: 'Peer Mentorship Circle',
        description: 'Experienced learners helping newcomers navigate the course material.',
        created_by: 'user5',
        members_count: 15,
        is_public: true,
        focus_modules: ['foundations'],
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        current_members: []
      }
    ];

    setStudyGroups(mockGroups);
  };

  const createNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post.",
        variant: "destructive"
      });
      return;
    }

    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      author: {
        id: user?.id || '',
        name: user?.email?.split('@')[0] || 'Anonymous',
        avatar_url: undefined
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      tags: [],
      likes_count: 0,
      replies_count: 0,
      is_pinned: false,
      is_solved: false
    };

    setForumPosts(prev => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    
    toast({
      title: "Post Created! ✨",
      description: "Your discussion post has been shared with the community."
    });
  };

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Online Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Social Learning Hub
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect, collaborate, and learn together
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 5).map((user, index) => (
                  <Avatar key={index} className="border-2 border-background w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.user_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Badge variant="outline">
                {onlineUsers.length} online
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-1"
                    >
                      <category.icon className="h-3 w-3" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Start a Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What would you like to discuss?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <Textarea
                placeholder="Share your thoughts, questions, or insights..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {categories.slice(1).map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <Button onClick={createNewPost} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discussion Posts */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {post.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                                <h4 className="font-semibold">{post.title}</h4>
                                {post.is_solved && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Solved
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                by {post.author.name} • {formatTimeAgo(post.created_at)}
                              </p>
                            </div>
                            <Badge variant="outline">{post.category}</Badge>
                          </div>
                          
                          <p className="text-sm">{post.content}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                                {post.likes_count}
                              </button>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                {post.replies_count} replies
                              </button>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <Share className="h-4 w-4" />
                                Share
                              </button>
                            </div>
                            
                            <div className="flex gap-1">
                              {post.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="study-groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.members_count} members
                        </p>
                      </div>
                      <Badge variant={group.is_public ? 'outline' : 'secondary'}>
                        {group.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{group.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {group.focus_modules.map((module, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created {formatTimeAgo(group.created_at)}
                      </span>
                      <Button size="sm">Join Group</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Study Group */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Study Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Create New Study Group
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-sessions">
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Live Sessions Coming Soon</h3>
              <p className="text-muted-foreground">
                Interactive live sessions with instructors and peers will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};