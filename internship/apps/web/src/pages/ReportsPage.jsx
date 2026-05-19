import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Filter, RefreshCw, Flame, Mountain, Axe, PawPrint, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatTimestamp } from '@/utils/helpers.js';
import { mockReports } from '@/utils/mockData.js';

const getAlertConfig = (type) => {
  switch(type) {
    case 'Forest Fire': return { icon: Flame, color: 'bg-red-500', text: 'text-red-500' };
    case 'Landslide': return { icon: Mountain, color: 'bg-orange-500', text: 'text-orange-500' };
    case 'Illegal Tree Cutting': return { icon: Axe, color: 'bg-emerald-600', text: 'text-emerald-600' };
    case 'Wildlife Sighting': return { icon: PawPrint, color: 'bg-blue-500', text: 'text-blue-500' };
    default: return { icon: Filter, color: 'bg-gray-500', text: 'text-gray-500' };
  }
};

const ReportCard = ({ report }) => {
  const config = getAlertConfig(report.alertType);
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-card rounded-2xl border soft-shadow mb-4 overflow-hidden flex group cursor-pointer"
    >
      <div className={`w-2 ${config.color} shrink-0`} />
      <div className="p-5 flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className={`p-3 rounded-xl bg-muted ${config.text}`}>
          <Icon className="h-8 w-8" />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg">{report.alertType}</h3>
            <StatusBadge status={report.status} isPendingSync={report.syncStatus === 'Pending'} />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {report.latitude ? `${report.latitude.toString().slice(0,6)}, ${report.longitude.toString().slice(0,6)}` : 'Location unknown'}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatTimestamp(report.timestamp || report.created)}
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center justify-center p-2 text-muted-foreground group-hover:text-primary transition-colors">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};

const ReportsPage = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('reports').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: sort === 'Newest' ? '-created' : 'created',
        $autoCancel: false
      });
      
      const pending = JSON.parse(localStorage.getItem('pendingReports') || '[]');
      const allReports = [...pending, ...records];
      const filtered = allReports.filter(r => filter === 'All' || r.status === filter);
      
      filtered.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created).getTime();
        const timeB = new Date(b.timestamp || b.created).getTime();
        return sort === 'Newest' ? timeB - timeA : timeA - timeB;
      });

      setReports(filtered);
    } catch (error) {
      console.error(error);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchReports();
  }, [currentUser, filter, sort]);

  return (
    <>
      <Helmet><title>Your Reports - Sahyadri-Samrakshane</title></Helmet>
      <div className="container mx-auto px-4 py-8 pb-32 max-w-3xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Reports</h1>
            <p className="text-muted-foreground mt-1">Tracking {reports.length} submitted alerts</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchReports} disabled={loading} className="rounded-xl h-12 w-12 soft-shadow">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-4 mb-8 bg-card p-2 rounded-2xl border soft-shadow">
          <div className="flex-1">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-10">
                <div className="flex items-center gap-2 font-medium"><Filter className="h-4 w-4 text-muted-foreground"/> {filter}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Team Dispatched">Dispatched</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[1px] bg-border my-2" />
          <div className="flex-1">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-10 font-medium">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest">Newest First</SelectItem>
                <SelectItem value="Oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching your reports..." />
        ) : (
          <AnimatePresence>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-4 bg-card rounded-3xl border border-dashed soft-shadow">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mountain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Start protecting nature - Report your first alert when you spot something unusual.</p>
                <Button className="rounded-xl h-12 px-8 font-bold text-lg" onClick={() => window.location.href = '/report'}>
                  Report an Incident
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default ReportsPage;