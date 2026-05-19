import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, Lightbulb, BookOpen, Bookmark, Copy, Share2, Baby, Bug, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SolutionDisplay = ({ solution, problemId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [showEli5, setShowEli5] = useState(false);
  const [relatedProblems, setRelatedProblems] = useState([]);

  useEffect(() => {
    if (isAuthenticated && currentUser && problemId) {
      checkBookmarkStatus();
      fetchRelatedProblems();
    }
  }, [isAuthenticated, currentUser, problemId]);

  const checkBookmarkStatus = async () => {
    try {
      const records = await pb.collection('bookmarks').getList(1, 1, {
        filter: `userId = "${currentUser.id}" && problemId = "${problemId}"`,
        $autoCancel: false
      });
      
      if (records.items.length > 0) {
        setIsBookmarked(true);
        setBookmarkId(records.items[0].id);
      }
    } catch (e) {
      console.error("Error checking bookmark", e);
    }
  };

  const fetchRelatedProblems = async () => {
    if (!solution.topic) return;
    try {
      const records = await pb.collection('problems').getList(1, 3, {
        filter: `topic = "${solution.topic}" && id != "${problemId}"`,
        sort: '@random',
        $autoCancel: false
      });
      setRelatedProblems(records.items);
    } catch (e) {
      console.error("Error fetching related problems", e);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to bookmark problems");
      return;
    }

    try {
      if (isBookmarked && bookmarkId) {
        await pb.collection('bookmarks').delete(bookmarkId, { $autoCancel: false });
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success("Bookmark removed");
      } else {
        const record = await pb.collection('bookmarks').create({
          userId: currentUser.id,
          problemId: problemId,
          bookmarkedAt: new Date().toISOString()
        }, { $autoCancel: false });
        setIsBookmarked(true);
        setBookmarkId(record.id);
        toast.success("Problem bookmarked!");
      }
    } catch (e) {
      console.error("Bookmark error", e);
      toast.error("Failed to update bookmark");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solution.finalAnswer || solution.solution || '');
    toast.success("Copied to clipboard!");
  };

  const shareSolution = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Shareable link copied!");
  };

  // Parse concepts if it's a string (from DB) or array (from mock)
  const conceptsList = typeof solution.conceptBreakdown === 'string' 
    ? solution.conceptBreakdown.split('\n').filter(c => c.trim()).map(c => {
        const parts = c.split(':');
        return { term: parts[0]?.trim() || 'Concept', definition: parts[1]?.trim() || c };
      })
    : solution.concepts || [];

  // Parse steps if it's a string (from DB) or array (from mock)
  const stepsList = typeof solution.explanation === 'string'
    ? solution.explanation.split('\n\n').filter(s => s.trim()).map((s, i) => ({
        title: `Step ${i + 1}`,
        description: s.trim()
      }))
    : solution.steps || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Metadata & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Solution Ready
          </div>
          {solution.difficulty && (
            <Badge variant="outline">{solution.difficulty}</Badge>
          )}
          {solution.topic && (
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">{solution.topic}</Badge>
          )}
          {solution.timeToSolve && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>~{solution.timeToSolve}m to solve</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEli5(true)} className="hidden sm:flex">
            <Baby className="mr-2 h-4 w-4" /> ELI5
          </Button>
          <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy Solution">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={shareSolution} title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleBookmark} 
            className={isBookmarked ? "text-rose-500 hover:text-rose-600" : ""}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="explanation" className="rounded-lg">Explanation</TabsTrigger>
          <TabsTrigger value="answer" className="rounded-lg">Final Answer</TabsTrigger>
          <TabsTrigger value="concepts" className="rounded-lg">Concepts</TabsTrigger>
          <TabsTrigger value="debug" className="rounded-lg">Debug Code</TabsTrigger>
        </TabsList>

        <TabsContent value="explanation" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-5 w-5 text-primary" />
                Step-by-step explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stepsList.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answer" className="mt-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Final Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-card p-6 border shadow-sm overflow-x-auto">
                {solution.solution ? (
                  <pre className="text-sm font-mono leading-relaxed text-foreground">
                    <code>{solution.solution}</code>
                  </pre>
                ) : (
                  <p className="text-lg font-semibold leading-relaxed">
                    {solution.finalAnswer}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concepts" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-secondary" />
                Key concepts to master
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {conceptsList.map((concept, index) => (
                <div key={index} className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background font-semibold text-secondary border-secondary/30">{concept.term}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {concept.definition}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bug className="h-5 w-5 text-rose-500" />
                Debug Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {solution.debugInfo ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-2">Detected Issue</h4>
                    <p className="text-sm text-rose-600 dark:text-rose-300">
                      {solution.debugInfo.split('\n')[0] || "Logic Error: Edge case not handled"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Suggested Fix</h4>
                    <div className="rounded-xl bg-[#1e1e1e] p-4 overflow-x-auto">
                      <pre className="text-sm font-mono text-gray-300">
                        <code>{solution.debugInfo.substring(solution.debugInfo.indexOf('\n') + 1) || "// Corrected implementation\n" + solution.solution}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Common Mistakes</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Forgetting to handle empty inputs or null values</li>
                      <li>Off-by-one errors in loop boundaries</li>
                      <li>Not considering time complexity constraints</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No specific debug information available for this problem.</p>
                  <p className="text-sm mt-2">Review the explanation tab for a step-by-step breakdown.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Problems Section */}
      {relatedProblems.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-bold mb-4">Related Problems</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedProblems.map(prob => (
              <Card key={prob.id} className="bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col h-full">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">{prob.title}</h4>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{prob.difficulty}</Badge>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                      <Link to={`/solve?id=${prob.id}`}>
                        Solve <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ELI5 Modal */}
      <Dialog open={showEli5} onOpenChange={setShowEli5}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              Explain Like I'm 5
            </DialogTitle>
            <DialogDescription>
              A simplified breakdown of the core concept.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed">
            Imagine you have a box of toys... The problem is just asking you to sort them by color before putting them away. Instead of looking at every single toy one by one (which takes forever), we can group them into piles first. That's exactly what this algorithm does, but with data instead of toys!
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowEli5(false)}>Got it!</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SolutionDisplay;