import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio';
  timestamp: Date;
}

export const RealtimeAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // WebSocket connection to OpenAI Realtime API via Supabase Edge Function
  const connectToAI = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Connect to our Supabase Edge Function that proxies to OpenAI Realtime
      const ws = new WebSocket('wss://kagwfntxlgzrcngysmlt.functions.supabase.co/realtime-ai-assistant');
      
      ws.onopen = () => {
        console.log('🔗 Connected to AI Assistant');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are a helpful Business Finance Mastery AI assistant. Help students with:
            - SBA lending concepts
            - Commercial finance principles  
            - Business development strategies
            - Course-related questions
            Keep responses concise and educational.`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8
          }
        }));
        
        toast({
          title: "AI Assistant Connected",
          description: "You can now chat via text or voice!",
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 AI Response:', data.type);
        
        switch (data.type) {
          case 'response.audio.delta':
            // Handle audio response
            playAudioChunk(data.delta);
            break;
            
          case 'response.audio_transcript.delta':
            // Handle text transcript of audio
            updateAssistantMessage(data.delta);
            break;
            
          case 'response.text.delta':
            // Handle text response
            updateAssistantMessage(data.delta);
            break;
            
          case 'response.done':
            console.log('✅ AI Response complete');
            break;
        }
      };

      ws.onclose = () => {
        console.log('🔌 AI Assistant disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        toast({
          title: "AI Assistant Disconnected",
          description: "Connection lost. Click connect to retry.",
          variant: "destructive"
        });
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: "Connection Error",
          description: "Failed to connect to AI Assistant",
          variant: "destructive"
        });
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to AI Assistant",
        variant: "destructive"
      });
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopRecording();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const sendTextMessage = () => {
    if (!currentMessage.trim() || !wsRef.current) return;

    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);

    // Send to OpenAI
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: currentMessage
        }]
      }
    }));

    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));

    setCurrentMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak now - the AI is listening!",
      });

      // Note: Full WebRTC audio streaming implementation would be added here
      // For demo purposes, we'll show the recording state
      
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const playAudioChunk = (audioBase64: string) => {
    // Audio playback implementation would be added here
    console.log('🎵 Playing audio chunk');
  };

  const updateAssistantMessage = (textDelta: string) => {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        // Update existing assistant message
        return prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: msg.content + textDelta }
            : msg
        );
      } else {
        // Create new assistant message
        return [...prev, {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: textDelta,
          type: 'text' as const,
          timestamp: new Date()
        }];
      }
    });
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Finance AI Assistant
            {isConnected && (
              <Badge variant="default" className="bg-green-500 animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnect}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={connectToAI}
                disabled={connectionStatus === 'connecting'}
              >
                <Phone className="h-4 w-4 mr-2" />
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect AI'}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Get real-time help with finance concepts via text or voice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your Finance AI Assistant</p>
                <p className="text-sm">Ask about SBA lending, commercial finance, or course topics</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Controls */}
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Ask about finance concepts..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                disabled={isRecording}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!currentMessage.trim() || isRecording}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span className="ml-2">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span className="ml-2">Voice</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isConnected}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};