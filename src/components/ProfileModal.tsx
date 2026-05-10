import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, User, Settings, Database, LogOut, Download, Save, RefreshCw,
  Shield, Trash2, Palette, Sun, Moon, Layers, List, PlusCircle, AtSign, Clock
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { Movie, CustomList } from '../types/domain';
import { generateAvatarUrl } from '../lib/avatar';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
};

const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-300 border border-red-500/30',
  manager: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  user: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface ProfileModalProps {
  user: UserProfile;
  conductor: MovieConductor;
  customLists: CustomList[];
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export function ProfileModal({ user, conductor, customLists, onClose, onLogout, onUpdateUser }: ProfileModalProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'data' | 'appearance' | 'lists'>('profile');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'glass'>(user.theme || 'dark');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'glass') => {
    setCurrentTheme(theme);
    try {
      await AuthService.getInstance().updateProfile(user.id, { theme });
      onUpdateUser({ ...user, theme });
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const handleGenerateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(generateAvatarUrl(seed));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updates: Parameters<typeof AuthService.prototype.updateProfile>[1] = {
        displayName,
        avatarUrl,
      };
      if (username.trim()) updates.username = username.trim();
      await AuthService.getInstance().updateProfile(user.id, updates);
      onUpdateUser({ ...user, displayName, avatarUrl, username: username.trim() || user.username });
      setMessage({ type: 'success', text: 'Profil aktualisiert!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Profil-Update fehlgeschlagen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await AuthService.getInstance().updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Passwort geändert!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Fehler beim Ändern.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setLoading(true);
    try {
      await conductor.dispatch({ type: 'CREATE_LIST', payload: { name: newListName.trim() } });
      setNewListName('');
      setMessage({ type: 'success', text: 'Liste erstellt!' });
    } catch {
      setMessage({ type: 'error', text: 'Fehler beim Erstellen der Liste.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const state = conductor.getState();
      const blob = new Blob([JSON.stringify(state.items, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'infocus-export.json';
      a.click();
    } catch (e) {
      setMessage({ type: 'error', text: 'Export fehlgeschlagen.' });
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t('profile.profile'), icon: <User className="w-4 h-4" /> },
    { id: 'settings' as const, label: t('profile.settings'), icon: <Settings className="w-4 h-4" /> },
    { id: 'appearance' as const, label: 'Design', icon: <Palette className="w-4 h-4" /> },
    { id: 'lists' as const, label: 'Listen', icon: <List className="w-4 h-4" /> },
    { id: 'data' as const, label: 'Daten', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-app-bg w-full max-w-2xl rounded-3xl border border-app-border shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-app-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            {t('profile.title')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-app-secondary rounded-full text-app-text-muted hover:text-app-text transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 bg-app-secondary/30 border-r border-app-border p-4 space-y-2 hidden sm:block">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tab Row */}
          <div className="sm:hidden flex overflow-x-auto gap-1 p-2 border-b border-app-border w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Message Banner */}
            {message && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-900/40 text-green-300 border border-green-500/30'
                  : 'bg-red-900/40 text-red-300 border border-red-500/30'
              }`}>
                {message.text}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-app-secondary border border-app-border flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-app-text-muted" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGenerateAvatar} className="text-xs text-blue-400 hover:text-blue-300 font-bold border border-blue-500/30 px-3 py-1.5 rounded-lg transition">
                      Generieren
                    </button>
                    {avatarUrl && (
                      <button onClick={() => setAvatarUrl('')} className="text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/30 px-3 py-1.5 rounded-lg transition">
                        Entfernen
                      </button>
                    )}
                  </div>
                </div>

                {/* Read-only info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-app-secondary/20 rounded-xl border border-app-border">
                    <span className="text-xs text-app-text-muted uppercase tracking-wider">E-Mail</span>
                    <span className="text-sm text-app-text font-medium">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-app-secondary/20 rounded-xl border border-app-border">
                    <span className="text-xs text-app-text-muted uppercase tracking-wider">Rolle</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLOR[user.role] || ROLE_COLOR.user}`}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-app-secondary/20 rounded-xl border border-app-border">
                    <span className="text-xs text-app-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Registriert
                    </span>
                    <span className="text-sm text-app-text">{formatDate(user.createdAt)}</span>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center justify-between p-3 bg-app-secondary/20 rounded-xl border border-app-border">
                      <span className="text-xs text-app-text-muted uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Letzter Login
                      </span>
                      <span className="text-sm text-app-text">{formatDate(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                {/* Editable fields */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Anzeigename</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-app-text focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Dein Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider flex items-center gap-1">
                      <AtSign className="w-3 h-3" /> Username
                    </label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-app-text focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="dein_username"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </button>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-app-text font-bold">Passwort ändern</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-app-text focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Neues Passwort"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-app-text focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Passwort bestätigen"
                  />
                  <button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Passwort ändern
                  </button>
                </div>
              </div>
            )}

            {/* ── APPEARANCE TAB ── */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-app-text font-bold">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['dark', 'light', 'glass'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-4 rounded-xl border text-sm font-bold transition flex flex-col items-center gap-2 ${
                        currentTheme === theme
                          ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                          : 'border-app-border text-app-text-muted hover:bg-app-secondary/30'
                      }`}
                    >
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                      {theme === 'dark' ? 'Dunkel' : theme === 'light' ? 'Hell' : 'Glas'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── LISTS TAB ── */}
            {activeTab === 'lists' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-app-text font-bold">Meine Listen</h3>
                <div className="flex gap-2">
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Listenname..."
                    className="flex-1 bg-app-secondary/20 border border-app-border rounded-xl p-3 text-app-text focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl font-bold disabled:opacity-50 transition flex items-center justify-center"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                  </button>
                </div>
                <div className="space-y-3">
                  {customLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between p-4 bg-app-secondary/10 border border-app-border rounded-xl group hover:bg-app-secondary/20 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => { conductor.dispatch({ type: 'SELECT_LIST', payload: list.id }); onClose(); }}
                      >
                        <div className="font-bold text-app-text">{list.name}</div>
                        <div className="text-xs text-app-text-muted">{list.movieCount} Filme</div>
                      </div>
                      <button
                        onClick={() => { if (confirm('Liste löschen?')) conductor.dispatch({ type: 'DELETE_LIST', payload: list.id }); }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {customLists.length === 0 && (
                    <div className="text-center text-app-text-muted py-8 border-2 border-dashed border-app-border rounded-xl">
                      Noch keine Listen vorhanden.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DATA TAB ── */}
            {activeTab === 'data' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-app-text font-bold">Daten exportieren</h3>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-app-secondary/30 hover:bg-app-secondary/50 border border-app-border text-app-text font-bold px-6 py-3 rounded-xl transition"
                >
                  <Download className="w-4 h-4" />
                  Als JSON exportieren
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-app-border bg-app-secondary/30 flex justify-between items-center">
          <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold px-4 py-2">
            <LogOut className="w-4 h-4" />
            {t('common.signout')}
          </button>
        </div>
      </div>
    </div>
  );
}
