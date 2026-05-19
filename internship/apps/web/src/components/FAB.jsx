import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const FAB = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-40"
    >
      <Link
        to="/report"
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 animate-pulse-glow"
        aria-label="Create Report"
      >
        <Plus className="h-8 w-8" />
      </Link>
    </motion.div>
  );
};

export default FAB;