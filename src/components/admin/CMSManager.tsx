import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  User, 
  Image,
  Menu,
  Tag,
  Folder,
  Globe,
  Settings,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  featured_image_url?: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  author_id?: string;
  category_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
}

interface CMSTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface CMSMedia {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  public_url: string;
  folder_path: string;
  tags?: string[];
  created_at: string;
}

const pageTemplates = [
  { value: 'default', label: 'Default' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'content', label: 'Content Page' },
  { value: 'contact', label: 'Contact Page' },
];

export function CMSManager() {
  const [activeTab, setActiveTab] = useState("pages");
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [tags, setTags] = useState<CMSTag[]>([]);
  const [media, setMedia] = useState<CMSMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [editingCategory, setEditingCategory] = useState<CMSCategory | null>(null);
  const [editingTag, setEditingTag] = useState<CMSTag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [pageForm, setPageForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    featured_image_url: "",
    template: "default",
    status: "draft" as 'draft' | 'published' | 'archived',
    category_id: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    slug: "",
    color: "#3B82F6",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pages with categories
      const { data: pagesData, error: pagesError } = await supabase
        .from("cms_pages")
        .select(`
          *,
          category:cms_categories(name, slug)
        `)
        .order("updated_at", { ascending: false });

      if (pagesError) throw pagesError;
      setPages((pagesData || []) as CMSPage[]);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("cms_categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("cms_tags")
        .select("*")
        .order("name");

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

      // Load media
      const { data: mediaData, error: mediaError } = await supabase
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

    } catch (error) {
      console.error("Error loading CMS data:", error);
      toast({
        title: "Error",
        description: "Failed to load CMS data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = pageForm.slug || generateSlug(pageForm.title);
      
      const pageData = {
        title: pageForm.title,
        slug,
        content: pageForm.content,
        excerpt: pageForm.excerpt || pageForm.content.slice(0, 200) + "...",
        meta_title: pageForm.meta_title || pageForm.title,
        meta_description: pageForm.meta_description,
        meta_keywords: pageForm.meta_keywords ? pageForm.meta_keywords.split(",").map(k => k.trim()) : [],
        featured_image_url: pageForm.featured_image_url || null,
        template: pageForm.template,
        status: pageForm.status,
        category_id: pageForm.category_id || null,
        published_at: pageForm.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingPage) {
        const { error } = await supabase
          .from("cms_pages")
          .update(pageData)
          .eq("id", editingPage.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Page updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("cms_pages")
          .insert(pageData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Page created successfully",
        });
      }

      resetPageForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        variant: "destructive",
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = categoryForm.slug || generateSlug(categoryForm.name);
      
      const categoryData = {
        name: categoryForm.name,
        slug,
        description: categoryForm.description,
        sort_order: categoryForm.sort_order,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("cms_categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("cms_categories")
          .insert(categoryData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      resetCategoryForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = tagForm.slug || generateSlug(tagForm.name);
      
      const tagData = {
        name: tagForm.name,
        slug,
        color: tagForm.color,
        description: tagForm.description,
      };

      if (editingTag) {
        const { error } = await supabase
          .from("cms_tags")
          .update(tagData)
          .eq("id", editingTag.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("cms_tags")
          .insert(tagData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tag created successfully",
        });
      }

      resetTagForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tag",
        variant: "destructive",
      });
    }
  };

  const resetPageForm = () => {
    setPageForm({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      featured_image_url: "",
      template: "default",
      status: "draft",
      category_id: "",
    });
    setEditingPage(null);
    setShowPageDialog(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      sort_order: 0,
    });
    setEditingCategory(null);
    setShowCategoryDialog(false);
  };

  const resetTagForm = () => {
    setTagForm({
      name: "",
      slug: "",
      color: "#3B82F6",
      description: "",
    });
    setEditingTag(null);
    setShowTagDialog(false);
  };

  const handleEditPage = (page: CMSPage) => {
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || "",
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      meta_keywords: page.meta_keywords?.join(", ") || "",
      featured_image_url: page.featured_image_url || "",
      template: page.template,
      status: page.status,
      category_id: page.category_id || "",
    });
    setEditingPage(page);
    setShowPageDialog(true);
  };

  const handleEditCategory = (category: CMSCategory) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sort_order: category.sort_order,
    });
    setEditingCategory(category);
    setShowCategoryDialog(true);
  };

  const handleEditTag = (tag: CMSTag) => {
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      description: tag.description || "",
    });
    setEditingTag(tag);
    setShowTagDialog(true);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from("cms_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const togglePageStatus = async (pageId: string, currentStatus: 'draft' | 'published' | 'archived') => {
    try {
      const newStatus: 'draft' | 'published' | 'archived' = currentStatus === 'published' ? 'draft' : 'published';
      const updateData: any = { 
        status: newStatus 
      };
      
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("cms_pages")
        .update(updateData)
        .eq("id", pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Page ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update page status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      default: return "outline";
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management System</h2>
          <p className="text-muted-foreground">
            Manage pages, media, categories, and website content
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            Media Library
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Folder className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="menus">
            <Menu className="h-4 w-4 mr-2" />
            Menus
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetPageForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPage ? "Edit Page" : "Create New Page"}
                  </DialogTitle>
                  <DialogDescription>
                    Create or edit website pages with SEO optimization
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handlePageSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={pageForm.title}
                        onChange={(e) => {
                          setPageForm({...pageForm, title: e.target.value});
                          if (!pageForm.slug) {
                            setPageForm(prev => ({...prev, slug: generateSlug(e.target.value)}));
                          }
                        }}
                        placeholder="Page title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={pageForm.slug}
                        onChange={(e) => setPageForm({...pageForm, slug: e.target.value})}
                        placeholder="page-url-slug"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select 
                        value={pageForm.template} 
                        onValueChange={(value) => setPageForm({...pageForm, template: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pageTemplates.map(template => (
                            <SelectItem key={template.value} value={template.value}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={pageForm.category_id} 
                        onValueChange={(value) => setPageForm({...pageForm, category_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Category</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={pageForm.excerpt}
                      onChange={(e) => setPageForm({...pageForm, excerpt: e.target.value})}
                      placeholder="Brief description of the page"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={pageForm.content}
                      onChange={(e) => setPageForm({...pageForm, content: e.target.value})}
                      placeholder="Write your page content here..."
                      rows={12}
                      required
                    />
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">SEO Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input
                          id="meta_title"
                          value={pageForm.meta_title}
                          onChange={(e) => setPageForm({...pageForm, meta_title: e.target.value})}
                          placeholder="SEO title (defaults to page title)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                          id="meta_description"
                          value={pageForm.meta_description}
                          onChange={(e) => setPageForm({...pageForm, meta_description: e.target.value})}
                          placeholder="SEO description (max 160 characters)"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                        <Input
                          id="meta_keywords"
                          value={pageForm.meta_keywords}
                          onChange={(e) => setPageForm({...pageForm, meta_keywords: e.target.value})}
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="featured_image">Featured Image URL</Label>
                        <Input
                          id="featured_image"
                          value={pageForm.featured_image_url}
                          onChange={(e) => setPageForm({...pageForm, featured_image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="publish"
                      checked={pageForm.status === 'published'}
                      onCheckedChange={(checked) => setPageForm({...pageForm, status: checked ? 'published' as const : 'draft' as const})}
                    />
                    <Label htmlFor="publish">Publish immediately</Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetPageForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPage ? "Update Page" : "Create Page"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pages.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pages.filter(p => p.status === 'published').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pages.filter(p => p.status === 'draft').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>
                Manage your website pages and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{page.title}</p>
                          <p className="text-xs text-muted-foreground">/{page.slug}</p>
                          {page.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {page.excerpt}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {page.category ? (
                          <Badge variant="outline">{page.category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(page.status)}>
                          {page.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{page.template}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(page.updated_at), "MMM dd, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(page.updated_at), "HH:mm")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPage(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePageStatus(page.id, page.status)}
                          >
                            {page.status === 'published' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = `/${page.slug}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Page</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{page.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePage(page.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Categories</h3>
              <p className="text-sm text-muted-foreground">Organize your content with categories</p>
            </div>

            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetCategoryForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name *</Label>
                    <Input
                      id="cat-name"
                      value={categoryForm.name}
                      onChange={(e) => {
                        setCategoryForm({...categoryForm, name: e.target.value});
                        if (!categoryForm.slug) {
                          setCategoryForm(prev => ({...prev, slug: generateSlug(e.target.value)}));
                        }
                      }}
                      placeholder="Category name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cat-slug">Slug *</Label>
                    <Input
                      id="cat-slug"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                      placeholder="category-slug"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cat-description">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Category description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cat-order">Sort Order</Label>
                    <Input
                      id="cat-order"
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetCategoryForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {category.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {pages.filter(p => p.category_id === category.id).length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Tags</h3>
              <p className="text-sm text-muted-foreground">Tag your content for better organization</p>
            </div>

            <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetTagForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTag ? "Edit Tag" : "Create New Tag"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleTagSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tag-name">Name *</Label>
                    <Input
                      id="tag-name"
                      value={tagForm.name}
                      onChange={(e) => {
                        setTagForm({...tagForm, name: e.target.value});
                        if (!tagForm.slug) {
                          setTagForm(prev => ({...prev, slug: generateSlug(e.target.value)}));
                        }
                      }}
                      placeholder="Tag name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tag-slug">Slug *</Label>
                    <Input
                      id="tag-slug"
                      value={tagForm.slug}
                      onChange={(e) => setTagForm({...tagForm, slug: e.target.value})}
                      placeholder="tag-slug"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tag-color">Color</Label>
                    <Input
                      id="tag-color"
                      type="color"
                      value={tagForm.color}
                      onChange={(e) => setTagForm({...tagForm, color: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tag-description">Description</Label>
                    <Textarea
                      id="tag-description"
                      value={tagForm.description}
                      onChange={(e) => setTagForm({...tagForm, description: e.target.value})}
                      placeholder="Tag description"
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetTagForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTag ? "Update Tag" : "Create Tag"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <Card key={tag.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                        {tag.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tag.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Slug: {tag.slug}
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Media Library</h3>
              <p className="text-sm text-muted-foreground">Manage your images, videos, and documents</p>
            </div>

            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item) => (
                  <Card key={item.id} className="p-2">
                    <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                      {item.file_type.startsWith('image/') ? (
                        <img 
                          src={item.public_url} 
                          alt={item.alt_text || item.original_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{item.original_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file_size / 1024).toFixed(1)} KB
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Navigation Menus</h3>
              <p className="text-sm text-muted-foreground">Manage your site navigation</p>
            </div>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Menu
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Menu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Menu Management</h3>
                <p className="text-muted-foreground">
                  Menu management functionality will be implemented here.
                  This will allow you to create and organize navigation menus.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}