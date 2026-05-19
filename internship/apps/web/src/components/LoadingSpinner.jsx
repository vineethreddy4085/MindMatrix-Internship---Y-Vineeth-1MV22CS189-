import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = "default", text }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && <p className="text-muted-foreground text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;