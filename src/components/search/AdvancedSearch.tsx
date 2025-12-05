import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Video, FileText, Filter, X, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'course' | 'module' | 'video' | 'article';
  title: string;
  description?: string;
  courseId?: string;
  moduleId?: string;
}

interface AdvancedSearchProps {
  trigger?: React.ReactNode;
}

const RECENT_SEARCHES_KEY = 'lms_recent_searches';

export function AdvancedSearch({ trigger }: AdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<{ level?: string; type?: string }>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  // Global keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchTerm = `%${query}%`;

      // Search courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description, level')
        .eq('is_active', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      if (courses) {
        searchResults.push(...courses.map(c => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          description: c.description,
        })));
      }

      // Search modules
      const { data: modules } = await supabase
        .from('course_content_modules')
        .select('id, title, description, course_id')
        .eq('is_active', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      if (modules) {
        searchResults.push(...modules.map(m => ({
          id: m.id,
          type: 'module' as const,
          title: m.title,
          description: m.description,
          courseId: m.course_id,
        })));
      }

      // Search videos
      const { data: videos } = await supabase
        .from('course_videos')
        .select('id, title, description, module_id')
        .eq('is_active', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      if (videos) {
        searchResults.push(...videos.map(v => ({
          id: v.id,
          type: 'video' as const,
          title: v.title,
          description: v.description || undefined,
          moduleId: v.module_id || undefined,
        })));
      }

      // Search articles
      const { data: articles } = await supabase
        .from('course_articles')
        .select('id, title, excerpt, module_id')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
        .limit(10);

      if (articles) {
        searchResults.push(...articles.map(a => ({
          id: a.id,
          type: 'article' as const,
          title: a.title,
          description: a.excerpt || undefined,
          moduleId: a.module_id || undefined,
        })));
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(r => r.type === activeTab);
  }, [results, activeTab]);

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    setOpen(false);
    
    switch (result.type) {
      case 'course':
        navigate(`/courses`);
        break;
      case 'module':
        if (result.courseId) {
          navigate(`/module/${result.id}`);
        }
        break;
      case 'video':
        navigate('/video-library');
        break;
      case 'article':
        navigate('/resources');
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'module':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-500/10 text-blue-600';
      case 'module':
        return 'bg-purple-500/10 text-purple-600';
      case 'video':
        return 'bg-red-500/10 text-red-600';
      case 'article':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search...
            <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, modules, videos, articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {query.length < 2 && recentSearches.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                  <TabsTrigger value="course">
                    Courses ({results.filter(r => r.type === 'course').length})
                  </TabsTrigger>
                  <TabsTrigger value="module">
                    Modules ({results.filter(r => r.type === 'module').length})
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    Videos ({results.filter(r => r.type === 'video').length})
                  </TabsTrigger>
                  <TabsTrigger value="article">
                    Articles ({results.filter(r => r.type === 'article').length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{query}"</p>
                  </div>
                ) : (
                  filteredResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left flex items-start gap-3"
                    >
                      <div className={`p-2 rounded ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
