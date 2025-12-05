import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ThumbsUp, CheckCircle, PenLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

interface CourseReviewsProps {
  courseId: string;
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
  const [averageRating, setAverageRating] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReviews(data || []);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to write a review');
      return;
    }

    try {
      const { error } = await supabase.from('course_reviews').insert({
        user_id: user.id,
        course_id: courseId,
        rating: newReview.rating,
        title: newReview.title || null,
        content: newReview.content || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this course');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted!');
      setNewReview({ rating: 5, title: '', content: '' });
      setIsWriteOpen(false);
      loadReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      await supabase
        .from('course_reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId);

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      ));
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const StarRating = ({ rating, interactive = false, onRate }: { 
    rating: number; 
    interactive?: boolean;
    onRate?: (rating: number) => void;
  }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Course Reviews
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{averageRating}</span>
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PenLine className="h-4 w-4" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <StarRating
                  rating={newReview.rating}
                  interactive
                  onRate={(rating) => setNewReview({ ...newReview, rating })}
                />
              </div>
              <Input
                placeholder="Review title (optional)"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              />
              <Textarea
                placeholder="Share your experience with this course..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                rows={4}
              />
              <Button onClick={handleSubmitReview} className="w-full">
                Submit Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.is_verified_purchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-medium mt-1">{review.title}</h4>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                {review.content && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {review.content}
                  </p>
                )}
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ThumbsUp className="h-3 w-3" />
                  Helpful ({review.helpful_count})
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
