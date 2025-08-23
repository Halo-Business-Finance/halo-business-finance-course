import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload, Users, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import nflLogos from "@/assets/nfl-logos.jpg";
import nbaLogos from "@/assets/nba-logos.jpg";
import defaultAvatars from "@/assets/default-avatars.jpg";

interface AvatarUploadProps {
  currentAvatar: string;
  userInitials: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

const defaultAvatarOptions = [
  { id: 'default-1', url: defaultAvatars, name: 'Default Options' },
  { id: 'nfl', url: nflLogos, name: 'NFL Teams' },
  { id: 'nba', url: nbaLogos, name: 'NBA Teams' },
];

const individualAvatars = [
  { id: 'avatar-1', url: '/placeholder.svg', name: 'Professional' },
  { id: 'avatar-2', url: '/placeholder.svg', name: 'Abstract' },
  { id: 'avatar-3', url: '/placeholder.svg', name: 'Geometric' },
  { id: 'avatar-4', url: '/placeholder.svg', name: 'Nature' },
  { id: 'avatar-5', url: '/placeholder.svg', name: 'Tech' },
  { id: 'avatar-6', url: '/placeholder.svg', name: 'Minimal' },
];

export const AvatarUpload = ({ currentAvatar, userInitials, onAvatarUpdate }: AvatarUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload an avatar.",
          variant: "destructive"
        });
        return;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        toast({
          title: "Profile update failed",
          description: `Failed to save avatar: ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      onAvatarUpdate(publicUrl);
      setIsOpen(false);
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been successfully updated.",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePresetSelect = async (avatarUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to update your avatar.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (error) {
        console.error('Avatar preset update error:', error);
        toast({
          title: "Update failed",
          description: `Failed to update avatar: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      onAvatarUpdate(avatarUrl);
      setSelectedPreset(avatarUrl);
      setIsOpen(false);
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentAvatar} alt="Profile picture" />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload your own image or choose from our collection of avatars and sports team logos.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="avatars" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="sports" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload your picture</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose a JPG, PNG, or GIF file (max 5MB)
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="avatars" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {individualAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                    selectedPreset === avatar.url
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handlePresetSelect(avatar.url)}
                >
                  <Avatar className="w-full h-20">
                    <AvatarImage src={avatar.url} alt={avatar.name} />
                    <AvatarFallback>
                      <Star className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-center mt-2 font-medium">{avatar.name}</p>
                  {selectedPreset === avatar.url && (
                    <Badge className="absolute -top-1 -right-1 bg-blue-500">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sports" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {defaultAvatarOptions.slice(1).map((option) => (
                <div
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedPreset === option.url
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handlePresetSelect(option.url)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img 
                      src={option.url} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-center">{option.name}</p>
                  {selectedPreset === option.url && (
                    <Badge className="absolute top-2 right-2 bg-blue-500">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              Choose from popular NFL and NBA team logos
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};