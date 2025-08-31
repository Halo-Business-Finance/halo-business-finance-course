import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Trash2, Settings, GraduationCap, Users, BarChart3, Download, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourseModule {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  skill_level: string;
  duration?: string;
  lessons_count: number;
  order_index: number;
  prerequisites?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseManagerProps {}

export function CourseManager({}: CourseManagerProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    description: "",
    skill_level: "beginner" as 'beginner' | 'intermediate' | 'expert',
    duration: "",
    lessons_count: 0,
    order_index: 0,
    prerequisites: "",
    is_active: true,
  });

  const skillLevels = [
    { value: "beginner", label: "Beginner", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
    { value: "intermediate", label: "Intermediate", icon: "🌿", color: "bg-amber-100 text-amber-800" },
    { value: "expert", label: "Expert", icon: "🌳", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      const { data: modulesData, error } = await supabase
        .from("course_modules")
        .select("*")
        .order("order_index");

      if (error) throw error;
      setModules(modulesData || []);

    } catch (error) {
      console.error("Error loading modules:", error);
      toast({
        title: "Error",
        description: "Failed to load module data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      module_id: "",
      title: "",
      description: "",
      skill_level: "beginner",
      duration: "",
      lessons_count: 0,
      order_index: 0,
      prerequisites: "",
      is_active: true,
    });
  };

  const handleCreate = () => {
    setEditingModule(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (module: CourseModule) => {
    setEditingModule(module);
    setFormData({
      module_id: module.module_id,
      title: module.title,
      description: module.description || "",
      skill_level: module.skill_level as 'beginner' | 'intermediate' | 'expert',
      duration: module.duration || "",
      lessons_count: module.lessons_count,
      order_index: module.order_index,
      prerequisites: Array.isArray(module.prerequisites) ? module.prerequisites.join(", ") : "",
      is_active: module.is_active,
    });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.module_id.trim()) {
      toast({
        title: "Error",
        description: "Module ID and title are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const moduleData = {
        module_id: formData.module_id,
        title: formData.title,
        description: formData.description,
        skill_level: formData.skill_level,
        duration: formData.duration,
        lessons_count: formData.lessons_count,
        order_index: formData.order_index,
        prerequisites: formData.prerequisites ? formData.prerequisites.split(",").map(p => p.trim()) : [],
        is_active: formData.is_active,
      };

      if (editingModule) {
        // Update existing module
        const { error } = await supabase
          .from("course_modules")
          .update(moduleData)
          .eq("id", editingModule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Module updated successfully",
        });
      } else {
        // Create new module
        const { error } = await supabase
          .from("course_modules")
          .insert([moduleData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Module created successfully",
        });
      }

      setShowAddDialog(false);
      resetForm();
      await loadModules();

    } catch (error) {
      console.error("Error saving module:", error);
      toast({
        title: "Error",
        description: "Failed to save module",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (module: CourseModule) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", module.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });

      await loadModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (module: CourseModule) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .update({ is_active: !module.is_active })
        .eq("id", module.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Module ${!module.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      await loadModules();
    } catch (error) {
      console.error("Error toggling module status:", error);
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading modules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Modules Management
              </CardTitle>
              <CardDescription>
                Manage course modules and their content
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Skill Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-mono text-sm">{module.module_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{module.title}</div>
                        {module.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {module.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={skillLevels.find(level => level.value === module.skill_level)?.color}
                      >
                        {skillLevels.find(level => level.value === module.skill_level)?.icon}{" "}
                        {module.skill_level?.charAt(0).toUpperCase() + module.skill_level?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{module.duration || "Not set"}</TableCell>
                    <TableCell>{module.lessons_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={module.is_active}
                          onCheckedChange={() => toggleActive(module)}
                        />
                        <span className="text-sm">
                          {module.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Module</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{module.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(module)}
                                className="bg-red-600 hover:bg-red-700"
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
          </div>

          {modules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No modules found. Create your first module to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Module Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </DialogTitle>
            <DialogDescription>
              {editingModule ? 'Update module information' : 'Create a new course module'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="module-id">Module ID</Label>
              <Input
                id="module-id"
                value={formData.module_id}
                onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
                placeholder="e.g., sba-7a-loans"
                disabled={!!editingModule}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Module title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Module description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="skill-level">Skill Level</Label>
                <select
                  id="skill-level"
                  value={formData.skill_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, skill_level: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {skillLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.icon} {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 45 minutes"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lessons-count">Lessons Count</Label>
                <Input
                  id="lessons-count"
                  type="number"
                  min="0"
                  value={formData.lessons_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessons_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-index">Order Index</Label>
                <Input
                  id="order-index"
                  type="number"
                  min="0"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
              <Input
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="e.g., basic-finance, accounting-101"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingModule ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}