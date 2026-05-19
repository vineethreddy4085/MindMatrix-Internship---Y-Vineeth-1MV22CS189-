import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Search, Filter, X, SearchX } from 'lucide-react';
import SearchResultCard from '@/components/SearchResultCard.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();
  
  const initialQuery = searchParams.get('q') || '';
  const initialDifficulty = searchParams.getAll('difficulty');
  const initialTopic = searchParams.getAll('topic');

  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [difficulties, setDifficulties] = useState(initialDifficulty);
  const [topics, setTopics] = useState(initialTopic);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const availableTopics = ['Data Structures', 'Algorithms', 'DBMS'];
  const availableDifficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        let filterStr = '';
        const conditions = [];

        if (query) {
          conditions.push(`(title ~ "${query}" || description ~ "${query}")`);
          
          // Log search query if authenticated
          if (isAuthenticated && currentUser) {
            try {
              await pb.collection('searchQueries').create({
                query: query,
                userId: currentUser.id
              }, { $autoCancel: false });
            } catch (e) {
              console.error("Failed to log search query", e);
            }
          }
        }

        if (difficulties.length > 0) {
          const diffConditions = difficulties.map(d => `difficulty = "${d}"`).join(' || ');
          conditions.push(`(${diffConditions})`);
        }

        if (topics.length > 0) {
          const topicConditions = topics.map(t => `topic = "${t}"`).join(' || ');
          conditions.push(`(${topicConditions})`);
        }

        if (conditions.length > 0) {
          filterStr = conditions.join(' && ');
        }

        const records = await pb.collection('problems').getList(1, 50, {
          filter: filterStr,
          sort: '-created',
          $autoCancel: false
        });

        setResults(records.items);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, difficulties, topics, isAuthenticated, currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(searchInput);
    updateUrlParams(searchInput, difficulties, topics);
  };

  const toggleDifficulty = (diff) => {
    const newDiffs = difficulties.includes(diff)
      ? difficulties.filter(d => d !== diff)
      : [...difficulties, diff];
    setDifficulties(newDiffs);
    updateUrlParams(query, newDiffs, topics);
  };

  const toggleTopic = (topic) => {
    const newTopics = topics.includes(topic)
      ? topics.filter(t => t !== topic)
      : [...topics, topic];
    setTopics(newTopics);
    updateUrlParams(query, difficulties, newTopics);
  };

  const updateUrlParams = (q, diffs, tops) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    diffs.forEach(d => params.append('difficulty', d));
    tops.forEach(t => params.append('topic', t));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setDifficulties([]);
    setTopics([]);
    updateUrlParams(query, [], []);
  };

  return (
    <>
      <Helmet>
        <title>Search Problems - Problem Solver Hub</title>
      </Helmet>

      <div className="min-h-screen py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Filters (Desktop) */}
            <div className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="sticky top-24 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" /> Filters
                  </h2>
                  {(difficulties.length > 0 || topics.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Difficulty</h3>
                  <div className="space-y-3">
                    {availableDifficulties.map(diff => (
                      <div key={diff} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`diff-${diff}`} 
                          checked={difficulties.includes(diff)}
                          onCheckedChange={() => toggleDifficulty(diff)}
                        />
                        <Label htmlFor={`diff-${diff}`} className="text-sm font-normal cursor-pointer">{diff}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Topic</h3>
                  <div className="space-y-3">
                    {availableTopics.map(topic => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`topic-${topic}`} 
                          checked={topics.includes(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                        />
                        <Label htmlFor={`topic-${topic}`} className="text-sm font-normal cursor-pointer">{topic}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <form onSubmit={handleSearch} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for problems, algorithms, concepts..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 h-12 text-base bg-background shadow-sm rounded-xl"
                    />
                    {searchInput && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setSearchInput(''); setQuery(''); updateUrlParams('', difficulties, topics); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button type="submit" className="h-12 px-6 rounded-xl">Search</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 px-4 rounded-xl md:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                </form>
                
                {/* Popular searches */}
                {!query && results.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Popular:</span>
                    {['Binary Search', 'Dynamic Programming', 'SQL JOIN'].map(term => (
                      <Badge 
                        key={term} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/20 font-normal"
                        onClick={() => { setSearchInput(term); setQuery(term); updateUrlParams(term, difficulties, topics); }}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {isLoading ? 'Searching...' : `${results.length} Results`}
                  {query && <span className="text-muted-foreground font-normal text-base ml-2">for "{query}"</span>}
                </h2>
              </div>

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <div className="pt-4 flex justify-between">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {results.map((problem, index) => (
                    <motion.div
                      key={problem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <SearchResultCard problem={problem} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No problems found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    We couldn't find any problems matching your current search and filters. Try adjusting your criteria.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;