import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Upload, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  description: string;
  file_type: string;
  file_url: string;
  file_size: number;
  download_count: number;
  category: string;
  tags: string[];
  created_at: string;
}

interface DocumentLibraryProps {
  moduleId?: string;
}

export function DocumentLibrary({ moduleId }: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [moduleId]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from("course_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (moduleId) {
        query = query.eq("module_id", moduleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      // Update download count
      await supabase
        .from("course_documents")
        .update({ download_count: document.download_count + 1 })
        .eq("id", document.id);

      // Open file in new tab
      window.open(document.file_url, "_blank");

      toast({
        title: "Download Started",
        description: `Downloading ${document.title}`,
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const categories = ["all", "reference", "worksheet", "template", "guide"];

  const filteredDocuments = documents.filter(doc => 
    selectedCategory === "all" || doc.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Library</h2>
          <p className="text-muted-foreground">
            Downloadable resources, templates, and reference materials
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
          <TabsList className="grid w-fit grid-cols-5">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map(document => (
          <Card key={document.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(document.file_type)}
                  <Badge variant="secondary" className="text-xs">
                    {document.file_type.toUpperCase()}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {document.category}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{document.title}</CardTitle>
              <CardDescription className="text-sm">
                {document.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{formatFileSize(document.file_size)}</span>
                <span>{document.download_count} downloads</span>
              </div>
              
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {document.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleDownload(document)}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No documents found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCategory === "all" 
              ? "No documents have been uploaded yet."
              : `No documents in the "${selectedCategory}" category.`
            }
          </p>
        </div>
      )}
    </div>
  );
}