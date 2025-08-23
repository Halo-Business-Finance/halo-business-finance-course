import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Video } from "lucide-react";
import { useState } from "react";
import { VideoRecorder } from "./VideoRecorder";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal = ({ isOpen, onClose }: DemoVideoModalProps) => {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl font-playfair text-halo-navy">
              Halo Business Finance Training Demo
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-6">
            <div className="relative w-full aspect-video bg-gradient-to-br from-halo-navy to-primary rounded-lg overflow-hidden">
              {/* Placeholder for demo video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white space-y-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-10 w-10 text-white ml-1" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Your Demo Video</h3>
                    <p className="text-white/80 max-w-md">
                      Use our built-in screen recorder to capture a demo of the platform's features and functionality.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* This is where you would embed your actual video */}
              {/* 
              <video 
                controls 
                className="w-full h-full object-cover"
                poster="/path-to-video-thumbnail.jpg"
              >
                <source src="/path-to-your-demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              */}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Create a demo showcasing:
                </p>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• Interactive financial calculators and tools</li>
                  <li>• Expert-led video content and case studies</li>
                  <li>• Real-time progress tracking and certifications</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setIsRecorderOpen(true)} className="bg-gradient-primary text-white">
                  <Video className="h-4 w-4 mr-2" />
                  Record Demo
                </Button>
                <Button onClick={onClose} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VideoRecorder 
        isOpen={isRecorderOpen} 
        onClose={() => setIsRecorderOpen(false)} 
      />
    </>
  );
};