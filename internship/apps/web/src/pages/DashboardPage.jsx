import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, BookOpen, TrendingUp, ArrowRight, Flame, Target, CheckCircle2, BrainCircuit, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useUserProgress } from '@/hooks/useUserProgress.js';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { progress, isLoading } = useUserProgress();

  const getMotivationalMessage = (streak) => {
    if (streak === 0) return "Start your learning journey today!";
    if (streak < 3) return "Great start! Keep the momentum going.";
    if (streak < 7) return "You're on fire! Don't break the streak.";
    return "Unstoppable! Your dedication is inspiring.";
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Shift days so today is at the end
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const displayDays = [...daysOfWeek.slice(todayIndex + 1), ...daysOfWeek.slice(0, todayIndex + 1)];

  return (
    <>
      <Helmet>
        <title>Dashboard - Problem Solver Hub</title>
      </Helmet>

      <div className="min-h-screen py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-6xl space-y-8"
          >
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold leading-tight md:text-4xl tracking-tight">
                  Welcome back, <span className="text-primary">{currentUser?.name?.split(' ')[0] || 'Student'}</span>!
                </h1>
                <p className="mt-2 text-lg text-muted-foreground flex items-center gap-2">
                  {getMotivationalMessage(progress.streak)}
                  {progress.streak > 2 && <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />}
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild className="rounded-full shadow-md">
                  <Link to="/solve">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Solve New
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full bg-background">
                  <Link to="/bookmarks">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Solved</p>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <h2 className="text-3xl font-bold">{progress.totalSolved}</h2>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                    <Target className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <h2 className="text-3xl font-bold">{progress.accuracy}%</h2>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    <Flame className={`h-4 w-4 ${progress.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold">{progress.streak}</h2>
                        <span className="text-sm text-muted-foreground">days</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Topics Covered</p>
                    <BrainCircuit className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <h2 className="text-3xl font-bold">{progress.topicsCovered}</h2>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
              {/* Weekly Activity Chart */}
              <Card className="md:col-span-3 glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription>Problems solved in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex h-[200px] items-end justify-between gap-2 pt-4">
                      {Array(7).fill(0).map((_, i) => (
                        <Skeleton key={i} className="w-full h-full rounded-t-md" style={{ height: `${Math.random() * 100 + 20}%` }} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[200px] items-end justify-between gap-2 pt-4">
                      {progress.weeklyActivity.map((count, i) => {
                        const maxCount = Math.max(...progress.weeklyActivity, 5);
                        const height = Math.max((count / maxCount) * 100, 5); // min 5% height for visibility
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 w-full group">
                            <div className="relative w-full flex justify-center h-full items-end">
                              <div 
                                className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 ${count > 0 ? 'bg-primary/80 group-hover:bg-primary' : 'bg-muted'}`}
                                style={{ height: `${height}%` }}
                              >
                                {count > 0 && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs py-1 px-2 rounded">
                                    {count}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{displayDays[i]}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="md:col-span-4 glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest solved problems</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : progress.recentActivity.length > 0 ? (
                    <div className="space-y-6">
                      {progress.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 group">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium leading-none group-hover:text-primary transition-colors">
                                {activity.problemTitle || 'Unknown Problem'}
                              </p>
                              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                  {activity.topic || 'General'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {activity.accuracy}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">Solve your first problem to see it here.</p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/solve">Start Solving</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;