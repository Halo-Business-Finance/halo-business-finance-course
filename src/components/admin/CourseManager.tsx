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
import { courseData, Course, Module } from "@/data/courseData";

interface CourseManagerProps {}

export function CourseManager({}: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>(courseData.allCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const { toast } = useToast();

  const [courseFormData, setCourseFormData] = useState({
    id: "",
    title: "",
    description: "",
  });

  const [moduleFormData, setModuleFormData] = useState({
    id: "",
    title: "",
    description: "",
    duration: "4 hours",
    lessons: 7,
    status: "locked" as "locked" | "available" | "in-progress" | "completed",
    topics: [] as string[],
  });

  const resetCourseForm = () => {
    setCourseFormData({
      id: "",
      title: "",
      description: "",
    });
  };

  const resetModuleForm = () => {
    setModuleFormData({
      id: "",
      title: "",
      description: "",
      duration: "4 hours", 
      lessons: 7,
      status: "locked",
      topics: [],
    });
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    resetCourseForm();
    setShowAddCourseDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      id: course.id,
      title: course.title,
      description: course.description,
    });
    setShowAddCourseDialog(true);
  };

  const handleCreateModule = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    setSelectedCourse(course);
    setEditingModule(null);
    resetModuleForm();
    setShowAddModuleDialog(true);
  };

  const handleEditModule = (courseId: string, module: Module) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    setSelectedCourse(course);
    setEditingModule(module);
    setModuleFormData({
      id: module.id,
      title: module.title,
      description: module.description,
      duration: module.duration,
      lessons: module.lessons,
      status: module.status,
      topics: module.topics,
    });
    setShowAddModuleDialog(true);
  };

  const saveCourse = () => {
    if (!courseFormData.title.trim()) {
      toast({
        title: "Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }

    const newCourse: Course = {
      id: courseFormData.id || courseFormData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: courseFormData.title,
      description: courseFormData.description,
      modules: editingCourse ? editingCourse.modules : [],
    };

    if (editingCourse) {
      // Update existing course
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? newCourse : course
      ));
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } else {
      // Add new course
      setCourses(prev => [...prev, newCourse]);
      toast({
        title: "Success", 
        description: "Course created successfully",
      });
    }

    setShowAddCourseDialog(false);
    resetCourseForm();
  };

  const saveModule = () => {
    if (!selectedCourse || !moduleFormData.title.trim()) {
      toast({
        title: "Error",
        description: "Module title is required",
        variant: "destructive",
      });
      return;
    }

    const sampleQuestions = [
      {
        id: "q1",
        question: "Sample question for this module",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a sample question that would need to be customized."
      }
    ];

    const newModule: Module = {
      id: moduleFormData.id || moduleFormData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: moduleFormData.title,
      description: moduleFormData.description,
      duration: moduleFormData.duration,
      lessons: moduleFormData.lessons,
      progress: 0,
      status: moduleFormData.status,
      topics: moduleFormData.topics,
      loanExamples: [],
      videos: [],
      caseStudies: [],
      scripts: [],
      quiz: {
        id: `${moduleFormData.id || 'new'}-quiz`,
        moduleId: moduleFormData.id || 'new',
        title: `${moduleFormData.title} Quiz`,
        description: `Test your knowledge of ${moduleFormData.title}`,
        questions: sampleQuestions,
        passingScore: 80,
        maxAttempts: 3,
        timeLimit: 30,
      }
    };

    setCourses(prev => prev.map(course => {
      if (course.id === selectedCourse.id) {
        if (editingModule) {
          // Update existing module
          return {
            ...course,
            modules: course.modules.map(module => 
              module.id === editingModule.id ? newModule : module
            )
          };
        } else {
          // Add new module
          return {
            ...course,
            modules: [...course.modules, newModule]
          };
        }
      }
      return course;
    }));

    toast({
      title: "Success",
      description: editingModule ? "Module updated successfully" : "Module created successfully",
    });

    setShowAddModuleDialog(false);
    resetModuleForm();
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Success",
      description: "Course deleted successfully",
    });
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          modules: course.modules.filter(module => module.id !== moduleId)
        };
      }
      return course;
    }));
    toast({
      title: "Success", 
      description: "Module deleted successfully",
    });
  };

  const exportCourses = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'halo-courses.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Success",
      description: "Courses exported successfully",
    });
  };

  const addTopicToModule = (topic: string) => {
    if (!topic.trim()) return;
    
    setModuleFormData(prev => ({
      ...prev,
      topics: [...prev.topics, topic.trim()]
    }));
  };

  const removeTopic = (index: number) => {
    setModuleFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Management
              </CardTitle>
              <CardDescription>
                Manage training courses, modules, and learning content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCourses}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreateCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {course.modules.length} Modules
                    </Badge>
                    <Badge variant="outline">
                      {course.modules.reduce((total, module) => total + module.lessons, 0)} Lessons
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCreateModule(course.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Module
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCourse(course.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {/* Module List */}
                  <div className="mt-4 space-y-2">
                    {course.modules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.lessons} lessons • {module.duration}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditModule(course.id, module)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Module</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{module.title}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteModule(course.id, module.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course information' : 'Create a new training course'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                value={courseFormData.title}
                onChange={(e) => setCourseFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter course title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={courseFormData.description}
                onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter course description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCourse}>
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Module Dialog */}
      <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </DialogTitle>
            <DialogDescription>
              {editingModule ? 'Update module information' : `Create a new module for ${selectedCourse?.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                value={moduleFormData.title}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter module title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="module-duration">Duration</Label>
                <Input
                  id="module-duration"
                  value={moduleFormData.duration}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 4 hours"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module-lessons">Number of Lessons</Label>
                <Input
                  id="module-lessons"
                  type="number"
                  min="1"
                  value={moduleFormData.lessons}
                  onChange={(e) => setModuleFormData(prev => ({ ...prev, lessons: parseInt(e.target.value) || 7 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Lesson Topics</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a lesson topic"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTopicToModule((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter a lesson topic"]') as HTMLInputElement;
                    addTopicToModule(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {moduleFormData.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTopic(index)}>
                    {topic} ×
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on topics to remove them. Minimum 7 topics required.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveModule}>
              {editingModule ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}