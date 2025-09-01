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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Trash2, Play, Lock, Unlock, Clock, Users, GraduationCap, Building, Landmark, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/hooks/useModules";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";

interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  lessons_count: number;
  order_index: number;
  is_active: boolean | null;
  topics?: string[] | null;
  course_id: string;
  status?: string | null;
  created_at: string | null;
  updated_at: string | null;
  module_id?: string;
  skill_level?: string;
  table_source?: string;
}

export function CourseModuleManager() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("loan-originator");
  const { courses } = useCourses();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    lessons_count: 0,
    order_index: 0,
    is_active: true,
    topics: [] as string[],
    course_id: "",
    status: "locked",
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      // Load modules from both tables to get complete dataset
      const [courseModulesResponse, contentModulesResponse] = await Promise.all([
        supabase
          .from('course_modules')
          .select('id, module_id, title, description, duration, lessons_count, order_index, is_active, course_id, created_at, updated_at, skill_level')
          .order('order_index', { ascending: true }),
        supabase
          .from('course_content_modules')
          .select('id, title, description, duration, lessons_count, order_index, is_active, course_id, topics, status, created_at, updated_at')
          .order('order_index', { ascending: true })
      ]);

      if (courseModulesResponse.error) throw courseModulesResponse.error;
      if (contentModulesResponse.error) throw contentModulesResponse.error;
      
      // Combine and normalize data from both tables
      const courseModulesData = (courseModulesResponse.data || []).map(module => ({
        ...module,
        topics: [] as string[],
        status: 'locked',
        table_source: 'course_modules'
      }));
      
      const contentModulesData = (contentModulesResponse.data || []).map(module => ({
        ...module,
        module_id: module.id,
        skill_level: 'beginner',
        topics: Array.isArray(module.topics) ? module.topics as string[] : [],
        table_source: 'course_content_modules'
      }));
      
      // Combine both datasets
      const allModules = [...courseModulesData, ...contentModulesData];
      
      setModules(allModules);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      lessons_count: 0,
      order_index: 0,
      is_active: true,
      topics: [],
      course_id: "",
      status: "locked",
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
      title: module.title,
      description: module.description || "",
      duration: module.duration || "",
      lessons_count: module.lessons_count,
      order_index: module.order_index,
      is_active: module.is_active,
      topics: module.topics || [],
      course_id: module.course_id || "",
      status: module.status || "locked",
    });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.course_id.trim()) {
      toast({
        title: "Error",
        description: "Title and course are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingModule) {
        // Update existing module
        const { error } = await supabase
          .from('course_content_modules')
          .update({
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            lessons_count: formData.lessons_count,
            order_index: formData.order_index,
            is_active: formData.is_active,
            topics: formData.topics,
            course_id: formData.course_id,
            status: formData.status,
          })
          .eq('id', editingModule.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Module updated successfully",
        });
      } else {
        // Create new module
        const { error } = await supabase
          .from('course_content_modules')
          .insert({
            id: `${formData.course_id}-module-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            lessons_count: formData.lessons_count,
            order_index: formData.order_index,
            is_active: formData.is_active,
            topics: formData.topics,
            course_id: formData.course_id,
            status: formData.status,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Module created successfully",
        });
      }

      setShowAddDialog(false);
      resetForm();
      loadModules();
    } catch (error: any) {
      console.error('Error saving module:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save module",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (module: CourseModule) => {
    try {
      const { error } = await supabase
        .from('course_content_modules')
        .delete()
        .eq('id', module.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      
      loadModules();
    } catch (error: any) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const toggleModuleStatus = async (module: CourseModule) => {
    try {
      const { error } = await supabase
        .from('course_content_modules')
        .update({ is_active: !module.is_active })
        .eq('id', module.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Module ${!module.is_active ? 'activated' : 'deactivated'} successfully`,
      });
      
      loadModules();
    } catch (error: any) {
      console.error('Error updating module status:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update module status",
        variant: "destructive",
      });
    }
  };

  const getModuleCategory = (courseId: string) => {
    const id = courseId.toLowerCase();
    
    // Loan Underwriting - Risk assessment and decision making (most specific first)
    if (id.includes('underwriting') || id.includes('credit-analysis') || 
        id.includes('risk-assessment') || id.includes('financial-analysis') ||
        id.includes('due-diligence')) {
      return 'loan-underwriting';
    } 
    
    // Loan Processing - Middle operations and documentation  
    else if (id.includes('loan-processing') || id.includes('application-processing') || 
             id.includes('documentation') || id.includes('verification') || 
             id.includes('workflow') || id.includes('administration') ||
             id.includes('closing')) {
      return 'loan-processing';
    } 
    
    // Default everything else to loan-originator (including most processing/underwriting modules)
    // This includes modules with names like "sba-loan-processing" which are loan originator focused
    else {
      return 'loan-originator';
    }
  };

  const getCategorizedModules = () => {
    return {
      'loan-originator': modules.filter(m => getModuleCategory(m.course_id) === 'loan-originator'),
      'loan-processing': modules.filter(m => getModuleCategory(m.course_id) === 'loan-processing'),
      'loan-underwriting': modules.filter(m => getModuleCategory(m.course_id) === 'loan-underwriting')
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loan-originator': return <Users className="h-4 w-4" />;
      case 'loan-processing': return <BookOpen className="h-4 w-4" />;
      case 'loan-underwriting': return <GraduationCap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'loan-originator': return 'Loan Originator';
      case 'loan-processing': return 'Loan Processing';
      case 'loan-underwriting': return 'Loan Underwriting';
      default: return 'Other';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'loan-originator': return 'Client acquisition, relationship building, and sales-focused modules';
      case 'loan-processing': return 'Documentation, compliance, workflow, and administrative modules';
      case 'loan-underwriting': return 'Risk assessment, credit analysis, and decision-making modules';
      default: return 'Additional course modules';
    }
  };

  const getSkillLevelBadge = (level: string) => {
    const variants = {
      beginner: "bg-emerald-100 text-emerald-800",
      expert: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={variants[level as keyof typeof variants] || variants.beginner}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const renderModuleTable = (categoryModules: CourseModule[]) => {
    if (categoryModules.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No modules found in this category.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module</TableHead>
            <TableHead>Course Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryModules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{module.title}</div>
                  <div className="text-sm text-muted-foreground">{module.id}</div>
                  {module.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {module.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {module.course_id ? (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium text-sm">
                        {courses.find(c => c.id === module.course_id)?.title || module.course_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {module.course_id}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      ⚠ Unassigned
                    </Badge>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{module.status || 'locked'}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {module.duration || 'N/A'}
                </div>
              </TableCell>
               <TableCell>
                 <div className="flex items-center gap-1">
                   <Users className="h-4 w-4 text-muted-foreground" />
                   {module.lessons_count}
                 </div>
               </TableCell>
               <TableCell>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => toggleModuleStatus(module)}
                   className="p-0 h-auto"
                 >
                   {module.is_active ? (
                     <Badge variant="default" className="cursor-pointer">
                       <Unlock className="h-3 w-3 mr-1" />
                       Active
                     </Badge>
                   ) : (
                     <Badge variant="secondary" className="cursor-pointer">
                       <Lock className="h-3 w-3 mr-1" />
                       Inactive
                     </Badge>
                   )}
                 </Button>
               </TableCell>
               <TableCell>
                 <Badge variant="outline">{module.order_index}</Badge>
               </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
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
                          Are you sure you want to delete "{module.title}"? This action cannot be undone and will affect all associated content.
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categorizedModules = getCategorizedModules();

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
                Manage individual course modules organized by lending categories
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="loan-originator" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {getCategoryIcon('loan-originator')}
                  {getCategoryTitle('loan-originator')}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categorizedModules['loan-originator'].length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="loan-processing" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {getCategoryIcon('loan-processing')}
                  {getCategoryTitle('loan-processing')}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categorizedModules['loan-processing'].length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="loan-underwriting" 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {getCategoryIcon('loan-underwriting')}
                  {getCategoryTitle('loan-underwriting')}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categorizedModules['loan-underwriting'].length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Loan Originator Tab */}
              <TabsContent value="loan-originator" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{getCategoryTitle('loan-originator')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryDescription('loan-originator')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {categorizedModules['loan-originator'].length} modules
                  </Badge>
                </div>
                {renderModuleTable(categorizedModules['loan-originator'])}
              </TabsContent>

              {/* Loan Processing Tab */}
              <TabsContent value="loan-processing" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{getCategoryTitle('loan-processing')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryDescription('loan-processing')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {categorizedModules['loan-processing'].length} modules
                  </Badge>
                </div>
                {renderModuleTable(categorizedModules['loan-processing'])}
              </TabsContent>

              {/* Loan Underwriting Tab */}
              <TabsContent value="loan-underwriting" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{getCategoryTitle('loan-underwriting')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryDescription('loan-underwriting')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {categorizedModules['loan-underwriting'].length} modules
                  </Badge>
                </div>
                {renderModuleTable(categorizedModules['loan-underwriting'])}
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Module Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-program">Course Program</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, course_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course program" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lessons-count">Lessons Count</Label>
                <Input
                  id="lessons-count"
                  type="number"
                  value={formData.lessons_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessons_count: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-index">Order Index</Label>
                <Input
                  id="order-index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
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
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}