import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import blogHero from "@/assets/blog-hero.jpg";
import fintechProfessional from "@/assets/fintech-professional.jpg";
import creditAnalystProfessional from "@/assets/credit-analyst-professional.jpg";
import riskManagementProfessional from "@/assets/risk-management-professional.jpg";
import digitalTrainingProfessional from "@/assets/digital-training-professional.jpg";
import aiAnalyticsProfessional from "@/assets/ai-analytics-professional.jpg";
import microlearningProfessional from "@/assets/microlearning-professional.jpg";
import adaptiveLearningProfessional from "@/assets/adaptive-learning-professional.jpg";
import gamificationProfessional from "@/assets/gamification-professional.jpg";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

  const posts = [
    {
      id: 1,
      title: "The Future of Financial Technology in Commercial Lending",
      excerpt: "Explore how emerging technologies are reshaping the commercial lending landscape and what it means for professionals.",
      author: "Sarah Johnson",
      date: "2024-01-15",
      category: "Technology",
      readTime: "5 min read",
      image: fintechProfessional
    },
    {
      id: 2,
      title: "Essential Skills for Modern Credit Analysts",
      excerpt: "A comprehensive guide to the key competencies every credit analyst needs to succeed in today's market.",
      author: "Michael Chen",
      date: "2024-01-10",
      category: "Career Development",
      readTime: "8 min read",
      image: creditAnalystProfessional
    },
    {
      id: 3,
      title: "Risk Management Best Practices for 2024",
      excerpt: "Stay ahead of the curve with the latest risk management strategies and regulatory updates.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-05",
      category: "Risk Management",
      readTime: "6 min read",
      image: riskManagementProfessional
    },
    {
      id: 4,
      title: "Digital Transformation in Corporate Training",
      excerpt: "How organizations are leveraging digital platforms to enhance employee learning and development.",
      author: "Sarah Johnson",
      date: "2023-12-28",
      category: "Education",
      readTime: "7 min read",
      image: digitalTrainingProfessional
    },
    {
      id: 5,
      title: "Maximizing ROI with AI-Powered Learning Platforms",
      excerpt: "Discover how artificial intelligence is revolutionizing corporate training efficiency and measuring learning outcomes in financial services.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-22",
      category: "Technology",
      readTime: "6 min read",
      image: aiAnalyticsProfessional
    },
    {
      id: 6,
      title: "Microlearning: The Future of Professional Development",
      excerpt: "Learn why bite-sized learning modules are proving more effective than traditional training methods for busy finance professionals.",
      author: "Michael Chen",
      date: "2024-01-18",
      category: "Education",
      readTime: "5 min read",
      image: microlearningProfessional
    },
    {
      id: 7,
      title: "Adaptive Learning Systems in Financial Training",
      excerpt: "How personalized learning paths and intelligent content delivery are transforming professional education in commercial lending.",
      author: "Sarah Johnson",
      date: "2024-01-12",
      category: "Technology",
      readTime: "7 min read",
      image: adaptiveLearningProfessional
    },
    {
      id: 8,
      title: "Gamification Strategies for Enhanced Learning Engagement",
      excerpt: "Explore how interactive elements, progress tracking, and achievement systems boost completion rates in online training programs.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-08",
      category: "Education",
      readTime: "6 min read",
      image: gamificationProfessional
    }
  ];

  const categories = ["All", "Technology", "Career Development", "Risk Management", "Education"];

  const filteredPosts = selectedCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleReadMore = (postTitle: string) => {
    toast({
      title: "Article Preview",
      description: `"${postTitle}" - Full article coming soon! This is a demo version.`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <img 
          src={blogHero} 
          alt="Professional blog and knowledge sharing environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Blog & Resources</h1>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed">
              Stay informed with the latest insights, trends, and best practices in finance and professional development.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">

        <div className="flex flex-wrap gap-2 justify-center mb-6 md:mb-8">
          {categories.map((category) => (
            <Badge 
              key={category} 
              onClick={() => setSelectedCategory(category)}
              className={`cursor-pointer text-xs md:text-sm transition-all ${
                selectedCategory === category
                  ? "bg-halo-orange text-white shadow-lg scale-105 border-2 border-halo-orange" 
                  : "bg-halo-navy text-halo-orange hover:bg-halo-navy/90 hover:scale-105"
              }`}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-40 md:h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="text-xs bg-halo-navy text-halo-orange">{post.category}</Badge>
                  <span className="text-xs md:text-sm text-black">{post.readTime}</span>
                </div>
                <CardTitle className="text-lg md:text-xl hover:text-primary cursor-pointer text-black">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm text-black">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs md:text-sm text-black">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <Button 
                    className="text-xs md:text-sm bg-halo-navy text-halo-orange hover:bg-halo-navy/90" 
                    size="sm"
                    onClick={() => handleReadMore(post.title)}
                  >
                    <span className="hidden sm:inline">Read More</span>
                    <span className="sm:hidden">Read</span>
                    <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
        </div>
        
        <FinPilotBrandFooter />
    </div>
  );
};

export default Blog;