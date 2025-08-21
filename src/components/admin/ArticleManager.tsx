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
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar, User, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ArticleData {
  id: string;
  module_id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  featured_image_url?: string;
  is_published: boolean;
  publish_date?: string;
  order_index: number;
  reading_time_minutes?: number;
  tags: string[];
  category: string;
  created_at: string;
}

interface Module {
  module_id: string;
  title: string;
}

export function ArticleManager() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    category: "general",
    tags: "",
    order_index: 0,
    is_published: false,
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "tutorial", label: "Tutorial" },
    { value: "guide", label: "Guide" },
    { value: "reference", label: "Reference" },
    { value: "case-study", label: "Case Study" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("course_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("module_id, title")
        .eq("is_active", true)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load article data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const readingTime = calculateReadingTime(formData.content);
      
      const articleData: any = {
        module_id: formData.module_id,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.slice(0, 200) + "...",
        featured_image_url: formData.featured_image_url || null,
        category: formData.category,
        order_index: formData.order_index,
        reading_time_minutes: readingTime,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        is_published: formData.is_published,
        publish_date: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("course_articles")
          .update(articleData)
          .eq("id", editingArticle.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("course_articles")
          .insert(articleData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Article created successfully",
        });
      }

      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      module_id: "",
      title: "",
      content: "",
      excerpt: "",
      featured_image_url: "",
      category: "general",
      tags: "",
      order_index: 0,
      is_published: false,
    });
    setEditingArticle(null);
    setShowAddDialog(false);
  };

  const handleEdit = (article: ArticleData) => {
    setFormData({
      module_id: article.module_id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      featured_image_url: article.featured_image_url || "",
      category: article.category,
      tags: article.tags.join(", "),
      order_index: article.order_index,
      is_published: article.is_published,
    });
    setEditingArticle(article);
    setShowAddDialog(true);
  };

  const handleDelete = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("course_articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (articleId: string, isPublished: boolean) => {
    try {
      const updateData: any = { 
        is_published: !isPublished 
      };
      
      if (!isPublished) {
        updateData.publish_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("course_articles")
        .update(updateData)
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!isPublished ? 'published' : 'unpublished'} successfully`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update article status",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "tutorial": return "default";
      case "guide": return "secondary";
      case "reference": return "outline";
      case "case-study": return "destructive";
      default: return "outline";
    }
  };

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
          <h2 className="text-2xl font-bold">Article Management</h2>
          <p className="text-muted-foreground">
            Create and manage educational articles, guides, and tutorials
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                Write educational content to enhance your course modules
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select 
                    value={formData.module_id} 
                    onValueChange={(value) => setFormData({...formData, module_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module.module_id} value={module.module_id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt (optional)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief description of the article"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your article content here..."
                  rows={12}
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Estimated reading time: {calculateReadingTime(formData.content)} minutes
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image URL (optional)</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="finance, tutorial, guide"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order">Order Index</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                />
                <Label htmlFor="publish">Publish immediately</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingArticle ? "Update Article" : "Create Article"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {articles.filter(a => a.is_published).length}
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
              {articles.filter(a => !a.is_published).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            Manage your educational content library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reading Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                      {article.tags.length > 0 && (
                        <div className="flex gap-1">
                          {article.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {modules.find(m => m.module_id === article.module_id)?.title || article.module_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(article.category)}>
                      {article.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={article.is_published ? "default" : "secondary"}>
                        {article.is_published ? "Published" : "Draft"}
                      </Badge>
                      {article.publish_date && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(article.publish_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{article.reading_time_minutes || 0} min</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(article)}
                        title="Edit Article"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePublishStatus(article.id, article.is_published)}
                        title={article.is_published ? "Unpublish" : "Publish"}
                      >
                        {article.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="Delete Article">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{article.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(article.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
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
          
          {articles.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No articles yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start creating educational content for your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}