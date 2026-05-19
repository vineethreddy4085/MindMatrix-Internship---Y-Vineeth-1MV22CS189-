import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Bookmark, Flame, Mountain, TreePine, PawPrint, Search, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import pb from '@/lib/pocketbaseClient';
import { mockEducationTips } from '@/utils/mockData.js';
import { toast } from 'sonner';

const getCategoryConfig = (category) => {
  if (category.includes('Fire')) return { icon: Flame, color: 'bg-red-500', text: 'text-red-500' };
  if (category.includes('Wildlife')) return { icon: PawPrint, color: 'bg-blue-500', text: 'text-blue-500' };
  if (category.includes('Landslide')) return { icon: Mountain, color: 'bg-orange-500', text: 'text-orange-500' };
  if (category.includes('Logging')) return { icon: TreePine, color: 'bg-emerald-600', text: 'text-emerald-600' };
  return { icon: ShieldAlert, color: 'bg-primary', text: 'text-primary' };
};

const EducationCard = ({ tip, isBookmarked, onToggleBookmark }) => {
  const config = getCategoryConfig(tip.category || '');
  const Icon = config.icon;
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: tip.title, text: tip.description, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${tip.title} - ${tip.description}`);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl border soft-shadow flex flex-col overflow-hidden group"
    >
      <div className={`h-2 w-full ${config.color}`} />
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-muted ${config.text}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2 font-medium">{tip.category}</Badge>
            <h3 className="font-bold text-xl leading-snug">{tip.title}</h3>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
          {tip.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-xl" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onToggleBookmark(tip.id)} className={`rounded-xl ${isBookmarked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}>
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EducationPage = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarks, setBookmarks] = useState([]);

  const categories = ['All', 'Fire Safety', 'Wildlife Protection', 'Landslide Awareness', 'Illegal Logging', 'Prevention'];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('eduBookmarks') || '[]');
    setBookmarks(saved);

    const fetchContent = async () => {
      try {
        const records = await pb.collection('educationContent').getFullList({ sort: '-created', $autoCancel: false });
        setTips(records);
      } catch (err) {
        setTips(mockEducationTips);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const toggleBookmark = (id) => {
    let newBookmarks;
    if (bookmarks.includes(id)) {
      newBookmarks = bookmarks.filter(b => b !== id);
      toast.success("Bookmark removed");
    } else {
      newBookmarks = [...bookmarks, id];
      toast.success("Tip bookmarked!");
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('eduBookmarks', JSON.stringify(newBookmarks));
  };

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(search.toLowerCase()) || tip.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet><title>Learn & Protect - Sahyadri-Samrakshane</title></Helmet>
      <div className="container mx-auto px-4 py-8 pb-32 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Learn & Protect</h1>
          <p className="text-muted-foreground text-lg">Essential guides for forest safety and disaster prevention.</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search guides, tips, and procedures..." 
            className="pl-12 h-14 rounded-2xl bg-card border-none soft-shadow text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide gap-3">
          {categories.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={`rounded-full h-10 px-6 whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-card hover:bg-muted'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading educational content..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <AnimatePresence>
              {filteredTips.map(tip => (
                <EducationCard 
                  key={tip.id} 
                  tip={tip} 
                  isBookmarked={bookmarks.includes(tip.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
              {filteredTips.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 bg-card rounded-3xl border border-dashed">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">No guides found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
};

export default EducationPage;