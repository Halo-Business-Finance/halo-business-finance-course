import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Image, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  storage_path: string;
  public_url: string;
  folder_path: string;
  tags?: string[];
  created_at: string;
}

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (imageUrl: string, mediaItem: MediaItem) => void;
  triggerElement?: React.ReactNode;
}

export function MediaSelector({ 
  open, 
  onOpenChange, 
  onSelectImage, 
  triggerElement 
}: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      
      // Load only image files from media library
      const { data: mediaData, error } = await supabase
        .from("cms_media")
        .select("*")
        .ilike("file_type", "image%")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(mediaData || []);

    } catch (error) {
      console.error("Error loading media:", error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item =>
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectImage = () => {
    if (selectedItem) {
      onSelectImage(selectedItem.public_url, selectedItem);
      onOpenChange(false);
      setSelectedItem(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerElement && (
        <DialogTrigger asChild>
          {triggerElement}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Select Image from Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Media Grid */}
          <ScrollArea className="flex-1 min-h-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No images found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Upload some images to get started"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative aspect-square cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedItem?.id === item.id 
                        ? "border-primary shadow-md" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Image */}
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={item.public_url}
                        alt={item.alt_text || item.original_name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Selection Indicator */}
                    {selectedItem?.id === item.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}

                    {/* Image Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">
                        {item.original_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.width && item.height && (
                          <Badge variant="secondary" className="text-xs">
                            {item.width}×{item.height}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(item.file_size)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected Image Info */}
          {selectedItem && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                  <img
                    src={selectedItem.public_url}
                    alt={selectedItem.alt_text || selectedItem.original_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{selectedItem.original_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.width && selectedItem.height && (
                      <span>{selectedItem.width} × {selectedItem.height} • </span>
                    )}
                    {formatFileSize(selectedItem.file_size)}
                  </p>
                  {selectedItem.alt_text && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {selectedItem.alt_text}
                    </p>
                  )}
                </div>
                <Button onClick={handleSelectImage}>
                  Select Image
                </Button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {!selectedItem && (
            <div className="border-t pt-4 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}