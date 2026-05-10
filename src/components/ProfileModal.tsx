import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, Mail, Shield, User, LogOut } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { CustomList } from '../types/domain';

interface AdminNotification {
  id: string;
  type: string;
  created_at: string;
  is_read: boolean;
  payload: {
    email?: string;
    username?: string;
  };
}

interface ProfileModalProps {
  user: UserProfile;
  conductor: MovieConductor;
  customLists: CustomList[];
  onClose: () => void;
  onLogout: () => Promise<void>;
  onUpdateUser: (user: UserProfile) => void;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('de-DE');
};

export const ProfileModal = React.memo(({ 
  user, 
  conductor, 
  customLists, 
  onClose, 
  onLogout,
  onUpdateUser 
}: ProfileModalProps) => {
  const authService = useMemo(() => AuthService.getInstance(), []);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-app-bg border border-app-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="p-6 border-b border-app-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-app-text">Profil & Einstellungen</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-app-secondary rounded-full transition-colors text-app-text-muted hover:text-app-text"
          >
            <User className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* User Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-app-text">{user.username || 'Benutzer'}</h3>
                <p className="text-sm text-app-text-muted">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  {user.role}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <ProfileRow icon={<User size={16} />} label="Benutzername" value={user.username || '—'} />
              <ProfileRow icon={<Mail size={16} />} label="E-Mail" value={user.email} />
              <ProfileRow icon={<Calendar size={16} />} label="Registriert seit" value={formatDate(user.createdAt)} />
              <ProfileRow icon={<Calendar size={16} />} label="Letzte Anmeldung" value={formatDate(user.lastLoginAt)} />
            </div>
          </section>

          {/* Statistics Summary or Lists could go here */}
          <section className="pt-4 border-t border-app-border">
            <h4 className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-4">Aktionen</h4>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              <LogOut size={18} />
              Abmelden
            </button>
          </section>
        </div>
      </div>
    </div>
  );
});

function ProfileRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-app-secondary/30 border border-app-border rounded-xl">
      <div className="flex items-center gap-3 text-app-text-muted">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="text-sm text-app-text truncate max-w-[150px]">{value}</strong>
    </div>
  );
}

ProfileModal.displayName = 'ProfileModal';

