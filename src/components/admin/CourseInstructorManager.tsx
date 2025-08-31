import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus, Edit, Eye, Lock, Trash2 } from "lucide-react";
import { InstructorForm } from "@/components/InstructorForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Instructor {
  id: string;
  name: string;
  title: string;
  company: string;
  years_experience: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseInstructorManagerProps {
  courseId: string;
  courseTitle: string;
}

export function CourseInstructorManager({ courseId, courseTitle }: CourseInstructorManagerProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadInstructors();
    }
  }, [open]);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setInstructors(data || []);
    } catch (error: any) {
      console.error("Error loading instructors:", error);
      toast({
        title: "Error",
        description: "Failed to load instructors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorFormSave = async () => {
    setShowInstructorForm(false);
    setEditingInstructor(null);
    await loadInstructors();
    toast({
      title: "Success",
      description: editingInstructor ? "Instructor updated successfully" : "Instructor created successfully",
    });
  };

  const handleInstructorFormCancel = () => {
    setShowInstructorForm(false);
    setEditingInstructor(null);
  };

  const toggleInstructorStatus = async (instructorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("instructors")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", instructorId);

      if (error) throw error;

      await loadInstructors();
      toast({
        title: "Success",
        description: `Instructor ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating instructor status:", error);
      toast({
        title: "Error",
        description: "Failed to update instructor status",
        variant: "destructive",
      });
    }
  };

  const deleteInstructor = async (instructorId: string) => {
    try {
      const { error } = await supabase
        .from("instructors")
        .delete()
        .eq("id", instructorId);

      if (error) throw error;

      await loadInstructors();
      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting instructor:", error);
      toast({
        title: "Error",
        description: "Failed to delete instructor",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Manage Course Instructors">
          <GraduationCap className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5" />
            Course Instructors - {courseTitle}
          </DialogTitle>
          <DialogDescription>
            Manage instructor information and profiles for this course
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {showInstructorForm ? (
            <InstructorForm
              instructor={editingInstructor || undefined}
              onSave={handleInstructorFormSave}
              onCancel={handleInstructorFormCancel}
            />
          ) : (
            <Card className="border-border/50 shadow-elegant h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      Course Instructors
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Manage course instructor information and profiles
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowInstructorForm(true)} 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructor
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 max-h-[60vh] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Company</TableHead>
                        <TableHead className="font-semibold">Experience</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Order</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instructors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No instructors found. Add your first instructor to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        instructors.map((instructor) => (
                          <TableRow key={instructor.id} className="border-border/30 hover:bg-muted/30 transition-colors duration-200">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-${instructor.avatar_color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                  {instructor.avatar_initials}
                                </div>
                                <div>
                                  <div className="font-medium">{instructor.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate py-4">
                              {instructor.title}
                            </TableCell>
                            <TableCell className="py-4">{instructor.company}</TableCell>
                            <TableCell className="py-4">{instructor.years_experience}</TableCell>
                            <TableCell className="py-4">
                              <Badge variant={instructor.is_active ? "default" : "secondary"} className="shadow-sm">
                                {instructor.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">{instructor.display_order}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingInstructor(instructor);
                                    setShowInstructorForm(true);
                                  }}
                                  title="Edit Instructor"
                                  className="hover:shadow-sm transition-all duration-200"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleInstructorStatus(instructor.id, instructor.is_active)}
                                  title={instructor.is_active ? "Deactivate" : "Activate"}
                                  className="hover:shadow-sm transition-all duration-200"
                                >
                                  {instructor.is_active ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <Lock className="h-3 w-3" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="hover:bg-destructive hover:text-destructive-foreground hover:shadow-sm transition-all duration-200"
                                      title="Delete Instructor"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-border/50 shadow-elegant">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this instructor? This action cannot be undone.
                                        <br /><br />
                                        <strong>Name:</strong> {instructor.name}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteInstructor(instructor.id)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}