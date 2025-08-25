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

  // Comprehensive list of ALL existing images in your application
  const existingImages: ExistingImage[] = [
    // Uploaded images (these work via direct fetch)
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
    // Hero Images
    {
      filename: 'about-hero.jpg',
      url: '/src/assets/about-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'blog-hero.jpg', 
      url: '/src/assets/blog-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'business-hero.jpg',
      url: '/src/assets/business-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'commercial-lending-hero.jpg',
      url: '/src/assets/commercial-lending-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'courses-hero.jpg',
      url: '/src/assets/courses-hero.jpg',
      type: 'asset'
    },
    {
      filename: 'hero-business-training.jpg',
      url: '/src/assets/hero-business-training.jpg',
      type: 'asset'
    },
    {
      filename: 'hero-finance.jpg',
      url: '/src/assets/hero-finance.jpg',
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
    // Professional Images
    {
      filename: 'adaptive-learning-professional.jpg',
      url: '/src/assets/adaptive-learning-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'ai-analytics-professional.jpg',
      url: '/src/assets/ai-analytics-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'credit-analyst-professional.jpg',
      url: '/src/assets/credit-analyst-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'digital-training-professional.jpg',
      url: '/src/assets/digital-training-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'fintech-professional.jpg',
      url: '/src/assets/fintech-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'gamification-professional.jpg',
      url: '/src/assets/gamification-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'microlearning-professional.jpg',
      url: '/src/assets/microlearning-professional.jpg',
      type: 'asset'
    },
    {
      filename: 'professional-avatars.jpg',
      url: '/src/assets/professional-avatars.jpg',
      type: 'asset'
    },
    {
      filename: 'risk-management-professional.jpg',
      url: '/src/assets/risk-management-professional.jpg',
      type: 'asset'
    },
    // Team Images
    {
      filename: 'team-emily.jpg',
      url: '/src/assets/team-emily.jpg',
      type: 'asset'
    },
    {
      filename: 'team-management.jpg',
      url: '/src/assets/team-management.jpg',
      type: 'asset'
    },
    {
      filename: 'team-michael.jpg',
      url: '/src/assets/team-michael.jpg',
      type: 'asset'
    },
    {
      filename: 'team-sarah.jpg',
      url: '/src/assets/team-sarah.jpg',
      type: 'asset'
    },
    // Business Images
    {
      filename: 'analytics-reporting.jpg',
      url: '/src/assets/analytics-reporting.jpg',
      type: 'asset'
    },
    {
      filename: 'business-analytics.jpg',
      url: '/src/assets/business-analytics.jpg',
      type: 'asset'
    },
    {
      filename: 'business-bg-pattern.jpg',
      url: '/src/assets/business-bg-pattern.jpg',
      type: 'asset'
    },
    {
      filename: 'business-cta.jpg',
      url: '/src/assets/business-cta.jpg',
      type: 'asset'
    },
    {
      filename: 'business-meeting.jpg',
      url: '/src/assets/business-meeting.jpg',
      type: 'asset'
    },
    {
      filename: 'business-team.jpg',
      url: '/src/assets/business-team.jpg',
      type: 'asset'
    },
    // Educational Content Images
    {
      filename: 'avatar-collection.jpg',
      url: '/src/assets/avatar-collection.jpg',
      type: 'asset'
    },
    {
      filename: 'blog-pattern.jpg',
      url: '/src/assets/blog-pattern.jpg',
      type: 'asset'
    },
    {
      filename: 'career-success.jpg',
      url: '/src/assets/career-success.jpg',
      type: 'asset'
    },
    {
      filename: 'company-story.jpg',
      url: '/src/assets/company-story.jpg',
      type: 'asset'
    },
    {
      filename: 'course-icon.jpg',
      url: '/src/assets/course-icon.jpg',
      type: 'asset'
    },
    {
      filename: 'credit-skills-post.jpg',
      url: '/src/assets/credit-skills-post.jpg',
      type: 'asset'
    },
    {
      filename: 'custom-certifications.jpg',
      url: '/src/assets/custom-certifications.jpg',
      type: 'asset'
    },
    {
      filename: 'dedicated-support.jpg',
      url: '/src/assets/dedicated-support.jpg',
      type: 'asset'
    },
    {
      filename: 'default-avatars.jpg',
      url: '/src/assets/default-avatars.jpg',
      type: 'asset'
    },
    {
      filename: 'enterprise-features.jpg',
      url: '/src/assets/enterprise-features.jpg',
      type: 'asset'
    },
    {
      filename: 'enterprise-solutions.jpg',
      url: '/src/assets/enterprise-solutions.jpg',
      type: 'asset'
    },
    {
      filename: 'finance-course-bg.jpg',
      url: '/src/assets/finance-course-bg.jpg',
      type: 'asset'
    },
    {
      filename: 'fintech-post.jpg',
      url: '/src/assets/fintech-post.jpg',
      type: 'asset'
    },
    {
      filename: 'learning-background.jpg',
      url: '/src/assets/learning-background.jpg',
      type: 'asset'
    },
    {
      filename: 'learning-paths.jpg',
      url: '/src/assets/learning-paths.jpg',
      type: 'asset'
    },
    {
      filename: 'lending-curriculum-paths.jpg',
      url: '/src/assets/lending-curriculum-paths.jpg',
      type: 'asset'
    },
    {
      filename: 'nba-logos.jpg',
      url: '/src/assets/nba-logos.jpg',
      type: 'asset'
    },
    {
      filename: 'nfl-logos.jpg',
      url: '/src/assets/nfl-logos.jpg',
      type: 'asset'
    },
    {
      filename: 'security-compliance.jpg',
      url: '/src/assets/security-compliance.jpg',
      type: 'asset'
    },
    {
      filename: 'software-training.jpg',
      url: '/src/assets/software-training.jpg',
      type: 'asset'
    },
    {
      filename: 'support-pattern.jpg',
      url: '/src/assets/support-pattern.jpg',
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
          Import ALL your existing images ({existingImages.length} total) into the CMS Media Library
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
          <p><strong>Note:</strong> This will attempt to import all {existingImages.length} images from your application.</p>
          <p><strong>Upload images:</strong> Direct import from /lovable-uploads/ (will work)</p>
          <p><strong>Asset images:</strong> From /src/assets/ (may need manual upload if fetch fails)</p>
          <p>If some images fail to import, you can upload them manually through the Media Library.</p>
        </div>
      </CardContent>
    </Card>
  );
};