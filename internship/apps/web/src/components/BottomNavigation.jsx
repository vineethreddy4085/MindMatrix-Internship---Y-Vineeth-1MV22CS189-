import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Reports', path: '/reports', icon: ClipboardList },
    { label: 'Learn', path: '/education', icon: BookOpen },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t pb-safe sm:hidden rounded-t-2xl">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = path === item.path || (item.path !== '/' && path.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full text-xs font-medium group"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50'}`}>
                <Icon className={`h-6 w-6 ${isActive ? 'fill-primary/20' : ''}`} />
              </div>
              <span className={`mt-1 transition-colors duration-300 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 h-1 w-12 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;