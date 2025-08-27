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
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportResponses = [
        "Thank you for your message! I'm looking into that for you right away.",
        "I understand your concern. Let me help you with that.",
        "Great question! Here's what I can help you with...",
        "I see what you're asking about. Let me provide you with some information.",
        "Thanks for reaching out! I'm here to help you resolve this issue."
      ];

      const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'support',
        timestamp: new Date(),
        senderName: 'Sarah from Support'
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000);
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
      <DialogContent className="sm:max-w-md w-[95vw] h-[600px] p-0 gap-0 fixed bottom-4 right-4 sm:bottom-4 sm:right-4 m-0 translate-x-0 translate-y-0">
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