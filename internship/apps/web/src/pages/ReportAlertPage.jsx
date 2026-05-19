import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, MapPin, ArrowLeft, ArrowRight, CheckCircle2, Flame, Mountain, Axe, PawPrint, MapPinOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useOnlineStatus } from '@/hooks/useOnlineStatus.js';
import pb from '@/lib/pocketbaseClient';
import { validateCoordinates } from '@/utils/helpers.js';

const ALERT_TYPES = [
  { id: 'Forest Fire', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
  { id: 'Landslide', icon: Mountain, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' },
  { id: 'Illegal Tree Cutting', icon: Axe, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600' },
  { id: 'Wildlife Sighting', icon: PawPrint, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' }
];

const ProgressIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-between mb-10 relative px-2">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 bg-muted -z-10 rounded-full" />
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-primary -z-10 rounded-full transition-all duration-500 ease-out" 
      style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
    />
    {[1, 2, 3].map((step) => (
      <div 
        key={step} 
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 ${
          step < currentStep ? 'bg-primary border-primary text-primary-foreground' : 
          step === currentStep ? 'bg-background border-primary text-primary scale-110 shadow-lg shadow-primary/20' : 
          'bg-card border-muted text-muted-foreground'
        }`}
      >
        {step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step}
      </div>
    ))}
  </div>
);

const ReportAlertPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedType = searchParams.get('type');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isOnline = useOnlineStatus();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    alertType: preSelectedType || '',
    latitude: '',
    longitude: '',
    description: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && !formData.latitude && !formData.longitude) {
      handleGetLocation();
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1 && !formData.alertType) {
      toast.error('Please select an alert type');
      return;
    }
    if (step === 2) {
      if (formData.latitude && formData.longitude && !validateCoordinates(formData.latitude, formData.longitude)) {
        toast.error('Invalid coordinates format');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setIsGettingLocation(false);
          toast.success("Location acquired");
        },
        (error) => {
          console.error(error);
          setIsGettingLocation(false);
          toast.error("Could not get location automatically. Please enter manually.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsGettingLocation(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('userId', currentUser.id);
      data.append('alertType', formData.alertType);
      data.append('status', 'Reported');
      data.append('syncStatus', isOnline ? 'Synced' : 'Pending');
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (formData.description) data.append('description', formData.description);
      if (formData.photo) data.append('photoUrl', formData.photo);

      if (isOnline) {
        await pb.collection('reports').create(data, { $autoCancel: false });
        toast.success('Alert submitted successfully!');
      } else {
        const pending = JSON.parse(localStorage.getItem('pendingReports') || '[]');
        pending.push({
          id: 'temp_' + Date.now(),
          userId: currentUser.id,
          alertType: formData.alertType,
          status: 'Reported',
          syncStatus: 'Pending',
          latitude: formData.latitude,
          longitude: formData.longitude,
          description: formData.description,
          photoBase64: photoPreview,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pendingReports', JSON.stringify(pending));
        toast.success('Offline. Report saved locally and will sync when online.');
      }
      navigate('/reports');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>New Alert - Sahyadri-Samrakshane</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-xl pb-32">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 mr-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">New Alert</h1>
        </div>

        <ProgressIndicator currentStep={step} totalSteps={3} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">What are you reporting?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALERT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.alertType === type.id;
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={type.id}
                      onClick={() => setFormData(prev => ({ ...prev, alertType: type.id }))}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${
                        isSelected ? `${type.border} ${type.bg} shadow-lg` : 'border-border bg-card hover:bg-muted/50 soft-shadow'
                      }`}
                    >
                      <div className={`p-4 rounded-full ${isSelected ? 'bg-background shadow-sm' : 'bg-muted'} ${type.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-lg">{type.id}</span>
                      {isSelected && <CheckCircle2 className={`h-6 w-6 absolute top-4 right-4 ${type.color}`} />}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h2 className="text-2xl font-bold">Provide Evidence</h2>
              
              <div className="space-y-4">
                <Label className="text-base">Photo Evidence</Label>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-4 border-muted aspect-video bg-black/5 soft-shadow group">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" className="rounded-xl font-bold" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="mr-2 h-4 w-4" /> Retake Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors soft-shadow"
                  >
                    <div className="bg-background p-4 rounded-full shadow-sm mb-3">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-base font-bold text-primary">Tap to capture photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoCapture} className="hidden" />
              </div>

              <div className="space-y-4 bg-card p-5 rounded-2xl border soft-shadow">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Location</Label>
                  <Button variant="outline" size="sm" onClick={handleGetLocation} disabled={isGettingLocation} className="rounded-xl">
                    {isGettingLocation ? 'Locating...' : 'Auto-detect'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Latitude</span>
                    <Input type="number" step="any" placeholder="e.g. 18.5204" value={formData.latitude} onChange={(e) => setFormData(prev => ({...prev, latitude: e.target.value}))} className="h-12 rounded-xl bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Longitude</span>
                    <Input type="number" step="any" placeholder="e.g. 73.8567" value={formData.longitude} onChange={(e) => setFormData(prev => ({...prev, longitude: e.target.value}))} className="h-12 rounded-xl bg-muted/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Description</Label>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{formData.description.length}/500</span>
                </div>
                <Textarea 
                  placeholder="Provide helpful details about the incident..." 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value.substring(0, 500)}))}
                  className="h-32 resize-none rounded-2xl bg-card soft-shadow border p-4 text-base"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold">Review & Submit</h2>
              
              <div className="bg-card rounded-3xl p-6 border soft-shadow space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-muted-foreground font-medium">Alert Type</span>
                  <span className="font-bold text-lg flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-xl">
                    {formData.alertType}
                  </span>
                </div>
                
                <div className="border-b pb-4 space-y-3">
                  <span className="text-muted-foreground font-medium block">Location</span>
                  {formData.latitude && formData.longitude ? (
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl text-base font-medium">
                      <MapPin className="h-5 w-5 text-primary" />
                      {formData.latitude}, {formData.longitude}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-500/10 p-3 rounded-xl">
                      <MapPinOff className="h-5 w-5" /> No coordinates provided
                    </div>
                  )}
                </div>

                <div className="border-b pb-4 space-y-3">
                  <span className="text-muted-foreground font-medium block">Evidence</span>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Evidence" className="h-32 w-auto rounded-xl object-cover border-2" />
                  ) : (
                    <span className="text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-xl block">No photo attached</span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-muted-foreground font-medium block">Description</span>
                  <p className="text-base bg-muted/50 p-4 rounded-xl min-h-[4rem] leading-relaxed">
                    {formData.description || <span className="italic text-muted-foreground">No description provided</span>}
                  </p>
                </div>
              </div>
              
              {!isOnline && (
                <div className="bg-amber-500/10 text-amber-700 p-4 rounded-2xl border border-amber-500/20 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <MapPinOff className="h-5 w-5" /> Offline mode: Report will sync automatically later.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 mt-10">
          {step > 1 && (
            <Button variant="outline" className="flex-1 rounded-2xl h-14 text-lg font-bold soft-shadow" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button className="flex-1 rounded-2xl h-14 text-lg font-bold soft-shadow" onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button className="flex-1 rounded-2xl h-14 text-lg font-bold bg-primary hover:bg-primary/90 soft-shadow animate-pulse-glow" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Alert'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportAlertPage;