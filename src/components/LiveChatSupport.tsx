import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Minimize2, X, Clock, User, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  senderName?: string;
}

interface LiveChatSupportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LiveChatSupport = ({ isOpen, onOpenChange }: LiveChatSupportProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen) {
      // Initialize chat when opened
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: '1',
        content: `Hi ${getUserName()}! 👋 Welcome to FinPilot Support. How can I help you today?`,
        sender: 'support',
        timestamp: new Date(),
        senderName: 'Sarah from Support'
      };
      
      setMessages([welcomeMessage]);
      
      toast({
        title: "Connected to Support",
        description: "You're now connected to our live support team.",
      });
    }, 1500);
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const generateIntelligentResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Course-related questions
    if (message.includes('course') || message.includes('lesson') || message.includes('module')) {
      if (message.includes('start') || message.includes('begin')) {
        return "To start a course, go to your Dashboard and click on any available course card. Your progress will be automatically saved as you complete modules.";
      }
      if (message.includes('locked') || message.includes('can\'t access')) {
        return "If a course is locked, it means you're currently studying another course. You can only study one course at a time. Complete your current course or contact support to unlock other courses.";
      }
      if (message.includes('progress') || message.includes('certificate')) {
        return "You can track your progress on the Dashboard. Certificates are automatically generated when you complete all modules in a course with passing grades.";
      }
      return "I can help you with course navigation, progress tracking, and accessing modules. What specific course question do you have?";
    }
    
    // Login/Account issues
    if (message.includes('login') || message.includes('password') || message.includes('account')) {
      if (message.includes('forgot') || message.includes('reset')) {
        return "To reset your password, click 'Forgot Password' on the login page. You'll receive an email with reset instructions within a few minutes.";
      }
      if (message.includes('can\'t login') || message.includes('access')) {
        return "If you're having trouble logging in, please check your email and password. If the issue persists, try clearing your browser cache or contact your administrator.";
      }
      return "I can help you with account access issues. Are you having trouble logging in or need to reset your password?";
    }
    
    // Technical issues
    if (message.includes('video') || message.includes('audio') || message.includes('play')) {
      return "For video playback issues, try refreshing the page or checking your internet connection. Make sure your browser allows autoplay for this site. If problems persist, try a different browser.";
    }
    
    if (message.includes('error') || message.includes('bug') || message.includes('broken')) {
      return "I'm sorry you're experiencing technical issues. Please try refreshing the page first. If the problem continues, could you tell me what specific error you're seeing?";
    }
    
    // Navigation help
    if (message.includes('find') || message.includes('where') || message.includes('navigate')) {
      return "You can navigate using the sidebar menu. Your main areas are: Dashboard (course overview), Courses (browse all courses), Progress (detailed tracking), and Account (profile settings).";
    }
    
    // Enrollment/Business questions
    if (message.includes('enroll') || message.includes('pricing') || message.includes('business')) {
      return "For enrollment and business inquiries, I can connect you with our sales team. We offer enterprise solutions for commercial lending and finance training. Would you like me to schedule a demo?";
    }
    
    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
      return "Hello! I'm here to help you with the FinPilot learning platform. I can assist with course navigation, technical issues, account problems, and general questions about our commercial lending and finance courses. What can I help you with today?";
    }
    
    // Default helpful response
    return "I'm here to help! I can assist with course access, technical issues, account problems, navigation, and questions about our commercial lending and finance training. Could you tell me more about what you need help with?";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      senderName: getUserName()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);

    // Generate intelligent response based on user message
    setTimeout(() => {
      const intelligentResponse = generateIntelligentResponse(messageContent);
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: intelligentResponse,
        sender: 'support',
        timestamp: new Date(),
        senderName: 'Sarah from Support'
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] h-[600px] p-0 gap-0 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 m-0 z-50">
        <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <DialogTitle className="text-white text-base font-semibold">
                  Live Support
                </DialogTitle>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-500' 
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`} />
                {connectionStatus === 'connected' && 'Online'}
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'support' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          S
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border'
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        {message.senderName && (
                          <span className="font-medium">{message.senderName}</span>
                        )}
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {getUserName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        S
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 border rounded-lg px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    connectionStatus === 'connected' 
                      ? "Type your message..." 
                      : "Connecting to support..."
                  }
                  disabled={connectionStatus !== 'connected'}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Powered by FinPilot Support • Response time: ~2 minutes
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};