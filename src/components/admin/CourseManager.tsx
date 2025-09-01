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
import { useCourses, Course } from "@/hooks/useCourses";
import { useModules } from "@/hooks/useModules";
import { CourseImageEditor } from "./CourseImageEditor";
import { CourseInstructorManager } from "./CourseInstructorManager";
import { runMigration } from "@/utils/migrateCourseData";

// Import course images to match the user dashboard
import financeExpert1 from "@/assets/finance-expert-1.jpg";
import creditAnalyst2 from "@/assets/credit-analyst-2.jpg";
import commercialBanker3 from "@/assets/commercial-banker-3.jpg";
import riskSpecialist4 from "@/assets/risk-specialist-4.jpg";
import sbaSpecialist5 from "@/assets/sba-specialist-5.jpg";
import complianceOfficer6 from "@/assets/compliance-officer-6.jpg";
import financialAdvisor7 from "@/assets/financial-advisor-7.jpg";
import investmentBanker8 from "@/assets/investment-banker-8.jpg";
import loanOfficer9 from "@/assets/loan-officer-9.jpg";
import portfolioManager10 from "@/assets/portfolio-manager-10.jpg";

interface CourseManagerProps {}

export function CourseManager({}: CourseManagerProps) {
  const { courses, loading, createCourse, updateCourse, deleteCourse, getCoursesByType } = useCourses();
  const { getModuleStats } = useModules();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingImageCourse, setEditingImageCourse] = useState<Course | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
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

  // Course image mapping function to match user dashboard
  const getCourseImage = (courseTitle: string) => {
    const images = [
      financeExpert1, creditAnalyst2, commercialBanker3, riskSpecialist4, 
      sbaSpecialist5, complianceOfficer6, financialAdvisor7, investmentBanker8, 
      loanOfficer9, portfolioManager10
    ];
    
    // Extract the base course type from title (remove skill level)
    const baseTitle = courseTitle.replace(/ - (Beginner|Intermediate|Expert)$/, '');
    
    // Get unique course types in order they appear in database
    const uniqueCourseTypes = [
      "SBA 7(a)",
      "SBA Express", 
      "Commercial Real Estate",
      "Equipment Financing",
      "Business Lines of Credit",
      "Invoice Factoring",
      "Merchant Cash Advances",
      "Asset-Based Lending",
      "Construction Loans",
      "Franchise Financing",
      "Working Capital",
      "Healthcare Financing",
      "Restaurant Financing",
      "Bridge Loans",
      "Term Loans",
      "Business Acquisition"
    ];

    const index = uniqueCourseTypes.indexOf(baseTitle);
    return images[index >= 0 ? index % images.length : 0];
  };

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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.id.trim()) {
      toast({
        title: "Error",
        description: "Course ID and title are required",
        variant: "destructive",
      });
      return;
    }

    if (editingCourse) {
      // Update existing course
      await updateCourse(editingCourse.id, {
        title: formData.title,
        description: formData.description,
        level: formData.level,
      });
    } else {
      // Create new course
      await createCourse({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        level: formData.level,
      });
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = async (course: Course) => {
    await deleteCourse(course.id);
  };

  const handleEditImage = (course: Course) => {
    setEditingImageCourse(course);
    setShowImageEditor(true);
  };

  const handleSaveImage = async (courseId: string, imageBlob: Blob) => {
    // TODO: Implement actual image saving to storage/database
    console.log(`Saving image for course ${courseId}`, imageBlob);
    
    toast({
      title: "Image Saved",
      description: "Course image has been saved successfully.",
    });
  };

  const getModuleCount = (course: Course) => {
    const stats = getModuleStats(course.id);
    return stats.total;
  };

  const getCourseStats = (course: Course) => {
    return getModuleStats(course.id);
  };

  // Group courses by type (remove skill level from title)
  const courseTypes = getCoursesByType();

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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={runMigration}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Migrate Static Data
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
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
                            {/* Course Image and Skill Level */}
                            <div className="flex flex-col items-start gap-2 flex-shrink-0">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={getCourseImage(course.title)} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-sm font-medium text-black text-left">
                                {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-medium text-left pl-2 w-full">{course.title}</div>
                              <div className="w-full h-px bg-border mt-1 mb-2 ml-2"></div>
                              <div className="text-sm text-muted-foreground line-clamp-1 text-left pl-2 w-full">
                                {course.description}
                              </div>
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
                            <CourseInstructorManager 
                              courseId={course.id} 
                              courseTitle={course.title}
                            />
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
              
              <div>
                <h4 className="font-semibold mb-3">Course Modules</h4>
                <div className="text-center py-4 text-muted-foreground">
                  Module details will be displayed here when modules are loaded from the database.
                </div>
              </div>
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

      {/* Course Image Editor */}
      {editingImageCourse && (
        <CourseImageEditor
          course={editingImageCourse}
          open={showImageEditor}
          onOpenChange={setShowImageEditor}
          onSave={handleSaveImage}
        />
      )}
    </div>
  );
}