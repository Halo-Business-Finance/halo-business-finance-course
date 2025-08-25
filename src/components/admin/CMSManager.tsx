import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Menu, Tag, Folder, Settings } from "lucide-react";
import { CMSPageManager } from './CMSPageManager';
import { MediaLibrary } from './MediaLibrary';
import { MediaImporter } from './MediaImporter';
import { CMSMenuManager } from './CMSMenuManager';
import { CMSCategoryManager } from './CMSCategoryManager';
import { CMSTagManager } from './CMSTagManager';
import { CMSSettingsManager } from './CMSSettingsManager';
import { ContentImporter } from './ContentImporter';

const CMSManager = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Content Management System</h2>
        <p className="text-muted-foreground mt-1">
          Manage website content, media, navigation, and site structure
        </p>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline">✅ Pages</Badge>
          <Badge variant="outline">✅ Media Library</Badge>
          <Badge variant="outline">✅ Navigation</Badge>
          <Badge variant="outline">✅ Categories & Tags</Badge>
          <Badge variant="outline">✅ SEO Ready</Badge>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="menus" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Menus</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">
          <ContentImporter />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Page Management
              </CardTitle>
              <CardDescription>
                Create and manage website pages with SEO optimization and content blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CMSPageManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaImporter />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Library
              </CardTitle>
              <CardDescription>
                Upload, organize, and manage images, documents, and other media files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaLibrary />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Navigation Menus
              </CardTitle>
              <CardDescription>
                Create and manage website navigation menus and menu items with hierarchical structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CMSMenuManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CMSCategoryManager />
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <CMSTagManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <CMSSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMSManager;