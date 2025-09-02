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
import { BookOpen, Plus, Edit, Trash2, Settings, GraduationCap, Users, BarChart3, Download, Upload, Eye, ImageIcon, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCourses, Course } from "@/hooks/useCourses";
import { useModules } from "@/hooks/useModules";
import { CourseImageEditor } from "./CourseImageEditor";
import { CourseInstructorManager } from "./CourseInstructorManager";
import { CourseModuleManager } from "./CourseModuleManager";
import { AssociatedModulesView } from "./AssociatedModulesView";
import { runMigration } from "@/utils/migrateCourseData";
import { supabase } from "@/integrations/supabase/client";

// Import new course-specific images (no people)
import courseSba7a from "@/assets/course-sba-7a.jpg";
import courseSbaExpress from "@/assets/course-sba-express.jpg";
import courseSba504 from "@/assets/course-sba-504.jpg";
import courseCommercialRealEstate from "@/assets/course-commercial-real-estate.jpg";
import courseEquipmentFinancing from "@/assets/course-equipment-financing.jpg";
import courseLinesOfCredit from "@/assets/course-lines-of-credit.jpg";
import courseInvoiceFactoring from "@/assets/course-invoice-factoring.jpg";
import courseMerchantCashAdvances from "@/assets/course-merchant-cash-advances.jpg";
import courseAssetBasedLending from "@/assets/course-asset-based-lending.jpg";
import courseConstructionLoans from "@/assets/course-construction-loans.jpg";
import courseFranchiseFinancing from "@/assets/course-franchise-financing.jpg";
import courseWorkingCapital from "@/assets/course-working-capital.jpg";
import courseHealthcareFinancing from "@/assets/course-healthcare-financing.jpg";
import courseRestaurantFinancing from "@/assets/course-restaurant-financing.jpg";
import courseBridgeLoans from "@/assets/course-bridge-loans.jpg";
import courseTermLoans from "@/assets/course-term-loans.jpg";
import courseBusinessAcquisition from "@/assets/course-business-acquisition.jpg";

interface CourseManagerProps {}

