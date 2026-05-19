import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bookmark as BookmarkIcon, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import BookmarkCard from '@/components/BookmarkCard.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const BookmarksPage = () => {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchBookmarks();
  }, [currentUser]);

  useEffect(() => {
    filterAndSortBookmarks();
  }, [bookmarks, searchQuery, sortBy]);

  const fetchBookmarks = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const records = await pb.collection('bookmarks').getFullList({
        filter: `userId = "${currentUser.id}"`,
        expand: 'problemId',
        sort: '-bookmarkedAt',
        $autoCancel: false
      });
      setBookmarks(records);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBookmarks = () => {
    let result = [...bookmarks];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => {
        const problem = b.expand?.problemId;
        if (!problem) return false;
        return problem.title.toLowerCase().includes(query) || 
               problem.topic.toLowerCase().includes(query);
      });
    }

    // Sort
    result.sort((a, b) => {
      const probA = a.expand?.problemId;
      const probB = b.expand?.problemId;
      
      if (!probA || !probB) return 0;

      switch (sortBy) {
        case 'newest':
          return new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt);
        case 'oldest':
          return new Date(a.bookmarkedAt) - new Date(b.bookmarkedAt);
        case 'difficulty':
          const diffWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return diffWeight[probB.difficulty] - diffWeight[probA.difficulty];
        case 'topic':
          return probA.topic.localeCompare(probB.topic);
        default:
          return 0;
      }
    });

    setFilteredBookmarks(result);
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await pb.collection('bookmarks').delete(id, { $autoCancel: false });
      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast.success("Bookmark removed");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <>
      <Helmet>
        <title>My Bookmarks - Problem Solver Hub</title>
      </Helmet>

      <div className="min-h-screen py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl tracking-tight flex items-center gap-3">
                <BookmarkIcon className="h-8 w-8 text-primary fill-primary/20" />
                My Bookmarks
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Saved problems for quick reference and review
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="difficulty">Difficulty (Hard to Easy)</SelectItem>
                  <SelectItem value="topic">Topic (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="pt-4 flex justify-between border-t">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBookmarks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BookmarkCard bookmark={bookmark} onDelete={handleDeleteBookmark} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl border border-dashed">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No matching bookmarks" : "No bookmarks yet"}
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms." 
                  : "Save problems you want to review later by clicking the bookmark icon on any solution page."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/search">Browse Problems</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookmarksPage;