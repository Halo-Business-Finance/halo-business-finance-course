import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Canvas as FabricCanvas, Rect, Circle, Image as FabricImage, IText } from "fabric";
import { Upload, Download, RotateCw, Crop, Palette, Type, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/data/courseData";

interface CourseImageEditorProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (courseId: string, imageBlob: Blob) => Promise<void>;
}

export function CourseImageEditor({ course, open, onOpenChange, onSave }: CourseImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3B82F6");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text">("select");
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current || !open) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "#ffffff",
    });

    // Initialize the freeDrawingBrush
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [open]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 3;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        // Clear existing content
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = "#ffffff";

        // Create fabric image
        const fabricImg = new FabricImage(imgElement, {
          left: 0,
          top: 0,
          scaleX: Math.min(600 / imgElement.width, 400 / imgElement.height),
          scaleY: Math.min(600 / imgElement.width, 400 / imgElement.height),
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.centerObject(fabricImg);
        fabricCanvas.renderAll();

        // Store original image data for reset functionality
        setOriginalImageData(e.target?.result as string);
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 80,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
    } else if (tool === "text") {
      const text = new IText('Course Title', {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 24,
        fontFamily: 'Inter',
      });
      fabricCanvas.add(text);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast({
      title: "Canvas Cleared",
      description: "All content has been removed from the canvas.",
    });
  };

  const handleReset = () => {
    if (!fabricCanvas || !originalImageData) return;
    
    const imgElement = new Image();
    imgElement.onload = () => {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";

      const fabricImg = new FabricImage(imgElement, {
        left: 0,
        top: 0,
        scaleX: Math.min(600 / imgElement.width, 400 / imgElement.height),
        scaleY: Math.min(600 / imgElement.width, 400 / imgElement.height),
      });

      fabricCanvas.add(fabricImg);
      fabricCanvas.centerObject(fabricImg);
      fabricCanvas.renderAll();
    };
    imgElement.src = originalImageData;

    toast({
      title: "Image Reset",
      description: "Canvas has been reset to the original image.",
    });
  };

  const handleSave = async () => {
    if (!fabricCanvas || !course) return;

    setIsLoading(true);
    try {
      // Export canvas as blob
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 2, // Higher resolution
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      if (onSave) {
        await onSave(course.id, blob);
      }

      toast({
        title: "Image Saved",
        description: `Course image for "${course.title}" has been saved successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the course image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fabricCanvas || !course) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = `${course.id}-image.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Image Downloaded",
      description: "Course image has been downloaded to your device.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Course Image</DialogTitle>
          <DialogDescription>
            {course ? `Editing image for "${course.title}"` : "Course Image Editor"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 max-h-[70vh] overflow-hidden">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload & Edit</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Course Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Create a new course image from scratch using the drawing tools below.
              </div>
            </TabsContent>
          </Tabs>

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap border-b pb-4">
            <Button
              variant={activeTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("select")}
            >
              Select
            </Button>
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("draw")}
            >
              <Palette className="h-4 w-4 mr-1" />
              Draw
            </Button>
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
            >
              Rectangle
            </Button>
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("circle")}
            >
              Circle
            </Button>
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("text")}
            >
              <Type className="h-4 w-4 mr-1" />
              Text
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Label htmlFor="color-picker" className="text-sm">Color:</Label>
              <input
                id="color-picker"
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              {originalImageData && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex justify-center items-center bg-gray-50 rounded-lg p-4 overflow-auto">
            <div className="border border-gray-200 rounded-lg shadow-lg bg-white">
              <canvas ref={canvasRef} className="max-w-full max-h-full" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}