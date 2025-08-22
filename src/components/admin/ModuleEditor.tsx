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
import { BookOpen, Plus, Edit, Trash2, Settings, GraduationCap, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModuleData {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  skill_level: 'beginner' | 'intermediate' | 'expert';
  duration?: string;
  lessons_count: number;
  order_index: number;
  prerequisites: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ModuleEditor() {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const moduleData: any = {
        module_id: formData.module_id,
        title: formData.title,
        description: formData.description || null,
        skill_level: formData.skill_level,
        duration: formData.duration || null,
        lessons_count: formData.lessons_count,
        order_index: formData.order_index,
        prerequisites: formData.prerequisites 
          ? formData.prerequisites.split(",").map(p => p.trim()).filter(Boolean)
          : [],
        is_active: formData.is_active,
      };

      if (editingModule) {
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
        const { error } = await supabase
          .from("course_modules")
          .insert(moduleData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Module created successfully",
        });
      }

      resetForm();
      loadModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save module",
        variant: "destructive",
      });
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
    setEditingModule(null);
    setShowAddDialog(false);
  };

  const handleEdit = (module: ModuleData) => {
    setFormData({
      module_id: module.module_id,
      title: module.title,
      description: module.description || "",
      skill_level: module.skill_level,
      duration: module.duration || "",
      lessons_count: module.lessons_count,
      order_index: module.order_index,
      prerequisites: module.prerequisites.join(", "),
      is_active: module.is_active,
    });
    setEditingModule(module);
    setShowAddDialog(true);
  };

  const handleDelete = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      
      loadModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const toggleModuleStatus = async (moduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .update({ is_active: !isActive })
        .eq("id", moduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Module ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      loadModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update module status",
        variant: "destructive",
      });
    }
  };

  const getSkillLevelConfig = (level: string) => {
    return skillLevels.find(sl => sl.value === level) || skillLevels[0];
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

  const stats = {
    total: modules.length,
    active: modules.filter(m => m.is_active).length,
    byLevel: {
      beginner: modules.filter(m => m.skill_level === 'beginner').length,
      intermediate: modules.filter(m => m.skill_level === 'intermediate').length,
      expert: modules.filter(m => m.skill_level === 'expert').length,
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Management</h2>
          <p className="text-muted-foreground">
            Create and manage course modules with skill-level organization
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Edit Module" : "Create New Module"}
              </DialogTitle>
              <DialogDescription>
                Design learning modules with clear skill progression
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module_id">Module ID</Label>
                  <Input
                    id="module_id"
                    value={formData.module_id}
                    onChange={(e) => setFormData({...formData, module_id: e.target.value})}
                    placeholder="e.g., foundations, advanced-lending"
                    required
                    disabled={!!editingModule}
                  />
                  <div className="text-xs text-muted-foreground">
                    Unique identifier (cannot be changed after creation)
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skill_level">Skill Level</Label>
                  <Select 
                    value={formData.skill_level} 
                    onValueChange={(value: any) => setFormData({...formData, skill_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <span>{level.icon}</span>
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this module covers..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="2.5 hours"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lessons_count">Lessons Count</Label>
                  <Input
                    id="lessons_count"
                    type="number"
                    value={formData.lessons_count}
                    onChange={(e) => setFormData({...formData, lessons_count: parseInt(e.target.value) || 0})}
                    placeholder="0"
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

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites (comma-separated module IDs)</Label>
                <Input
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  placeholder="foundations, basic-concepts"
                />
                <div className="text-xs text-muted-foreground">
                  Modules that must be completed before this one
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Module is active and visible to users</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingModule ? "Update Module" : "Create Module"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beginner</CardTitle>
            <span className="text-lg">🌱</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byLevel.beginner}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intermediate</CardTitle>
            <span className="text-lg">🌿</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byLevel.intermediate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert</CardTitle>
            <span className="text-lg">🌳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byLevel.expert}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
          <CardDescription>
            Manage your course module library with skill-based organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Skill Level</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Prerequisites</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => {
                const skillConfig = getSkillLevelConfig(module.skill_level);
                return (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{module.title}</p>
                          <Badge variant="outline" className="text-xs font-mono">
                            {module.module_id}
                          </Badge>
                        </div>
                        {module.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {module.description}
                          </p>
                        )}
                        {module.duration && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {module.duration}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{skillConfig.icon}</span>
                        <Badge variant="outline" className={skillConfig.color}>
                          {skillConfig.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{module.lessons_count}</div>
                    </TableCell>
                    <TableCell>
                      {module.prerequisites.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {module.prerequisites.slice(0, 2).map(prereq => (
                            <Badge key={prereq} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                          {module.prerequisites.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.prerequisites.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(module)}
                          title="Edit Module"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleModuleStatus(module.id, module.is_active)}
                          title={module.is_active ? "Deactivate" : "Activate"}
                        >
                          {module.is_active ? "🔒" : "🔓"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" title="Delete Module">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Module</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{module.title}"? This will also delete all associated videos, articles, and assessments. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(module.id)}
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
                );
              })}
            </TableBody>
          </Table>
          
          {modules.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No modules yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first learning module to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}