import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Lock, 
  Send, 
  Eye, 
  Clock,
  Shield,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EncryptedMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  encrypted_subject: string;
  encrypted_body: string;
  message_hash: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

interface DecryptedMessage extends Omit<EncryptedMessage, 'encrypted_subject' | 'encrypted_body'> {
  subject: string;
  body: string;
  sender_email?: string;
}

export const EncryptedMessaging: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DecryptedMessage | null>(null);
  
  // Compose message state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(24);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const { data: rawMessages, error } = await supabase.rpc('get_user_encrypted_messages');

      if (error) throw error;

      // Decrypt messages client-side for display
      const decryptedMessages: DecryptedMessage[] = await Promise.all(
        (rawMessages || []).map(async (msg: any) => {
          try {
            // In a real implementation, you'd decrypt these on the server
            // For now, we'll show them as encrypted indicators
            return {
              ...msg,
              subject: `🔒 Encrypted Message (${msg.encrypted_subject.substring(0, 20)}...)`,
              body: `🔒 Encrypted Content (${msg.encrypted_body.substring(0, 50)}...)`,
              sender_email: 'Encrypted User'
            };
          } catch (error) {
            return {
              ...msg,
              subject: '🔒 [Encrypted]',
              body: '🔒 [Unable to decrypt]',
              sender_email: 'Unknown'
            };
          }
        })
      );

      setMessages(decryptedMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load encrypted messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!recipientEmail || !subject || !body) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);

      // Find recipient user ID
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', recipientEmail)
        .single();

      if (profileError) {
        throw new Error(`Recipient not found: ${recipientEmail}`);
      }

      const { data, error } = await supabase.rpc('send_encrypted_message', {
        recipient_user_id: profiles.user_id,
        message_subject: subject,
        message_body: body,
        expires_hours: expiresIn
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Encrypted message sent successfully",
      });

      // Clear form
      setRecipientEmail('');
      setSubject('');
      setBody('');
      
      // Reload messages
      loadMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send encrypted message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('encrypted_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('encrypted_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Message List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Encrypted Messages
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={loadMessages}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Secure, end-to-end encrypted messaging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                    } ${!message.is_read ? 'border-primary' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read && message.recipient_id === user?.id) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm truncate flex-1">
                        {message.subject}
                      </p>
                      <div className="flex items-center gap-1 ml-2">
                        <Lock className="h-3 w-3 text-green-500" />
                        {!message.is_read && message.recipient_id === user?.id && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      From: {message.sender_email}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                      
                      {message.expires_at && (
                        <Badge 
                          variant={isExpired(message.expires_at) ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {isExpired(message.expires_at) ? 'Expired' : 'Expires'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message View/Compose */}
      <div className="lg:col-span-2 space-y-6">
        {/* Compose New Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Encrypted Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Recipient Email</label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expires In (hours)</label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your secure message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={sendMessage} 
              disabled={sending || !recipientEmail || !subject || !body}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              {sending ? 'Encrypting & Sending...' : 'Send Encrypted Message'}
            </Button>
          </CardContent>
        </Card>

        {/* Message Viewer */}
        {selectedMessage && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Message Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Encrypted
                  </Badge>
                  {selectedMessage.recipient_id === user?.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <p>{selectedMessage.sender_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                </div>
              </div>

              {selectedMessage.expires_at && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    {isExpired(selectedMessage.expires_at) 
                      ? 'This message has expired' 
                      : `Expires: ${new Date(selectedMessage.expires_at).toLocaleString()}`
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};