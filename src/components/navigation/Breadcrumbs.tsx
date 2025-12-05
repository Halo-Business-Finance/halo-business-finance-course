import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  courses: 'Courses',
  module: 'Module',
  progress: 'Progress',
  achievements: 'Achievements',
  resources: 'Resources',
  support: 'Support',
  account: 'Account',
  'video-library': 'Video Library',
  admin: 'Admin',
};

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL if items not provided
  const breadcrumbs = items || generateBreadcrumbs(location.pathname);

  function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Skip dynamic segments like UUIDs
      if (segment.match(/^[0-9a-f-]{36}$/i)) {
        return;
      }
      
      crumbs.push({
        label: routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        href: isLast ? undefined : currentPath
      });
    });
    
    return crumbs;
  }

  if (breadcrumbs.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      {showHome && (
        <>
          <Link 
            to="/dashboard" 
            className="flex items-center hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.length > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
          )}
        </>
      )}
      
      {breadcrumbs.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
          )}
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
