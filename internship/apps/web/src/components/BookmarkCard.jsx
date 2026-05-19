import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trash2, Calendar, Loader2 } from 'lucide-react';

const BookmarkCard = ({ bookmark, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const problem = bookmark.expand?.problemId;

  if (!problem) return null;

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(bookmark.id);
    setIsDeleting(false);
  };

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {problem.title}
          </h3>
          <Badge variant="outline" className={`${difficultyColors[problem.difficulty]} shrink-0`}>
            {problem.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <Badge variant="secondary" className="bg-secondary/10 text-secondary font-normal">
            {problem.topic}
          </Badge>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Saved {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
          
          <Button asChild size="sm" className="group/btn">
            <Link to={`/solve?id=${problem.id}`}>
              View Solution
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;