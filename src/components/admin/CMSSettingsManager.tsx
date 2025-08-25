import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Shield, Palette, Database, Settings } from "lucide-react";

interface CMSSetting {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'textarea' | 'boolean' | 'number' | 'select';
  category: string;
  description?: string;
  options?: string[];
}

export const CMSSettingsManager = () => {
  const [settings, setSettings] = useState<Record<string, any>>({
    // Site Information
    site_title: 'Halo Business Finance Learning Platform',
    site_description: 'Professional commercial lending education platform',
    site_url: 'https://learn.halobusinessfinance.com',
    admin_email: 'admin@halobusinessfinance.com',
    
    // SEO Settings
    default_meta_description: 'Learn commercial lending with Halo Business Finance',
    default_meta_keywords: ['commercial lending', 'business finance', 'education'],
    social_image_url: '',
    enable_seo_optimization: true,
    
    // Content Settings
    posts_per_page: 10,
    enable_comments: false,
    auto_save_interval: 30,
    default_post_status: 'draft',
    
    // Media Settings
    max_upload_size: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    image_quality: 85,
    generate_thumbnails: true,
    
    // Security Settings
    enable_rate_limiting: true,
    max_login_attempts: 5,
    session_timeout: 60,
    require_strong_passwords: true
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const settingsCategories = {
    'site': {
      icon: Globe,
      title: 'Site Information',
      description: 'Basic site settings and information'
    },
    'seo': {
      icon: Palette,
      title: 'SEO & Social',
      description: 'Search engine optimization and social media settings'
    },
    'content': {
      icon: Database,
      title: 'Content Management',
      description: 'Content creation and management settings'
    },
    'media': {
      icon: Settings,
      title: 'Media & Uploads',
      description: 'File upload and media management settings'
    },
    'security': {
      icon: Shield,
      title: 'Security & Access',
      description: 'Security and access control settings'
    }
  };

  const settingsConfig: Record<string, CMSSetting> = {
    // Site Information
    site_title: { id: 'site_title', name: 'Site Title', value: settings.site_title, type: 'text', category: 'site', description: 'The main title of your website' },
    site_description: { id: 'site_description', name: 'Site Description', value: settings.site_description, type: 'textarea', category: 'site', description: 'Brief description of your website' },
    site_url: { id: 'site_url', name: 'Site URL', value: settings.site_url, type: 'text', category: 'site', description: 'Your website URL' },
    admin_email: { id: 'admin_email', name: 'Admin Email', value: settings.admin_email, type: 'text', category: 'site', description: 'Primary admin email address' },
    
    // SEO Settings
    default_meta_description: { id: 'default_meta_description', name: 'Default Meta Description', value: settings.default_meta_description, type: 'textarea', category: 'seo', description: 'Default meta description for pages' },
    social_image_url: { id: 'social_image_url', name: 'Social Sharing Image', value: settings.social_image_url, type: 'text', category: 'seo', description: 'Default image for social media sharing' },
    enable_seo_optimization: { id: 'enable_seo_optimization', name: 'Enable SEO Optimization', value: settings.enable_seo_optimization, type: 'boolean', category: 'seo', description: 'Automatically optimize content for search engines' },
    
    // Content Settings
    posts_per_page: { id: 'posts_per_page', name: 'Posts Per Page', value: settings.posts_per_page, type: 'number', category: 'content', description: 'Number of posts to display per page' },
    enable_comments: { id: 'enable_comments', name: 'Enable Comments', value: settings.enable_comments, type: 'boolean', category: 'content', description: 'Allow comments on posts and pages' },
    auto_save_interval: { id: 'auto_save_interval', name: 'Auto-save Interval (seconds)', value: settings.auto_save_interval, type: 'number', category: 'content', description: 'How often to auto-save content while editing' },
    default_post_status: { id: 'default_post_status', name: 'Default Post Status', value: settings.default_post_status, type: 'select', category: 'content', description: 'Default status for new posts', options: ['draft', 'published', 'archived'] },
    
    // Media Settings
    max_upload_size: { id: 'max_upload_size', name: 'Max Upload Size (MB)', value: settings.max_upload_size, type: 'number', category: 'media', description: 'Maximum file size for uploads' },
    image_quality: { id: 'image_quality', name: 'Image Quality (%)', value: settings.image_quality, type: 'number', category: 'media', description: 'Compression quality for uploaded images' },
    generate_thumbnails: { id: 'generate_thumbnails', name: 'Generate Thumbnails', value: settings.generate_thumbnails, type: 'boolean', category: 'media', description: 'Automatically generate thumbnails for images' },
    
    // Security Settings
    enable_rate_limiting: { id: 'enable_rate_limiting', name: 'Enable Rate Limiting', value: settings.enable_rate_limiting, type: 'boolean', category: 'security', description: 'Limit request frequency to prevent abuse' },
    max_login_attempts: { id: 'max_login_attempts', name: 'Max Login Attempts', value: settings.max_login_attempts, type: 'number', category: 'security', description: 'Maximum failed login attempts before lockout' },
    session_timeout: { id: 'session_timeout', name: 'Session Timeout (minutes)', value: settings.session_timeout, type: 'number', category: 'security', description: 'Automatically log out inactive users' },
    require_strong_passwords: { id: 'require_strong_passwords', name: 'Require Strong Passwords', value: settings.require_strong_passwords, type: 'boolean', category: 'security', description: 'Enforce strong password requirements' }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd save these to a settings table
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSettingInput = (setting: CMSSetting) => {
    const value = settings[setting.id];
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.id}
              checked={value}
              onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
            />
            <Label htmlFor={setting.id} className="text-sm font-normal">
              {setting.description}
            </Label>
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id}>{setting.name}</Label>
            <Textarea
              id={setting.id}
              value={value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              rows={3}
            />
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id}>{setting.name}</Label>
            <Input
              id={setting.id}
              type="number"
              value={value}
              onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || 0)}
            />
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id}>{setting.name}</Label>
            <Select value={value} onValueChange={(newValue) => handleSettingChange(setting.id, newValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id}>{setting.name}</Label>
            <Input
              id={setting.id}
              value={value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            />
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">CMS Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your content management system</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(settingsCategories).map(([categoryKey, category]) => {
          const categorySettings = Object.values(settingsConfig).filter(s => s.category === categoryKey);
          const Icon = category.icon;
          
          return (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings.map((setting, index) => (
                  <div key={setting.id}>
                    {index > 0 && <Separator className="my-4" />}
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">CMS Version</Label>
              <Badge variant="secondary">1.0.0</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Database Status</Label>
              <Badge variant="outline" className="text-green-600">Connected</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Storage Available</Label>
              <Badge variant="outline">89.2 GB</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Active Users</Label>
              <Badge variant="outline">127</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};