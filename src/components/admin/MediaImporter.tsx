import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Check, AlertCircle, Image } from "lucide-react";

interface ExistingImage {
  filename: string;
  url: string;
  type: 'upload' | 'asset';
}

export const MediaImporter = () => {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<string[]>([]);
  const { toast } = useToast();

  // These are the existing uploaded images that can be moved to CMS
  const existingImages: ExistingImage[] = [
    {
      filename: 'learning-paths.png',
      url: '/lovable-uploads/49422402-b861-468e-8955-3f3cdaf3530c.png',
      type: 'upload'
    },
    {
      filename: 'software-training.png', 
      url: '/lovable-uploads/78cb3c25-cbc5-4554-bba1-11cf532ee81d.png',
      type: 'upload'
    },
    // Add some key static assets that can be imported
    {
      filename: 'hero-business-training.jpg',
      url: '/src/assets/commercial-lending-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'about-hero.jpg',
      url: '/src/assets/about-hero.jpg', 
      type: 'asset'
    },
    {
      filename: 'business-hero.jpg',
      url: '/src/assets/business-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'courses-hero.jpg',
      url: '/src/assets/courses-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'pricing-hero.jpg',
      url: '/src/assets/pricing-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'support-hero.jpg',
      url: '/src/assets/support-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'blog-hero.jpg',
      url: '/src/assets/blog-hero.jpg',
      type: 'asset'
    }
  ];

  const importImageToCMS = async (image: ExistingImage) => {
    try {
      console.log(`Importing image: ${image.filename}`);
      
      // Fetch the image from the public URL
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${image.filename}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], image.filename, { type: blob.type });
      
      // Upload to cms-media bucket
      const filename = `imported-${Date.now()}-${image.filename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(`/imported/${filename}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(uploadData.path);

      // Create database record
      const mediaData = {
        filename,
        original_name: image.filename,
        file_type: blob.type,
        file_size: blob.size,
        public_url: publicUrlData.publicUrl,
        storage_path: uploadData.path,
        folder_path: '/imported',
        alt_text: `Imported ${image.filename}`,
        tags: ['imported', 'existing-content']
      };

      // Try to get image dimensions if it's an image
      if (blob.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = async () => {
          const { error } = await supabase
            .from("cms_media")
            .insert({
              ...mediaData,
              width: img.width,
              height: img.height,
            });

          if (error) throw error;
          console.log(`Successfully imported: ${image.filename}`);
        };
        img.src = publicUrlData.publicUrl;
      } else {
        const { error } = await supabase
          .from("cms_media")
          .insert(mediaData);

        if (error) throw error;
        console.log(`Successfully imported: ${image.filename}`);
      }

      setImported(prev => [...prev, image.filename]);
      
    } catch (error) {
      console.error(`Error importing ${image.filename}:`, error);
      throw error;
    }
  };

  const importAllImages = async () => {
    setImporting(true);
    setImported([]);
    
    try {
      let successCount = 0;
      
      for (const image of existingImages) {
        try {
          await importImageToCMS(image);
          successCount++;
        } catch (error) {
          console.error(`Failed to import ${image.filename}:`, error);
        }
      }
      
      if (successCount === existingImages.length) {
        toast({
          title: "Success",
          description: `Successfully imported ${successCount} images to CMS Media Library`
        });
      } else {
        toast({
          title: "Partial Success", 
          description: `Imported ${successCount}/${existingImages.length} images. Check console for details.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Import process failed:', error);
      toast({
        title: "Error",
        description: "Failed to import images. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Import Existing Images
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Import your existing uploaded images from /lovable-uploads/ into the CMS Media Library
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingImages.map((image) => (
            <div key={image.filename} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={image.url} 
                  alt={image.filename}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{image.filename}</h4>
                  <p className="text-sm text-muted-foreground">{image.url}</p>
                </div>
              </div>
              {imported.includes(image.filename) ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Imported
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={importAllImages} 
            disabled={importing}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Importing...' : 'Import All Images'}
          </Button>
          {imported.length > 0 && (
            <Badge variant="secondary">
              {imported.length}/{existingImages.length} imported
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> This will import your existing uploaded images into the CMS Media Library.</p>
          <p>Static assets in /src/assets/ cannot be imported automatically - you'll need to upload them manually through the Media tab.</p>
        </div>
      </CardContent>
    </Card>
  );
};