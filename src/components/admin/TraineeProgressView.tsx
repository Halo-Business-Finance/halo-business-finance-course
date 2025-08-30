import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  Eye,
  Calendar,
  Building,
  Mail,
  Phone
} from "lucide-react";
import { SecurityStatusIndicator } from "@/components/SecurityStatusIndicator";
import { SecurePIIDisplay } from "@/components/SecurePIIDisplay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TraineeProgress {
  user_id: string;
  trainee_name: string;
  trainee_email: string;
  trainee_phone: string;
  trainee_company: string;
  join_date?: string;
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  overall_progress_percentage: number;
  last_activity?: string;
  course_progress_details: any;
  is_masked?: boolean;
  role?: string;
}

interface TraineeStats {
  totalTrainees: number;
  activeTrainees: number;
  averageProgress: number;
  completedCourses: number;
}

export const TraineeProgressView = () => {
  const [trainees, setTrainees] = useState<TraineeProgress[]>([]);
  const [stats, setStats] = useState<TraineeStats>({
    totalTrainees: 0,
    activeTrainees: 0,
    averageProgress: 0,
    completedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProgress | null>(null);

  useEffect(() => {
    loadTraineeProgress();
  }, []);

const loadTraineeProgress = async () => {
    try {
      setLoading(true);
      
      // Use enhanced secure function with strict PII masking and audit logging
      // Use enhanced secure function with strict PII masking and audit logging
      const { data, error } = await supabase.rpc('get_masked_user_profiles');
      
      if (error) {
        throw error;
      }

      // Transform secured profile data to trainee progress format
      const transformedData = (data || []).map((profile: any) => ({
        user_id: profile.user_id,
        trainee_name: profile.name,
        trainee_email: profile.email,
        trainee_phone: profile.phone,
        trainee_company: profile.company,
        join_date: new Date().toISOString(), // Mock join date
        last_activity: new Date().toISOString(), // Mock last activity  
        is_masked: profile.is_masked,
        role: profile.role,
        // Mock progress data - in production, this would come from learning analytics
        total_courses: 1,
        completed_courses: 0,
        in_progress_courses: 1,
        overall_progress_percentage: 25,
        course_progress_details: [{
          course_id: 'halo-launch-pad-learn',
          progress_percentage: 25,
          completed_at: null
        }]
      }));

      setTrainees(transformedData);
      
      // Add debugging for trainees data
      
      // Calculate stats using transformed data
      const totalTrainees = transformedData?.length || 0;
      const activeTrainees = transformedData?.filter(t => 
        t.last_activity && new Date(t.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const averageProgress = totalTrainees > 0 
        ? transformedData.reduce((sum, t) => sum + (t.overall_progress_percentage || 0), 0) / totalTrainees 
        : 0;
      const completedCourses = transformedData?.reduce((sum, t) => sum + (t.completed_courses || 0), 0) || 0;

      setStats({
        totalTrainees,
        activeTrainees,
        averageProgress: Math.round(averageProgress),
        completedCourses
      });

    } catch (error: any) {
      console.error('Error loading trainee progress:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load trainee progress data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (progress >= 70) return <Badge className="bg-blue-500">Good</Badge>;
    if (progress >= 40) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="outline">Needs Attention</Badge>;
  };

  const getActivityStatus = (lastActivity: string) => {
    if (!lastActivity) return <Badge variant="outline">No Activity</Badge>;
    
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity <= 1) return <Badge className="bg-green-500">Active Today</Badge>;
    if (daysSinceActivity <= 7) return <Badge className="bg-blue-500">Active This Week</Badge>;
    if (daysSinceActivity <= 30) return <Badge className="bg-yellow-500">Active This Month</Badge>;
    return <Badge variant="outline">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrainees}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in training programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrainees}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all trainees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Total completions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainees Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Trainee Progress Overview</CardTitle>
              <CardDescription>
                Monitor individual trainee progress and course completion status
              </CardDescription>
            </div>
            <SecurityStatusIndicator 
              isDataMasked={trainees.length > 0 ? trainees[0].is_masked : false}
              userRole={trainees.length > 0 ? trainees[0].role : 'user'}
              showDetails={false}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Overall Progress</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Activity Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.user_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <SecurePIIDisplay 
                          value={trainee.trainee_name} 
                          type="name" 
                          isMasked={trainee.is_masked}
                          showMaskingIndicator={false}
                        />
                        <div className="text-sm text-muted-foreground">
                          <SecurePIIDisplay 
                            value={trainee.trainee_email} 
                            type="email" 
                            isMasked={trainee.is_masked}
                            showMaskingIndicator={false}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {trainee.trainee_company || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {Math.round(trainee.overall_progress_percentage || 0)}%
                          </span>
                          {getProgressBadge(trainee.overall_progress_percentage || 0)}
                        </div>
                        <Progress 
                          value={trainee.overall_progress_percentage || 0} 
                          className="w-full h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{trainee.completed_courses || 0} completed</div>
                        <div className="text-muted-foreground">
                          {trainee.in_progress_courses || 0} in progress
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActivityStatus(trainee.last_activity)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {trainee.join_date 
                          ? format(new Date(trainee.join_date), 'MMM dd, yyyy')
                          : 'Unknown'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTrainee(trainee)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Trainee Progress Details</DialogTitle>
                            <DialogDescription>
                              Detailed progress information for {trainee.trainee_name}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-96">
                            <div className="space-y-6">
                              {/* Contact Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm font-medium">Email</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground pl-6">
                                    {trainee.trainee_email}
                                  </p>
                                </div>
                                
                                {trainee.trainee_phone && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      <span className="text-sm font-medium">Phone</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                      {trainee.trainee_phone}
                                    </p>
                                  </div>
                                )}
                                
                                {trainee.trainee_company && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4" />
                                      <span className="text-sm font-medium">Company</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                      {trainee.trainee_company}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm font-medium">Join Date</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground pl-6">
                                    {trainee.join_date 
                                      ? format(new Date(trainee.join_date), 'MMMM dd, yyyy')
                                      : 'Unknown'
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Progress Summary */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">Progress Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-2xl font-bold text-green-600">
                                      {trainee.completed_courses || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                      {trainee.in_progress_courses || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">In Progress</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold">
                                      {Math.round(trainee.overall_progress_percentage || 0)}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Overall</div>
                                  </div>
                                </div>
                              </div>

                              {/* Course Details */}
                              {trainee.course_progress_details && Array.isArray(trainee.course_progress_details) && trainee.course_progress_details.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Course Progress Details</h4>
                                  <div className="space-y-3">
                                    {trainee.course_progress_details.map((course: any, index: number) => (
                                      <div key={index} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-sm">
                                            {course.course_id}
                                          </span>
                                          <Badge variant={course.completed_at ? "default" : "secondary"}>
                                            {course.completed_at ? "Completed" : "In Progress"}
                                          </Badge>
                                        </div>
                                        {course.module_id && (
                                          <div className="text-sm text-muted-foreground mb-2">
                                            Module: {course.module_id}
                                          </div>
                                        )}
                                        <Progress 
                                          value={course.progress_percentage || 0} 
                                          className="w-full h-2 mb-2"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>{course.progress_percentage || 0}% complete</span>
                                          {course.updated_at && (
                                            <span>
                                              Last updated: {format(new Date(course.updated_at), 'MMM dd, yyyy')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {trainees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Trainees Found</p>
              <p className="text-sm">No trainees are currently enrolled in the system.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};