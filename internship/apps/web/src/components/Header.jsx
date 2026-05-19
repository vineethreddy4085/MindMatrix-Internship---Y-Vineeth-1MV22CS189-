import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full glass-panel border-b-0 rounded-b-2xl sm:rounded-none"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-[20px] tracking-tight text-foreground font-['Space_Grotesk']">
            Sahyadri<span className="text-primary">-Samrakshane</span>
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;