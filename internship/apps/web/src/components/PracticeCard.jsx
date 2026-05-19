import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const PracticeCard = ({ question, difficulty, index }) => {
  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold leading-snug">
              {question}
            </CardTitle>
            <Badge className={`${difficultyColors[difficulty]} shrink-0`}>
              {difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            Test your understanding with this {difficulty.toLowerCase()}-level problem
          </p>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button className="w-full group transition-all duration-200 active:scale-[0.98]">
            Try now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PracticeCard;