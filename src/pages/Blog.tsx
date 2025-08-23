import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import blogHero from "@/assets/blog-hero.jpg";
import fintechPost from "@/assets/fintech-post.jpg";
import creditSkillsPost from "@/assets/credit-skills-post.jpg";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "The Future of Financial Technology in Commercial Lending",
      excerpt: "Explore how emerging technologies are reshaping the commercial lending landscape and what it means for professionals.",
      author: "Sarah Johnson",
      date: "2024-01-15",
      category: "Technology",
      readTime: "5 min read",
      image: fintechPost
    },
    {
      id: 2,
      title: "Essential Skills for Modern Credit Analysts",
      excerpt: "A comprehensive guide to the key competencies every credit analyst needs to succeed in today's market.",
      author: "Michael Chen",
      date: "2024-01-10",
      category: "Career Development",
      readTime: "8 min read",
      image: creditSkillsPost
    },
    {
      id: 3,
      title: "Risk Management Best Practices for 2024",
      excerpt: "Stay ahead of the curve with the latest risk management strategies and regulatory updates.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-05",
      category: "Risk Management",
      readTime: "6 min read",
      image: fintechPost
    },
    {
      id: 4,
      title: "Digital Transformation in Corporate Training",
      excerpt: "How organizations are leveraging digital platforms to enhance employee learning and development.",
      author: "Sarah Johnson",
      date: "2023-12-28",
      category: "Education",
      readTime: "7 min read",
      image: creditSkillsPost
    }
  ];

  const categories = ["All", "Technology", "Career Development", "Risk Management", "Education"];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={blogHero} 
          alt="Professional blog and knowledge sharing environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Blog & Resources</h1>
            <p className="text-lg">
              Stay informed with the latest insights, trends, and best practices in finance and professional development.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={category === "All" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="text-xl hover:text-primary cursor-pointer">
                  {post.title}
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
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
    </div>
  );
};

export default Blog;