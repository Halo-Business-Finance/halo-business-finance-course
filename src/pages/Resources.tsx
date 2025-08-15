import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, ExternalLink, BookOpen, Video, FileSpreadsheet, Users, Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

const ResourcesPage = () => {
  const documents = [
    {
      title: "Business Finance Handbook",
      description: "Comprehensive guide covering all aspects of business finance",
      type: "PDF",
      size: "2.4 MB",
      category: "guide"
    },
    {
      title: "SBA Loan Application Checklist",
      description: "Step-by-step checklist for SBA loan applications",
      type: "PDF",
      size: "850 KB",
      category: "checklist"
    },
    {
      title: "Financial Analysis Templates",
      description: "Excel templates for financial modeling and analysis",
      type: "XLSX",
      size: "1.2 MB",
      category: "template"
    },
    {
      title: "Regulatory Compliance Guide",
      description: "Latest regulations and compliance requirements",
      type: "PDF",
      size: "3.1 MB",
      category: "guide"
    }
  ];

  const videos = [
    {
      title: "Introduction to Capital Markets",
      description: "Overview of capital market structures and participants",
      duration: "45:30",
      category: "lecture",
      videoType: "youtube" as const,
      youtubeId: "dQw4w9WgXcQ", // Example YouTube ID
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      title: "SBA Loan Process Walkthrough",
      description: "Complete walkthrough of the SBA loan application process",
      duration: "32:15",
      category: "tutorial",
      videoType: "file" as const,
      videoUrl: "/sample-video.mp4" // Example file path
    },
    {
      title: "Risk Assessment Techniques",
      description: "Advanced techniques for evaluating credit risk",
      duration: "28:45",
      category: "lecture",
      videoType: "youtube" as const,
      youtubeId: "dQw4w9WgXcQ",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      title: "Case Study: Bridge Financing",
      description: "Real-world example of bridge financing structure",
      duration: "15:20",
      category: "case-study",
      videoType: "file" as const,
      videoUrl: "/case-study-video.mp4"
    }
  ];

  const tools = [
    {
      title: "Financial Calculator",
      description: "Advanced calculator for loan payments, NPV, and IRR calculations",
      type: "Web Tool",
      category: "calculator"
    },
    {
      title: "Credit Score Simulator",
      description: "Tool to simulate credit score impacts of various scenarios",
      type: "Web Tool",
      category: "simulator"
    },
    {
      title: "Loan Comparison Tool",
      description: "Compare different loan options side by side",
      type: "Web Tool",
      category: "comparison"
    },
    {
      title: "ROI Calculator",
      description: "Calculate return on investment for business projects",
      type: "Web Tool",
      category: "calculator"
    }
  ];

  const webinars = [
    {
      title: "Current Trends in Business Lending",
      date: "March 15, 2024",
      time: "2:00 PM EST",
      status: "upcoming",
      presenter: "Sarah Johnson, Senior Finance Expert"
    },
    {
      title: "Navigating SBA Loan Changes",
      date: "February 28, 2024",
      time: "1:00 PM EST",
      status: "completed",
      presenter: "Michael Chen, SBA Specialist"
    },
    {
      title: "Alternative Financing Solutions",
      date: "February 14, 2024",
      time: "3:00 PM EST",
      status: "completed",
      presenter: "Lisa Rodriguez, Finance Consultant"
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "XLSX":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Learning Resources</h1>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Downloadable Documents
              </CardTitle>
              <CardDescription>
                Essential documents, guides, and templates for your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <div key={doc.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <h3 className="font-medium text-foreground">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{doc.type}</Badge>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Library
              </CardTitle>
              <CardDescription>
                Interactive training videos and lectures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {videos.map((video) => (
                  <VideoPlayer
                    key={video.title}
                    title={video.title}
                    description={video.description}
                    duration={video.duration}
                    videoType={video.videoType}
                    videoUrl={video.videoUrl}
                    youtubeId={video.youtubeId}
                    onProgress={(progress) => {
                      console.log(`${video.title} progress: ${progress}%`);
                    }}
                    onComplete={() => {
                      console.log(`${video.title} completed`);
                    }}
                    className="w-full"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Interactive Tools
              </CardTitle>
              <CardDescription>
                Calculators and interactive tools to support your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tools.map((tool) => (
                  <div key={tool.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                      <div>
                        <h3 className="font-medium text-foreground">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                        <Badge variant="outline" className="mt-1">{tool.type}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Launch Tool
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Webinars & Events
              </CardTitle>
              <CardDescription>
                Join live sessions with industry experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {webinars.map((webinar) => (
                  <div key={webinar.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{webinar.title}</h3>
                      <p className="text-sm text-muted-foreground">{webinar.presenter}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{webinar.date} at {webinar.time}</span>
                        <Badge variant={webinar.status === "upcoming" ? "progress" : "outline"}>
                          {webinar.status}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant={webinar.status === "upcoming" ? "default" : "outline"}>
                      {webinar.status === "upcoming" ? "Register" : "Watch Recording"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesPage;