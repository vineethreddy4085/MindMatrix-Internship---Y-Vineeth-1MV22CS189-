export const formatTimestamp = (dateString) => {
  if (!dateString) return 'Unknown time';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'reported': return 'status-reported';
    case 'verified': return 'status-verified';
    case 'team dispatched': return 'status-dispatched';
    case 'resolved': return 'status-resolved';
    default: return 'bg-muted text-muted-foreground border-muted';
  }
};

export const compressImage = async (file) => {
  // Simplified mock implementation for image compression
  // In a real app, use canvas to resize and compress the Blob
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(file); // Return original file for this mock
    }, 500);
  });
};

export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  
  return true;
};