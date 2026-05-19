import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { LogOut, Bell, Moon, Languages, Shield, Info, Trash2, ChevronRight, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SectionHeader = ({ title }) => (
  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 px-2">{title}</h3>
);

const SettingsItem = ({ icon: Icon, title, children, isDestructive }) => (
  <div className="flex items-center justify-between p-5 bg-card first:rounded-t-2xl last:rounded-b-2xl border-b last:border-b-0 border-border/50 hover:bg-muted/30 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <Label className={`font-semibold text-base cursor-pointer ${isDestructive ? 'text-red-500' : ''}`}>{title}</Label>
    </div>
    <div className="flex items-center">
      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearCache = () => {
    if(window.confirm("Are you sure you want to clear local cache? Pending offline reports will be lost.")) {
      localStorage.removeItem('pendingReports');
      localStorage.removeItem('eduBookmarks');
      toast.success("Cache cleared successfully");
    }
  };

  return (
    <>
      <Helmet><title>Settings - Sahyadri-Samrakshane</title></Helmet>
      <div className="container mx-auto px-4 py-8 pb-32 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {currentUser && (
          <div className="bg-card rounded-3xl p-6 mb-10 flex items-center gap-5 soft-shadow border">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {currentUser.name?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
            </div>
            <div>
              <p className="font-bold text-xl">{currentUser.name || 'Forest Ranger'}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>
        )}

        <div className="space-y-10">
          <section>
            <SectionHeader title="Preferences" />
            <div className="rounded-2xl border bg-card soft-shadow overflow-hidden">
              <SettingsItem icon={Moon} title="Dark Mode">
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                />
              </SettingsItem>
              <SettingsItem icon={Bell} title="Notifications">
                <Switch defaultChecked />
              </SettingsItem>
              <SettingsItem icon={Languages} title="Language">
                <Select defaultValue="en">
                  <SelectTrigger className="w-[130px] border-none bg-transparent shadow-none text-right flex justify-end gap-2 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="mr">मराठी</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsItem>
            </div>
          </section>

          <section>
            <SectionHeader title="Data & Storage" />
            <div className="rounded-2xl border bg-card soft-shadow overflow-hidden">
              <SettingsItem icon={Trash2} title="Clear Cache" isDestructive>
                <Button variant="ghost" size="sm" onClick={handleClearCache} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl">
                  Clear
                </Button>
              </SettingsItem>
            </div>
          </section>

          <section>
            <SectionHeader title="About" />
            <div className="rounded-2xl border bg-card soft-shadow overflow-hidden">
              <SettingsItem icon={Info} title="Version">
                <span className="text-sm text-muted-foreground font-medium pr-2 bg-muted px-3 py-1 rounded-full">1.0.0</span>
              </SettingsItem>
              <SettingsItem icon={Shield} title="Privacy Policy">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </SettingsItem>
            </div>
          </section>

          {currentUser && (
            <section className="pt-6">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 font-bold text-lg soft-shadow"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" /> Sign Out
              </Button>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;