import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdaptiveLearningModules } from "@/components/AdaptiveLearningModules";
import { AdaptiveModuleContent } from "@/components/AdaptiveModuleContent";
import { Brain, ArrowLeft, Book } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export const AdaptiveLearning = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const handleBackToModules = () => {
    setSelectedModuleId(null);
  };

  return (
    <>
      <SEOHead 
        title="Adaptive Learning - AI-Powered Personalized Education"
        description="Experience personalized learning with our AI-powered adaptive education system that adjusts to your learning style, pace, and performance."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          {selectedModuleId ? (
            // Module Content View
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToModules}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Modules
                </Button>
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  <span className="font-medium">Adaptive Learning Module</span>
                </div>
              </div>
              
              <AdaptiveModuleContent
                moduleInstanceId={selectedModuleId}
                onComplete={() => setSelectedModuleId(null)}
              />
            </div>
          ) : (
            // Modules Overview
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Brain className="h-12 w-12 text-primary" />
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Adaptive Learning
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Your personalized learning journey powered by AI. Each module adapts to your learning style, 
                  performance, and career goals to provide the most effective educational experience.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    🧠 AI-Powered Adaptation
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    📊 Real-time Progress Tracking
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    🎯 Personalized Learning Paths
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    🏆 Interactive Assessments
                  </Badge>
                </div>
              </div>

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Intelligent Adaptation</h3>
                    <p className="text-sm text-muted-foreground">
                      Content difficulty and pacing automatically adjust based on your performance and learning patterns.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Book className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Comprehensive Curriculum</h3>
                    <p className="text-sm text-muted-foreground">
                      7 core modules covering everything from foundations to mastery certification in business finance.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized study recommendations and identify areas for improvement with AI insights.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Adaptive Learning Modules */}
              <AdaptiveLearningModules />

              {/* Learning Path Information */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    How Adaptive Learning Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">🎯 Personalized Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Each module begins with an adaptive assessment that evaluates your current knowledge 
                        and adjusts the learning path accordingly.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">📈 Dynamic Difficulty</h4>
                      <p className="text-sm text-muted-foreground">
                        Content difficulty automatically scales up or down based on your performance, 
                        ensuring optimal challenge and engagement.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">🔄 Continuous Adaptation</h4>
                      <p className="text-sm text-muted-foreground">
                        The system continuously analyzes your learning patterns and adjusts content 
                        delivery for maximum effectiveness.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">🏆 Mastery-Based Progression</h4>
                      <p className="text-sm text-muted-foreground">
                        Advance only when you've truly mastered the material, ensuring solid foundations 
                        for advanced concepts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};