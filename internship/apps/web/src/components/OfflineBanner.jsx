import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus.js';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-amber-500/90 backdrop-blur-md text-amber-950 px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium z-50 relative shadow-md"
        >
          <div className="bg-amber-950/10 p-1.5 rounded-full">
            <WifiOff className="h-4 w-4" />
          </div>
          <span className="flex-1">You're offline. Reports will sync automatically when connection is restored.</span>
          <RefreshCw className="h-4 w-4 animate-spin opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;