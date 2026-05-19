import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Problem Solver Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI-powered companion for solving problems and mastering concepts
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold">Quick links</span>
            <nav className="mt-4 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
              <Link to="/solve" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Solve problem
              </Link>
              <Link to="/practice" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Practice
              </Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </nav>
          </div>

          <div>
            <span className="text-sm font-semibold">Legal</span>
            <nav className="mt-4 flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Problem Solver Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;