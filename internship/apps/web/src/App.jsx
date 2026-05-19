import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import pb from '@/lib/pocketbaseClient';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { Toaster } from 'sonner';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ReportAlertPage from './pages/ReportAlertPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import EducationPage from './pages/EducationPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

import { useOnlineStatus } from '@/hooks/useOnlineStatus.js';
import { toast } from 'sonner';

const AutoSyncService = () => {
  const isOnline = useOnlineStatus();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOnline && isAuthenticated) {
      const syncPendingReports = async () => {
        const pending = JSON.parse(localStorage.getItem('pendingReports') || '[]');
        if (pending.length === 0) return;

        toast.info(`Syncing ${pending.length} offline report(s)...`);
        
        let syncedCount = 0;
        const failedReports = [];

        for (const report of pending) {
          try {
            const data = new FormData();
            data.append('userId', report.userId);
            data.append('alertType', report.alertType);
            data.append('status', report.status);
            data.append('syncStatus', 'Synced');
            if (report.latitude) data.append('latitude', report.latitude);
            if (report.longitude) data.append('longitude', report.longitude);
            if (report.description) data.append('description', report.description);
            // In a real app we'd convert base64 back to file here
            
            await pb.collection('reports').create(data, { $autoCancel: false });
            syncedCount++;
          } catch (e) {
            console.error("Failed to sync report", e);
            failedReports.push(report);
          }
        }

        if (syncedCount > 0) {
          toast.success(`Successfully synced ${syncedCount} reports!`);
        }
        
        localStorage.setItem('pendingReports', JSON.stringify(failedReports));
      };

      syncPendingReports();
    }
  }, [isOnline, isAuthenticated]);

  return null;
};

function AppContent() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/30">
      <AutoSyncService />
      <OfflineBanner />
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/education" element={<EducationPage />} />
          
          <Route path="/report" element={
            <ProtectedRoute><ReportAlertPage /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute><ReportsPage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />
          
          <Route path="*" element={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary">404</h1>
                <p className="mt-2 text-muted-foreground">Path not found</p>
                <a href="/" className="mt-4 inline-block font-bold text-primary hover:underline">Return home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <BottomNavigation />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;