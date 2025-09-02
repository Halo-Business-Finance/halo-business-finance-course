import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Edit, Trash2, Settings, GraduationCap, Users, BarChart3, Filter, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/useCourses";
import { useModules } from "@/hooks/useModules";

interface ModuleEditorProps {}

interface DbModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons_count: number;
  is_active: boolean;
  order_index: number;
  module_id: string;
  skill_level: string;
  courseTitle?: string;
  courseId?: string;
  skillLevel?: string;
  lessons?: number;
  progress?: number;
  status?: "locked" | "available" | "in-progress" | "completed";
  topics?: string[];
}

export function ModuleEditor({}: ModuleEditorProps) {
  const [allModules, setAllModules] = useState<DbModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<DbModule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<DbModule | null>(null);
  const [selectedModule, setSelectedModule] = useState<DbModule | null>(null);
  const { toast } = useToast();
  const { courses, loading: coursesLoading } = useCourses();
  const { modules, loading: modulesLoading } = useModules();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    duration: "",
    lessons: 7,
    status: "locked" as "locked" | "available" | "in-progress" | "completed",
    progress: 0,
    topics: [] as string[],
  });

  const statusOptions = [
    { value: "locked", label: "Locked", color: "bg-gray-100 text-gray-800" },
    { value: "available", label: "Available", color: "bg-blue-100 text-blue-800" },
    { value: "in-progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  ];

  useEffect(() => {
    loadModules();
  }, [courses, modules]);

  useEffect(() => {
    applyFilters();
  }, [allModules, searchTerm, selectedCourse, selectedSkillLevel, selectedStatus]);

  const loadModules = () => {
    if (!courses.length || !modules.length) return;
    
    try {
      // Get all modules from database with course context
      const modulesWithCourse: DbModule[] = [];
      
      modules.forEach((module) => {
        const course = courses.find(c => c.id === module.course_id);
        if (course) {
          modulesWithCourse.push({
            ...module,
            module_id: module.id,
            skill_level: course.level,
            courseTitle: course.title,
            courseId: course.id,
            skillLevel: course.level,
            lessons: module.lessons_count,
            progress: 0, // This would come from user progress data
            status: module.is_active ? "available" : "locked",
            topics: module.topics || [] // Use the topics from the database
          });
        }
      });

      setAllModules(modulesWithCourse);
      
    } catch (error) {
      console.error("Error loading modules:", error);
      toast({
        title: "Error",
        description: "Failed to load module data",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...allModules];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter(module => module.courseId === selectedCourse);
    }

    // Skill level filter
    if (selectedSkillLevel !== "all") {
      filtered = filtered.filter(module => module.skillLevel === selectedSkillLevel);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(module => module.status === selectedStatus);
    }

    setFilteredModules(filtered);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      duration: "",
      lessons: 7,
      status: "locked",
      progress: 0,
      topics: [],
    });
  };

  const handleEdit = (module: DbModule) => {
    setEditingModule(module);
    setFormData({
      id: module.id,
      title: module.title,
      description: module.description || "",
      duration: module.duration || "",
      lessons: module.lessons || 7,
      status: module.status || "locked",
      progress: module.progress || 0,
      topics: module.topics || [],
    });
    setShowAddDialog(true);
  };

  const handleSave = () => {
    // Note: This would typically save to database
    // For now, just show success message
    toast({
      title: "Success",
      description: editingModule ? "Module updated successfully" : "Module created successfully",
    });
    setShowAddDialog(false);
    resetForm();
  };

  const getUniqueCourseTitles = () => {
    return Array.from(new Set(allModules.map(m => m.courseTitle).filter(Boolean))).sort();
  };

  const getUniqueSkillLevels = () => {
    return Array.from(new Set(allModules.map(m => m.skillLevel).filter(Boolean))).sort();
  };

  const getCourseTypeName = (courseTitle: string) => {
    return courseTitle?.replace(/ - (Beginner|Expert)$/, '') || courseTitle || '';
  };

  const getSkillLevelBadge = (level: string) => {
    const levelConfig = {
      beginner: { icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
      
      expert: { icon: "🌳", color: "bg-red-100 text-red-800" },
      none: { icon: "📋", color: "bg-gray-100 text-gray-800" }
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;
    return (
      <Badge className={config.color}>
        {config.icon} {level?.charAt(0).toUpperCase() + level?.slice(1)}
      </Badge>
    );
  };

  if (coursesLoading || modulesLoading) {
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
                Modules Management
              </CardTitle>
              <CardDescription>
                Manage all {allModules.length} course modules across 13 course programs
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {getUniqueCourseTitles().map((title) => (
                    <SelectItem key={title} value={courses.find(c => c.title === title)?.id || title}>
                      {getCourseTypeName(title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {getUniqueSkillLevels().map((level) => (
                    <SelectItem key={level} value={level}>
                      {level?.charAt(0).toUpperCase() + level?.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredModules.length} of {allModules.length} modules
            </div>
          </div>

          {/* Modules Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module, index) => (
                  <TableRow key={`${module.id}-${index}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{module.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {module.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getCourseTypeName(module.courseTitle || '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSkillLevelBadge(module.skillLevel || 'beginner')}
                    </TableCell>
                    <TableCell>{module.duration || 'N/A'}</TableCell>
                    <TableCell>{module.lessons || module.lessons_count || 0}</TableCell>
                    <TableCell>
                      <Badge 
                        className={statusOptions.find(s => s.value === (module.status || 'locked'))?.color}
                      >
                        {statusOptions.find(s => s.value === (module.status || 'locked'))?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${module.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{module.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedModule(module)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCourse !== "all" || selectedSkillLevel !== "all" || selectedStatus !== "all"
                ? "No modules match your current filters."
                : "No modules found."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Details Modal */}
      {selectedModule && (
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedModule.title}</DialogTitle>
              <DialogDescription>
                {getCourseTypeName(selectedModule.courseTitle || '')} • {getSkillLevelBadge(selectedModule.skillLevel || 'beginner')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{selectedModule.lessons || selectedModule.lessons_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{selectedModule.duration || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{selectedModule.progress || 0}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-lg font-bold">
                    <Badge className={statusOptions.find(s => s.value === (selectedModule.status || 'locked'))?.color}>
                      {statusOptions.find(s => s.value === (selectedModule.status || 'locked'))?.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedModule.description}</p>
              </div>

              {selectedModule.topics && selectedModule.topics.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.topics.map((topic, index) => (
                      <Badge key={index} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

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
              <Label htmlFor="module-title">Title</Label>
              <Input
                id="module-title"
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
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3 hours"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lessons">Lessons</Label>
                <Input
                  id="lessons"
                  type="number"
                  min="1"
                  value={formData.lessons}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessons: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
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
              {editingModule ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}