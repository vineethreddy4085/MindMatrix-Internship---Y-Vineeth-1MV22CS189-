import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Lightbulb, BookOpen, LayoutDashboard, Search, Bookmark } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/solve', label: 'Solve problem', icon: Lightbulb },
    { path: '/practice', label: 'Practice', icon: BookOpen },
    { path: '/search', label: 'Search', icon: Search },
  ];

  if (isAuthenticated) {
    navItems.push({ path: '/bookmarks', label: 'Bookmarks', icon: Bookmark });
    navItems.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
  }

  const isActive = (path) => location.pathname === path;

  if (isMobile) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background/80 backdrop-blur-sm">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;