import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Play, CheckCircle, BookOpen, Award, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const [activeTab, setActiveTab] = useState("lessons");
  const [module, setModule] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<{
    id: number;
    title: string;
    description: string;
    difficulty: string;
    duration: string;
  } | null>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        
        console.log('ModuleId from URL:', moduleId); // Debug log
        console.log('Raw moduleId type:', typeof moduleId); // Debug log
        
        // Fetch module basic info
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .select('*')
          .eq('module_id', moduleId)
          .eq('is_active', true)
          .single();

        console.log('Query result:', { moduleData, moduleError }); // Debug log

        if (moduleError) {
          console.error('Error fetching module:', moduleError);
          setModule(null);
          
          // Fetch all modules for the error page
          const { data: allModulesData } = await supabase
            .from('course_modules')
            .select('module_id, title, description, skill_level, order_index')
            .eq('is_active', true)
            .order('order_index');
            
          if (allModulesData) {
            setAllModules(allModulesData);
          }
          return;
        }

        setModule(moduleData);

        // Fetch related content in parallel
        const [videosResult, articlesResult, documentsResult, assessmentsResult] = await Promise.all([
          supabase
            .from('course_videos')
            .select('*')
            .eq('module_id', moduleId)
            .eq('is_active', true)
            .order('order_index'),
          
          supabase
            .from('course_articles')
            .select('*')
            .eq('module_id', moduleId)
            .eq('is_published', true)
            .order('order_index'),
          
          supabase
            .from('course_documents')
            .select('*')
            .eq('module_id', moduleId)
            .order('title'),
          
          supabase
            .from('course_assessments')
            .select('*')
            .eq('module_id', moduleId)
            .order('order_index')
        ]);

        setVideos(videosResult.data || []);
        setArticles(articlesResult.data || []);
        setDocuments(documentsResult.data || []);
        setAssessments(assessmentsResult.data || []);

      } catch (err) {
        console.error('Error:', err);
        setModule(null);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto p-6 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested module "{moduleId}" could not be found.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Debug: Searched for module_id = "{moduleId}" (type: {typeof moduleId})
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Available Modules ({allModules.length}):</h2>
          <div className="grid gap-3">
            {allModules.map((mod) => (
              <Card key={mod.module_id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">{mod.module_id}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{mod.skill_level}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/module/${mod.module_id}`)}
                  >
                    Go to Module
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{module.title}</h1>
          <p className="text-muted-foreground mt-2">{module.description}</p>
        </div>
        <Badge variant="default">Available</Badge>
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.duration || "2 hours"}</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.lessons_count || 0}</div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{videos.length || 0}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{assessments.length || 0}</div>
            <div className="text-sm text-muted-foreground">Quiz Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Module Lessons</CardTitle>
              <CardDescription>Complete the lessons in order to progress through the module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Lessons Coming Soon</h3>
                <p className="text-muted-foreground">Interactive lessons will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Module Overview
              </CardTitle>
              <CardDescription>What you'll learn in this module</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{module.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-6">
            {videos && videos.length > 0 ? (
              videos.map((video: any, index: number) => (
                <VideoPlayer
                  key={video.id}
                  title={`${index + 1}. ${video.title}`}
                  description={video.description}
                  duration={video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, '0')}` : 'N/A'}
                  videoType={video.video_type}
                  videoUrl={video.video_url}
                  youtubeId={video.youtube_id}
                  className="w-full"
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Videos Available</h3>
                  <p className="text-muted-foreground">Videos for this module will be available soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Module Resources & Documents
              </CardTitle>
              <CardDescription>Download materials, access articles, and resources for this module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Articles Section */}
                {articles && articles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Articles & Reading Materials
                    </h3>
                    <div className="grid gap-3">
                      {articles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{article.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {article.excerpt || article.description}
                                {article.reading_time_minutes && ` • ${article.reading_time_minutes} min read`}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <ArrowRight className="h-4 w-4 ml-1" />
                            Read
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                {documents && documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent" />
                      Downloads & Resources
                    </h3>
                    <div className="grid gap-3">
                      {documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-accent" />
                            <div>
                              <p className="font-medium">{document.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {document.description}
                                {document.file_size && ` (${(document.file_size / (1024 * 1024)).toFixed(1)} MB)`}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!document.is_downloadable}
                          >
                            <ArrowRight className="h-4 w-4 ml-1" />
                            {document.is_downloadable ? 'Download' : 'Preview'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Placeholder when no content */}
                {(!articles || articles.length === 0) && (!documents || documents.length === 0) && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Resources Coming Soon</h3>
                    <p className="text-muted-foreground">Learning materials and resources for this module will be available soon.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <ModuleQuiz 
            moduleId={module.id}
            moduleTitle={module.title}
            totalQuestions={assessments.length || 10}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>

      {/* Case Study Modal */}
      {selectedCaseStudy && (
        <CaseStudyModal
          caseStudy={selectedCaseStudy}
          isOpen={!!selectedCaseStudy}
          onClose={() => setSelectedCaseStudy(null)}
        />
      )}
    </div>
  );
};

export default ModulePage;