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
import { BookOpen, Plus, Edit, Trash2, Settings, GraduationCap, Users, BarChart3, Download, Upload, Eye, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courseData, Course } from "@/data/courseData";

interface CourseManagerProps {}

export function CourseManager({}: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>(courseData.allCourses);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "expert",
  });

  const skillLevels = [
    { value: "beginner", label: "Beginner", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
    { value: "intermediate", label: "Intermediate", icon: "🌿", color: "bg-amber-100 text-amber-800" },
    { value: "expert", label: "Expert", icon: "🌳", color: "bg-red-100 text-red-800" },
  ];

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      level: "beginner",
    });
  };

  const handleCreate = () => {
    setEditingCourse(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
    });
    setShowAddDialog(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.id.trim()) {
      toast({
        title: "Error",
        description: "Course ID and title are required",
        variant: "destructive",
      });
      return;
    }

    const newCourse: Course = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      level: formData.level,
      modules: [] // Will be populated with modules later
    };

    if (editingCourse) {
      // Update existing course
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? { ...newCourse, modules: course.modules } : course
      ));
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } else {
      // Create new course
      setCourses(prev => [...prev, newCourse]);
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = (course: Course) => {
    setCourses(prev => prev.filter(c => c.id !== course.id));
    toast({
      title: "Success",
      description: "Course deleted successfully",
    });
  };

  const handleEditImage = (course: Course) => {
    toast({
      title: "Edit Course Image",
      description: `Opening image editor for "${course.title}"`,
    });
    // TODO: Implement image editing functionality
  };

  const getModuleCount = (course: Course) => {
    return course.modules?.length || 0;
  };

  const getCourseStats = (course: Course) => {
    const totalModules = getModuleCount(course);
    const completedModules = course.modules?.filter(m => m.status === 'completed').length || 0;
    return {
      total: totalModules,
      completed: completedModules,
      progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };
  };

  // Group courses by type (remove skill level from title)
  const courseTypes = courses.reduce((acc, course) => {
    const baseTitle = course.title.replace(/ - (Beginner|Intermediate|Expert)$/, '');
    if (!acc[baseTitle]) {
      acc[baseTitle] = [];
    }
    acc[baseTitle].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Course Programs Management
              </CardTitle>
              <CardDescription>
                Manage the 13 core course programs - each available in Beginner, Intermediate, and Expert levels
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(courseTypes).map(([courseType, courseLevels]) => (
              <Card key={courseType} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{courseType}</CardTitle>
                      <CardDescription>
                        {courseLevels.length} skill levels available
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {courseLevels.reduce((sum, course) => sum + getModuleCount(course), 0)} modules total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3">
                    {courseLevels.map((course) => {
                      const stats = getCourseStats(course);
                      return (
                        <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-4">
                            <Badge 
                              className={skillLevels.find(level => level.value === course.level)?.color}
                            >
                              {skillLevels.find(level => level.value === course.level)?.icon}{" "}
                              {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                            </Badge>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{stats.total} modules</div>
                              <div className="text-xs text-muted-foreground">
                                {stats.completed} completed ({stats.progress}%)
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditImage(course)}
                                title="Edit Course Image"
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(course)}
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
                                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{course.title}"? This action cannot be undone and will affect all associated modules.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(course)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.keys(courseTypes).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No courses found. Create your first course to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCourse.title}</DialogTitle>
              <DialogDescription>{selectedCourse.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{getModuleCount(selectedCourse)}</div>
                  <div className="text-sm text-muted-foreground">Total Modules</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{getCourseStats(selectedCourse).completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{getCourseStats(selectedCourse).progress}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
              </div>
              
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Course Modules</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCourse.modules.map((module, index) => (
                      <div key={module.id} className="flex items-center justify-between p-3 rounded border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-muted-foreground">{module.duration} • {module.lessons} lessons</div>
                          </div>
                        </div>
                        <Badge variant={
                          module.status === "completed" ? "success" : 
                          module.status === "in-progress" ? "default" : "outline"
                        }>
                          {module.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course information' : 'Create a new course program'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-id">Course ID</Label>
              <Input
                id="course-id"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                placeholder="e.g., sba-7a-loans-beginner"
                disabled={!!editingCourse}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Course title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skill-level">Skill Level</Label>
              <select
                id="skill-level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.icon} {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}