export function CourseManager({}: CourseManagerProps) {
  const { courses, loading, createCourse, updateCourse, deleteCourse, getCoursesByCategory } = useCourses();
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
    level: "beginner" as "beginner" | "expert" | "none",
    courseType: "loan-originator" as "loan-originator" | "loan-processing" | "loan-underwriting",
  });

  const skillLevels = [
    { value: "none", label: "No Skill Level", icon: "📋", color: "bg-gray-100 text-gray-800" },
    { value: "beginner", label: "Beginner", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
    { value: "expert", label: "Expert", icon: "🌳", color: "bg-red-100 text-red-800" },
  ];

  const courseTypes = [
    { value: "loan-originator", label: "Loan Originator" },
    { value: "loan-processing", label: "Loan Processing" },
    { value: "loan-underwriting", label: "Loan Underwriting" },
  ];

  // Course image mapping function to match user dashboard
  const getCourseImage = (courseTitle: string) => {
    console.log('CourseManager - Getting image for courseTitle:', courseTitle);
    
    // Create comprehensive mapping for all course title variations
    const imageMap: { [key: string]: string } = {
      // SBA courses
      "SBA 7(a) Loans - Beginner": courseSba7a,
      "SBA 7(a) Loans - Expert": courseSba7a,
      "SBA Express Loans - Beginner": courseSbaExpress,
      "SBA Express Loans - Expert": courseSbaExpress,
      "SBA 504 Loans - Beginner": courseSba504,
      "SBA 504 Loans - Expert": courseSba504,
      "SBA Loan Processing": courseSba7a,
      "SBA Loan Underwriting": courseSbaExpress,
      
      // Real Estate courses
      "Commercial Real Estate Financing - Beginner": courseCommercialRealEstate,
      "Commercial Real Estate Financing - Expert": courseCommercialRealEstate,
      "Commercial Loan Underwriting": courseCommercialRealEstate,
      "Apartment & Multi-Family Loan Processing": courseCommercialRealEstate,
      
      // Equipment courses
      "Equipment Financing - Beginner": courseEquipmentFinancing,
      "Equipment Financing - Expert": courseEquipmentFinancing,
      "Equipment Finance Loan Underwriting": courseEquipmentFinancing,
      "Equipment Loan Processing": courseEquipmentFinancing,
      
      // Credit lines
      "Business Lines of Credit - Beginner": courseLinesOfCredit,
      "Business Lines of Credit - Expert": courseLinesOfCredit,
      
      // Invoice & factoring
      "Invoice Factoring - Beginner": courseInvoiceFactoring,
      "Invoice Factoring - Expert": courseInvoiceFactoring,
      
      // Merchant cash
      "Merchant Cash Advances - Beginner": courseMerchantCashAdvances,
      "Merchant Cash Advances - Expert": courseMerchantCashAdvances,
      
      // Asset-based lending
      "Asset-Based Lending - Beginner": courseAssetBasedLending,
      "Asset-Based Lending - Expert": courseAssetBasedLending,
      
      // Construction
      "Construction Loans - Beginner": courseConstructionLoans,
      "Construction Loans - Expert": courseConstructionLoans,
      "Construction Loan Underwriting": courseConstructionLoans,
      
      // Franchise
      "Franchise Financing - Beginner": courseFranchiseFinancing,
      "Franchise Financing - Expert": courseFranchiseFinancing,
      
      // Working capital
      "Working Capital Loans - Beginner": courseWorkingCapital,
      "Working Capital Loans - Expert": courseWorkingCapital,
      
      // Healthcare
      "Healthcare Financing - Beginner": courseHealthcareFinancing,
      "Healthcare Financing - Expert": courseHealthcareFinancing,
      
      // Restaurant
      "Restaurant Financing - Beginner": courseRestaurantFinancing,
      "Restaurant Financing - Expert": courseRestaurantFinancing,
      
      // Bridge loans
      "Bridge Loan Processing": courseBridgeLoans,
      "Bridge Loan Underwriting": courseBridgeLoans,
      
      // Agriculture & USDA
      "Agriculture Loan Processing": courseTermLoans,
      "USDA Loan Processing": courseTermLoans,
      "USDA Loan Underwriting": courseBusinessAcquisition,
    };

    const selectedImage = imageMap[courseTitle] || courseSba7a;
    console.log('CourseManager - Selected image for', courseTitle, ':', selectedImage);
    
    return selectedImage;
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      level: "beginner",
      courseType: "loan-originator",
    });
  };

  const handleCreate = () => {
    setEditingCourse(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (course: Course) => {
    // Determine course type from existing course title
    let courseType: "loan-originator" | "loan-processing" | "loan-underwriting" = "loan-originator";
    if (course.title.toLowerCase().includes('processing')) {
      courseType = 'loan-processing';
    } else if (course.title.toLowerCase().includes('underwriting')) {
      courseType = 'loan-underwriting';
    }

    setEditingCourse(course);
    setFormData({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      courseType: courseType,
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

  const getAssociatedModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading associated modules:', error);
      return [];
    }
  };

  // Group courses by category (Loan Originator, Loan Processing, Loan Underwriting)
  const courseCategories = getCoursesByCategory();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Course Management
              </CardTitle>
              <CardDescription>
                Manage course programs and individual modules with comprehensive controls
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="programs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="programs" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Course Programs
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Course Modules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Course Programs Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage course programs organized by Loan Originator, Loan Processing, and Loan Underwriting categories
                  </p>
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
              
              <div className="space-y-6">
                {Object.entries(courseCategories).map(([categoryType, categoryData]) => {
                  const coursesInCategory = categoryData as Course[];
                  return (
                    <Card key={categoryType} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{categoryType}</CardTitle>
                            <CardDescription>
                              {coursesInCategory.length} courses available
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {coursesInCategory.reduce((sum, course) => sum + getModuleCount(course), 0)} modules total
                            </Badge>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              Connected: {coursesInCategory.filter(course => getModuleCount(course) > 0).length}/{coursesInCategory.length}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-3">
                          {coursesInCategory.map((course) => {
                          const stats = getCourseStats(course);
                          const moduleCount = getModuleCount(course);
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
                                     {course.level === 'none' ? 'No Skill Level' : course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                                   </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-medium text-left pl-2 w-full flex items-center gap-2">
                                    {course.title}
                                    {moduleCount === 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        No Modules
                                      </Badge>
                                    )}
                                    {moduleCount > 0 && (
                                      <Badge variant="default" className="text-xs">
                                        {moduleCount} modules
                                      </Badge>
                                    )}
                                  </div>
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
                );
                })}
              </div>

              {Object.keys(courseCategories).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found. Create your first course to get started.
                </div>
              )}
              
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <CourseModuleManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Details Modal with Associated Modules */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {selectedCourse.title}
              </DialogTitle>
              <DialogDescription>{selectedCourse.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{getModuleCount(selectedCourse)}</div>
                  <div className="text-sm text-muted-foreground">Legacy Modules</div>
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
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Associated Course Modules
                </h4>
                <AssociatedModulesView courseId={selectedCourse.id} />
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
              <Label htmlFor="course-type">Course Type</Label>
              <select
                id="course-type"
                value={formData.courseType}
                onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value as any }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {courseTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skill-level">Skill Level</Label>
              <select
                id="skill-level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {skillLevels
                  .filter(level => {
                    // For Loan Originator courses, only show none, beginner, and expert
                    if (formData.courseType === 'loan-originator') {
                      return true; // Show all remaining levels
                    }
                    // For other course types, show all levels
                    return true;
                  })
                  .map(level => (
                    <option key={level.value} value={level.value}>
                      {level.icon} {level.label}
                    </option>
                  ))}
              </select>
              {formData.courseType === 'loan-originator' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Loan Originator courses only support Beginner and Expert skill levels.
                </p>
              )}
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