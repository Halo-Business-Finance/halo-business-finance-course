import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, ThumbsUp, Pin, Plus, Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionPost {
  id: string;
  user_id: string;
  course_id: string | null;
  module_id: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  author_name?: string;
}

interface DiscussionForumProps {
  courseId?: string;
  moduleId?: string;
}

export function DiscussionForum({ courseId, moduleId }: DiscussionForumProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [courseId, moduleId]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('discussion_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase.from('discussion_posts').insert({
        user_id: user.id,
        course_id: courseId || null,
        module_id: moduleId || null,
        title: newPost.title,
        content: newPost.content,
      });

      if (error) throw error;
      
      toast.success('Discussion posted!');
      setNewPost({ title: '', content: '' });
      setIsCreateOpen(false);
      loadPosts();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await supabase
        .from('discussion_posts')
        .update({ likes_count: post.likes_count + 1 })
        .eq('id', postId);

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Discussion Forum
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Discussion title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="What would you like to discuss?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
              <Button onClick={handleCreatePost} className="w-full gap-2">
                <Send className="h-4 w-4" />
                Post Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {post.user_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.is_pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                      <h4 className="font-medium truncate">{post.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {post.likes_count}
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.replies_count} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
