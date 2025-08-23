import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Square, Download, Play, Pause } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VideoRecorderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoRecorder = ({ isOpen, onClose }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Handle screen share ending
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start(1000); // Capture data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Screen recording is now active. Navigate through your app to create the demo!",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start screen recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast({
        title: "Recording Paused",
        description: "Recording has been paused. Click resume to continue.",
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      toast({
        title: "Recording Resumed",
        description: "Recording has been resumed.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    toast({
      title: "Recording Stopped",
      description: "Your demo video is ready for download!",
    });
  };

  const downloadVideo = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `halo-business-finance-demo-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your demo video is being downloaded.",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordingDuration(0);
    chunksRef.current = [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-halo-navy flex items-center gap-3">
            <Video className="h-6 w-6" />
            Demo Video Recorder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recording Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recording Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white">
                        <Video className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        {!isPaused ? (
                          <Button onClick={pauseRecording} variant="outline">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        ) : (
                          <Button onClick={resumeRecording} className="bg-green-600 hover:bg-green-700 text-white">
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        )}
                        <Button onClick={stopRecording} variant="destructive">
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-mono">{formatTime(recordingDuration)}</span>
                      <span className="text-sm text-muted-foreground">
                        {isPaused ? '(Paused)' : '(Recording)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Recording Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>1. Start Recording:</strong> Click "Start Recording" and select your browser tab or entire screen.</p>
                <p><strong>2. Navigate:</strong> Go through these key pages to showcase the application:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Sign up process (/auth)</li>
                  <li>• Dashboard overview (/dashboard)</li>
                  <li>• Learning modules and content</li>
                  <li>• Interactive financial tools</li>
                  <li>• Progress tracking (/progress)</li>
                  <li>• Video library (/video-library)</li>
                  <li>• Resources section (/resources)</li>
                </ul>
                <p><strong>3. Highlight Features:</strong> Show interactive elements, hover effects, and key functionality.</p>
                <p><strong>4. Stop & Download:</strong> Stop recording when done and download your demo video.</p>
              </div>
            </CardContent>
          </Card>

          {/* Recorded Video Preview */}
          {recordedVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recorded Demo Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <video 
                  controls 
                  className="w-full max-h-64 rounded-lg"
                  src={recordedVideoUrl}
                />
                <div className="flex gap-3">
                  <Button onClick={downloadVideo} className="bg-gradient-primary text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download Demo Video
                  </Button>
                  <Button onClick={resetRecording} variant="outline">
                    Record New Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};