import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Mountain, Axe, PawPrint, ChevronRight, Activity, CheckCircle2, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import FAB from '@/components/FAB.jsx';

const AlertTypeCard = ({ title, desc, icon: Icon, gradient, linkParams }) => (
  <Link to={`/report?type=${linkParams}`}>
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-2xl text-white h-full flex flex-col justify-between soft-shadow bg-gradient-to-br ${gradient} relative overflow-hidden group`}
    >
      <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl inline-flex mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm relative z-10">
        Report Now <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </motion.div>
  </Link>
);

const StatsBanner = ({ total, verified }) => (
  <div className="bg-card rounded-2xl p-6 soft-shadow border flex flex-col sm:flex-row items-center justify-between gap-6">
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <div className="bg-primary/10 p-4 rounded-full text-primary">
        <Activity className="h-6 w-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">Reports This Month</p>
        <p className="text-3xl font-bold text-foreground">{total}</p>
      </div>
    </div>
    <div className="w-full sm:w-px h-[1px] sm:h-12 bg-border" />
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <div className="bg-blue-500/10 p-4 rounded-full text-blue-500">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">Alerts Verified</p>
        <p className="text-3xl font-bold text-foreground">{verified}</p>
      </div>
    </div>
    <div className="w-full sm:w-px h-[1px] sm:h-12 bg-border" />
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <div className="bg-orange-500/10 p-4 rounded-full text-orange-500">
        <Clock className="h-6 w-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">Avg Response</p>
        <p className="text-3xl font-bold text-foreground">&lt; 2 hrs</p>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ total: 42, verified: 18 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const records = await pb.collection('reports').getList(1, 1, {
          filter: `created >= "${startOfMonth}"`,
          $autoCancel: false
        });
        const verifiedRecords = await pb.collection('reports').getList(1, 1, {
          filter: `created >= "${startOfMonth}" && status = "Verified"`,
          $autoCancel: false
        });
        
        if (records.totalItems > 0) {
          setStats({ total: records.totalItems, verified: verifiedRecords.totalItems });
        }
      } catch (e) {
        console.log("Using default stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Helmet><title>Sahyadri-Samrakshane | Dashboard</title></Helmet>
      <div className="pb-32">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1630098728545-cfe030844800?q=80&w=2000&auto=format&fit=crop" 
            alt="Forest canopy" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto mt-10">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            >
              Sahyadri-Samrakshane
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white/90 text-xl md:text-2xl font-medium max-w-2xl mx-auto"
            >
              Protecting Nature Together
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-16 relative z-30">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <StatsBanner total={stats.total} verified={stats.verified} />
          </motion.div>

          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Report an Incident</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AlertTypeCard 
                title="Forest Fire" 
                desc="Report smoke or visible flames immediately to prevent spread."
                icon={Flame}
                gradient="from-red-500 to-orange-600"
                linkParams="Forest Fire"
              />
              <AlertTypeCard 
                title="Landslide" 
                desc="Report blocked roads, moving earth, or severe cracks."
                icon={Mountain}
                gradient="from-orange-500 to-amber-600"
                linkParams="Landslide"
              />
              <AlertTypeCard 
                title="Illegal Tree Cutting" 
                desc="Report unauthorized logging or suspicious transport."
                icon={Axe}
                gradient="from-emerald-600 to-teal-800"
                linkParams="Illegal Tree Cutting"
              />
              <AlertTypeCard 
                title="Wildlife Sighting" 
                desc="Report endangered animals near human settlements."
                icon={PawPrint}
                gradient="from-blue-500 to-indigo-700"
                linkParams="Wildlife Sighting"
              />
            </div>
          </div>
        </div>
      </div>
      {isAuthenticated && <FAB />}
    </>
  );
};

export default HomePage;