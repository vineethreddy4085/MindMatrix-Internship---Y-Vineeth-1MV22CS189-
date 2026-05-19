import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock } from 'lucide-react';

const SearchResultCard = ({ problem }) => {
  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
  };

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {problem.title}
          </h3>
          <Badge variant="outline" className={`${difficultyColors[problem.difficulty]} shrink-0`}>
            {problem.difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {problem.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
              {problem.topic}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock className="h-3 w-3" />
              <span>{problem.timeToSolve}m</span>
            </div>
          </div>
          
          <Button asChild size="sm" variant="ghost" className="group/btn hover:bg-primary/10 hover:text-primary">
            <Link to={`/solve?id=${problem.id}`}>
              Solve
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;