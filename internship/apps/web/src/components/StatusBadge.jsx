import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/helpers.js';

const StatusBadge = ({ status, isPendingSync = false }) => {
  if (isPendingSync) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-dashed">
        Pending Sync
      </Badge>
    );
  }

  const colorClass = getStatusColor(status);
  
  return (
    <Badge className={`${colorClass} bg-opacity-15 dark:bg-opacity-20 hover:${colorClass} hover:bg-opacity-25 shadow-none`}>
      {status || 'Unknown'}
    </Badge>
  );
};

export default StatusBadge;