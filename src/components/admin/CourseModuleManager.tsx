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
  module_id: string;
  title: string;
  description?: string;
  skill_level: 'beginner' | 'expert';
  duration?: string;
  lessons_count: number;
  order_index: number;
  is_active: boolean;
  public_preview: boolean;
  prerequisites?: string[];
  course_id?: string;
  created_at: string;
  updated_at: string;
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
    module_id: "",
    title: "",
    description: "",
    skill_level: "beginner" as "beginner" | "expert",
    duration: "",
    lessons_count: 0,
    order_index: 0,
    is_active: true,
    public_preview: false,
    prerequisites: [] as string[],
    course_id: "",
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Auto-assign modules to courses based on module_id patterns
      // This helps with existing modules that weren't previously assigned
      const modulesWithCourseAssignment = (data || []).map(module => {
        // Ensure skill_level is only beginner or expert
        let correctedSkillLevel: 'beginner' | 'expert' = module.skill_level === 'intermediate' ? 'expert' : module.skill_level as 'beginner' | 'expert';
        
        if (!module.course_id) {
          // Try to match based on module_id patterns
          const moduleId = module.module_id.toLowerCase();
          let matchedCourse = null;
          
          if (moduleId.includes('sba-7a')) {
            matchedCourse = courses.find(c => c.id.includes('sba-7a') && 
              c.id.includes(correctedSkillLevel));
          } else if (moduleId.includes('sba-express')) {
            matchedCourse = courses.find(c => c.id.includes('sba-express') && 
              c.id.includes(correctedSkillLevel));
          } else if (moduleId.includes('commercial-real-estate')) {
            matchedCourse = courses.find(c => c.id.includes('commercial-real-estate') && 
              c.id.includes(correctedSkillLevel));
          } else if (moduleId.includes('healthcare')) {
            matchedCourse = courses.find(c => c.id.includes('healthcare-financing') && 
              c.id.includes(correctedSkillLevel));
          } else if (moduleId.includes('business-acquisition')) {
            matchedCourse = courses.find(c => c.id.includes('business-acquisition') && 
              c.id.includes(correctedSkillLevel));
          }
          
          if (matchedCourse) {
            // Auto-assign the module to the matched course
            supabase
              .from('course_modules')
              .update({ course_id: matchedCourse.id })
              .eq('id', module.id)
              .then(() => {
                console.log(`Auto-assigned module ${module.module_id} to course ${matchedCourse.id}`);
              });
            
            return { ...module, course_id: matchedCourse.id, skill_level: correctedSkillLevel };
          }
        }
        return { ...module, skill_level: correctedSkillLevel };
      });
      
      setModules(modulesWithCourseAssignment);
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
      module_id: "",
      title: "",
      description: "",
      skill_level: "beginner",
      duration: "",
      lessons_count: 0,
      order_index: 0,
      is_active: true,
      public_preview: false,
      prerequisites: [],
      course_id: "",
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
      skill_level: module.skill_level,
      duration: module.duration || "",
      lessons_count: module.lessons_count,
      order_index: module.order_index,
      is_active: module.is_active,
      public_preview: module.public_preview,
      prerequisites: module.prerequisites || [],
      course_id: module.course_id || "",
    });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.module_id.trim() || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Module ID and title are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingModule) {
        // Update existing module
        const { error } = await supabase
          .from('course_modules')
          .update({
            title: formData.title,
            description: formData.description,
            skill_level: formData.skill_level,
            duration: formData.duration,
            lessons_count: formData.lessons_count,
            order_index: formData.order_index,
            is_active: formData.is_active,
            public_preview: formData.public_preview,
            prerequisites: formData.prerequisites,
            course_id: formData.course_id || null,
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
          .from('course_modules')
          .insert({
            module_id: formData.module_id,
            title: formData.title,
            description: formData.description,
            skill_level: formData.skill_level,
            duration: formData.duration,
            lessons_count: formData.lessons_count,
            order_index: formData.order_index,
            is_active: formData.is_active,
            public_preview: formData.public_preview,
            prerequisites: formData.prerequisites,
            course_id: formData.course_id || null,
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
        .from('course_modules')
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
        .from('course_modules')
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

  const getModuleCategory = (moduleId: string) => {
    const id = moduleId.toLowerCase();
    
    // Loan Originator - Front-end sales and client-facing activities
    if (id.includes('business-acquisition') || id.includes('client-relationship') || 
        id.includes('sales') || id.includes('lead-generation') || 
        id.includes('prospecting') || id.includes('marketing') ||
        id.includes('presentation') || id.includes('networking')) {
      return 'loan-originator';
    } 
    
    // Loan Processing - Middle operations and documentation
    else if (id.includes('application-processing') || id.includes('documentation') || 
             id.includes('verification') || id.includes('compliance') ||
             id.includes('workflow') || id.includes('administration') ||
             id.includes('processing') || id.includes('closing')) {
      return 'loan-processing';
    } 
    
    // Loan Underwriting - Risk assessment and decision making  
    else if (id.includes('risk') || id.includes('credit') || id.includes('analysis') ||
             id.includes('underwriting') || id.includes('assessment') ||
             id.includes('evaluation') || id.includes('financial-analysis') ||
             id.includes('due-diligence') || id.includes('portfolio')) {
      return 'loan-underwriting';
    } 
    
    // Default to loan-originator for modules that don't clearly fit other categories
    else {
      return 'loan-originator';
    }
  };

  const getCategorizedModules = () => {
    return {
      'loan-originator': modules.filter(m => getModuleCategory(m.module_id) === 'loan-originator'),
      'loan-processing': modules.filter(m => getModuleCategory(m.module_id) === 'loan-processing'),
      'loan-underwriting': modules.filter(m => getModuleCategory(m.module_id) === 'loan-underwriting')
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
            <TableHead>Skill Level</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preview</TableHead>
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
                  <div className="text-sm text-muted-foreground">{module.module_id}</div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        // Try to auto-assign based on module_id pattern
                        const moduleId = module.module_id.toLowerCase();
                        let targetCourseId = null;
                        
                        // Use the same logic as the trigger function
                        if (moduleId.includes('sba-7a')) {
                          targetCourseId = moduleId.includes('beginner') ? 'sba-7a-beginner' : 'sba-7a-expert';
                        } else if (moduleId.includes('sba-express')) {
                          targetCourseId = moduleId.includes('beginner') ? 'sba-express-beginner' : 'sba-express-expert';
                        } else if (moduleId.includes('commercial-real-estate')) {
                          targetCourseId = moduleId.includes('beginner') ? 'commercial-real-estate-beginner' : 'commercial-real-estate-expert';
                        } else if (moduleId.includes('equipment-financing')) {
                          targetCourseId = moduleId.includes('beginner') ? 'equipment-financing-beginner' : 'equipment-financing-expert';
                        } else if (moduleId.includes('business-lines-of-credit')) {
                          targetCourseId = moduleId.includes('beginner') ? 'business-lines-of-credit-beginner' : 'business-lines-of-credit-expert';
                        } else if (moduleId.includes('invoice-factoring')) {
                          targetCourseId = moduleId.includes('beginner') ? 'invoice-factoring-beginner' : 'invoice-factoring-expert';
                        } else if (moduleId.includes('business-acquisition')) {
                          targetCourseId = moduleId.includes('beginner') ? 'business-acquisition-beginner' : 'business-acquisition-expert';
                        }
                        
                        if (targetCourseId) {
                          try {
                            const { error } = await supabase
                              .from('course_modules')
                              .update({ course_id: targetCourseId })
                              .eq('id', module.id);
                            
                            if (!error) {
                              toast({
                                title: "Success",
                                description: `Module assigned to ${targetCourseId}`,
                              });
                              loadModules();
                            }
                          } catch (error) {
                            console.error('Error assigning module:', error);
                          }
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Auto-assign
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getSkillLevelBadge(module.skill_level)}
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
                <Badge variant={module.public_preview ? "default" : "outline"}>
                  {module.public_preview ? "Public" : "Private"}
                </Badge>
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
              <Label htmlFor="module-id">Module ID</Label>
              <Input
                id="module-id"
                value={formData.module_id}
                onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
                placeholder="e.g., intro-to-loans"
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
                <Select
                  value={formData.skill_level}
                  onValueChange={(value: "beginner" | "expert") =>
                    setFormData(prev => ({ ...prev, skill_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
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
                    <SelectValue placeholder="Select course program (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Course Program</SelectItem>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-preview"
                  checked={formData.public_preview}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, public_preview: checked }))}
                />
                <Label htmlFor="public-preview">Public Preview</Label>
              </div>
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