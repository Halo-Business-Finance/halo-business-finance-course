import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  moduleId?: string;
}

interface QAItem {
  question: string;
  answer: string;
  timestamp: string;
}

export const QuestionModal = ({ isOpen, onClose, moduleTitle, moduleId }: QuestionModalProps) => {
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ask-question', {
        body: {
          question: question.trim(),
          moduleTitle,
          moduleContext: `Module ID: ${moduleId || 'Unknown'}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add to history
      const newQA: QAItem = {
        question: question.trim(),
        answer: data.answer,
        timestamp: data.timestamp
      };

      setQaHistory(prev => [...prev, newQA]);
      setQuestion("");

      toast({
        title: "Question Answered",
        description: "Your question has been answered by our AI assistant",
      });

    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to get answer',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion("");
    setQaHistory([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask a Question
          </DialogTitle>
          <DialogDescription>
            Ask questions about "{moduleTitle}" and get detailed answers from our AI instructor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Q&A History */}
          {qaHistory.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
              <h4 className="font-semibold text-sm text-muted-foreground">Conversation History</h4>
              {qaHistory.map((qa, index) => (
                <div key={index} className="space-y-2">
                  {/* Question */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">You asked:</p>
                          <p className="text-sm">{qa.question}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Answer */}
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-accent" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-accent mb-2">AI Instructor:</p>
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {qa.answer}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Question Input */}
          <div className="space-y-3 border-t pt-4">
            <div>
              <label htmlFor="question" className="text-sm font-medium">
                Your Question
              </label>
              <Textarea
                id="question"
                placeholder="Ask anything about this module - concepts, examples, practical applications..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Close
              </Button>
              <Button 
                onClick={handleSubmitQuestion} 
                disabled={loading || !question.trim()}
                className="min-w-24"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Asking...
                  </>
                ) : (
                  'Ask Question'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};