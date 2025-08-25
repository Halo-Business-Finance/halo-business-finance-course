import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, Tag, Palette } from "lucide-react";

interface CMSTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  created_at: string;
}

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#64748B', label: 'Gray' }
];

export const CMSTagManager = () => {
  const [tags, setTags] = useState<CMSTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CMSTag | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6'
    });
    setEditingTag(null);
  };

  const handleEdit = (tag: CMSTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const tagData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };

      if (editingTag) {
        const { error } = await supabase
          .from('cms_tags')
          .update(tagData)
          .eq('id', editingTag.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Tag updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('cms_tags')
          .insert([tagData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Tag created successfully"
        });
      }

      await fetchTags();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: "Error",
        description: "Failed to save tag",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tag: CMSTag) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('cms_tags')
        .delete()
        .eq('id', tag.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Tag deleted successfully"
      });
      
      await fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tags</h3>
          <p className="text-sm text-muted-foreground">Create colored tags to organize and categorize content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Edit Tag' : 'Create Tag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      title={color.label}
                    />
                  ))}
                </div>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="mt-2 h-10"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tags created yet</p>
                <p className="text-sm">Create your first tag to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{tag.slug}</code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tag.description || 'No description'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(tag)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(tag)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};