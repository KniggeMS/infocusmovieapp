import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Mail, Shield, User, LogOut, X, Check, Monitor, Film, Eye, Heart, Star, Users, Key, Trash2 } from 'lucide-react';

import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { CustomList } from '../types/domain';
import { AdminPanel } from './AdminPanel';
import { GlassCard, GlassButton, GlassSection, GlassDivider } from './glass';
import { UIStyleSwitcher } from './UIStyleSwitcher';

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

const themes = [
  { id: 'noir', name: 'Noir', class: 'bg-[#050505] border-white/20', preview: 'from-gray-900 to-black', textClass: 'text-white' },
  { id: 'glass', name: 'Glass', class: 'bg-[#0f172a] border-blue-400/30', preview: 'from-slate-800 to-slate-900', textClass: 'text-blue-300' },
  { id: 'neon', name: 'Neon', class: 'bg-[#0d0221] border-purple-500/50', preview: 'from-purple-900 to-[#0d0221]', textClass: 'text-purple-300' },
  { id: 'light', name: 'Light', class: 'bg-white border-gray-300', preview: 'from-gray-100 to-white', textClass: 'text-gray-900' },
];

export const ProfileModal = React.memo(({ 
  user, 
  conductor, 
  customLists, 
  onClose, 
  onLogout,
  onUpdateUser 
}: ProfileModalProps) => {
  const authService = useMemo(() => AuthService.getInstance(), []);
  const [themeLoading, setThemeLoading] = useState(false);
  const [followSystem, setFollowSystem] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const state = conductor.getState();

  const handleSaveUsername = useCallback(async () => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed === user.username) {
      setEditingUsername(false);
      return;
    }
    setSavingUsername(true);
    try {
      await authService.updateProfile(user.id, { username: trimmed });
      onUpdateUser({ ...user, username: trimmed });
      setEditingUsername(false);
    } catch (e) {
      console.error('Failed to save username:', e);
    } finally {
      setSavingUsername(false);
    }
  }, [newUsername, user, authService, onUpdateUser]);

  const handleThemeChange = useCallback(async (newTheme: string) => {
    setThemeLoading(true);
    try {
      document.documentElement.setAttribute('data-theme', newTheme);
      await authService.updateProfile(user.id, { theme: newTheme as any });
      onUpdateUser({ ...user, theme: newTheme as any });
    } catch (err) {
      console.error('Failed to update theme:', err);
    } finally {
      setThemeLoading(false);
    }
  }, [user, authService, onUpdateUser]);

  const handleSystemTheme = useCallback(async () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'noir' : 'light';
    setFollowSystem(!followSystem);
    if (!followSystem) {
      document.documentElement.setAttribute('data-theme', systemTheme);
      await authService.updateProfile(user.id, { theme: systemTheme as any });
      onUpdateUser({ ...user, theme: systemTheme as any });
    }
  }, [followSystem, user, authService, onUpdateUser]);

  // Compute stats
  const stats = useMemo(() => {
    const items = state.items;
    return {
      total: items.length,
      watched: items.filter(m => m.watched).length,
      favorites: items.filter(m => m.favorite).length,
      rated: items.filter(m => typeof m.userRating === 'number' && m.userRating > 0).length,
      lists: customLists.length,
    };
  }, [state.items, customLists]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
        className="relative w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl glass-sheet max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="w-6" />
          <h2 className="text-lg font-bold text-app-text">Profil & Einstellungen</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full glass-button hover:brightness-125 transition-all"
          >
            <X className="w-4 h-4 text-app-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 scrollbar-hide">
          {/* Theme Selector */}
          <GlassSection title="Erscheinungsbild" icon={<Monitor className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  disabled={themeLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 overflow-hidden ${t.class} ${
                    (user.theme || 'noir') === t.id ? 'ring-2 ring-accent-color ring-offset-2 ring-offset-app-bg' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${t.preview} opacity-50`} />
                  <span className={`relative z-10 text-[10px] font-bold ${t.textClass}`}>{t.name}</span>
                  {(user.theme || 'noir') === t.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-accent-color rounded-full p-0.5 z-10"
                    >
                      <Check size={8} className="text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            <GlassButton onClick={handleSystemTheme} className="mt-3 w-full flex items-center justify-center gap-2">
              <Monitor className="w-4 h-4" />
              <span>System-Design folgen</span>
              <div className={`ml-auto w-9 h-5 rounded-full transition-colors ${followSystem ? 'bg-accent-color' : 'bg-app-secondary'}`}>
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow"
                  animate={{ x: followSystem ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </GlassButton>

            <GlassDivider />
            <UIStyleSwitcher />
          </GlassSection>

          <GlassDivider />

          {/* User Info */}
          <GlassSection title="Benutzer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shrink-0">
                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-app-text truncate">{user.username || 'Benutzer'}</h3>
                <p className="text-sm text-app-text-muted truncate">{user.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span className="text-[10px] text-app-text-muted">
                    {user.role === 'admin' ? 'Voller Zugriff' : user.role === 'manager' ? 'Benutzerverwaltung' : 'Filme verwalten'}
                  </span>
                </div>
              </div>
            </div>

            <GlassCard className="p-0 divide-y divide-glass-border">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 text-app-text-muted">
                  <User size={14} />
                  <span className="text-sm font-medium">Benutzername</span>
                </div>
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveUsername(); if (e.key === 'Escape') { setEditingUsername(false); setNewUsername(user.username || ''); } }}
                      className="text-sm glass-input rounded-lg px-2 py-1 w-28"
                      autoFocus
                      placeholder="username"
                    />
                    <button onClick={handleSaveUsername} disabled={savingUsername} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">
                      {savingUsername ? '…' : 'OK'}
                    </button>
                    <button onClick={() => { setEditingUsername(false); setNewUsername(user.username || ''); }} className="text-xs text-app-text-muted hover:text-app-text">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingUsername(true)} className="group flex items-center gap-2">
                    <strong className="text-sm text-app-text truncate max-w-[150px]">{user.username || '—'}</strong>
                    <span className="text-[10px] text-app-text-muted group-hover:text-blue-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
                  </button>
                )}
              </div>
              <ProfileRow icon={<Mail size={14} />} label="E-Mail" value={user.email} />
              <ProfileRow icon={<Calendar size={14} />} label="Registriert" value={formatDate(user.createdAt)} />
              <ProfileRow icon={<Calendar size={14} />} label="Letzte Anmeldung" value={formatDate(user.lastLoginAt)} />
            </GlassCard>
          </GlassSection>

          <GlassDivider />

          {/* Quick Stats */}
          <GlassSection title="Meine Mediathek" icon={<Film className="w-3.5 h-3.5" />}>
            <GlassCard className="p-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { icon: Film, label: 'Filme', value: stats.total },
                  { icon: Eye, label: 'Gesehen', value: stats.watched },
                  { icon: Heart, label: 'Favoriten', value: stats.favorites },
                  { icon: Star, label: 'Bewertet', value: stats.rated },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-2">
                    <Icon className="w-4 h-4 mx-auto text-app-text-muted mb-1" />
                    <div className="text-lg font-bold text-app-text">{value}</div>
                    <div className="text-[9px] text-app-text-muted uppercase tracking-wider truncate">{label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </GlassSection>

          {/* Admin Panel */}
          {(user.role === 'admin' || user.role === 'manager') && (
            <>
              <GlassDivider />
              <GlassSection title="Administration" icon={<Shield className="w-3.5 h-3.5" />}>
                <GlassButton onClick={() => setShowAdminPanel(!showAdminPanel)} className="w-full flex items-center justify-between p-3">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-app-text-muted" />
                    Benutzerverwaltung
                  </span>
                  <span className="text-app-text-muted text-xs">{showAdminPanel ? '▲' : '▼'}</span>
                </GlassButton>
              </GlassSection>
              {showAdminPanel && <AdminPanel />}
            </>
          )}

          <GlassDivider />

          {/* Logout */}
          <GlassButton
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
          >
            <LogOut size={18} />
            Abmelden
          </GlassButton>
        </div>
      </motion.div>
    </motion.div>
  );
});

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    user: 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  const icons: Record<string, React.ReactNode> = {
    admin: <Shield className="w-3 h-3" />,
    manager: <Shield className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[role] || 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
      {icons[role]} {role}
    </span>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3 text-app-text-muted">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="text-sm text-app-text truncate max-w-[150px]">{value}</strong>
    </div>
  );
}

ProfileModal.displayName = 'ProfileModal';

