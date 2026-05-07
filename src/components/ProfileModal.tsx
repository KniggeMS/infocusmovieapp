import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Settings, Database, LogOut, Upload, Download, Save, RefreshCw, Shield, Trash2, Palette, Sun, Moon, Layers, List, PlusCircle } from 'lucide-react';
import { UserProfile } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { Movie, CustomList } from '../types/domain';
import { generateAvatarUrl } from '../lib/avatar';

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
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'glass'>(user.theme || 'dark');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newListName, setNewListName] = useState('');

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setLoading(true);
    try {
      await conductor.dispatch({ type: 'CREATE_LIST', payload: { name: newListName.trim() } });
      setNewListName('');
      setMessage({ type: 'success', text: 'Liste erfolgreich erstellt!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Fehler beim Erstellen der Liste.' });
    } finally {
      setLoading(false);
    }
  };

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
    const newUrl = generateAvatarUrl(seed);
    setAvatarUrl(newUrl);
  };

  const handleRemoveAvatar = () => setAvatarUrl('');

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await AuthService.getInstance().updateProfile(user.id, { displayName, avatarUrl });
      onUpdateUser({ ...user, displayName, avatarUrl });
      setMessage({ type: 'success', text: 'Profil aktualisiert!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Profil-Update fehlgeschlagen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => { /* ... unverändert aus Original ... */ };
  const handleExport = () => { /* ... unverändert ... */ };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... unverändert ... */ };
  const clearCache = () => { /* ... unverändert ... */ };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Content */}
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

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-1/3 bg-app-secondary/30 border-r border-app-border p-4 space-y-2 hidden sm:block">
            {/* Tabs-Buttons unverändert ... */}
            <button onClick={() => setActiveTab('lists')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'lists' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}>
              <List className="w-4 h-4" /> My Lists
            </button>
            {/* weitere Tabs ... */}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Mobile Tabs + Message + alle Tabs-Inhalte (profile, settings, appearance, lists, data) unverändert aus dem Original + die verbesserte Lists-Sektion */}

            {activeTab === 'lists' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-app-text font-bold mb-4">Meine Listen</h3>
                
                {/* Create List */}
                <div className="flex gap-2">
                  <input 
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Listenname..."
                    className="flex-1 bg-app-secondary/20 border border-app-border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                  </button>
                </div>

                {/* List of Lists */}
                <div className="space-y-3">
                  {customLists.map(list => (
                    <div key={list.id} className="flex items-center justify-between p-4 bg-app-secondary/10 border border-app-border rounded-xl group hover:bg-app-secondary/20 transition-colors">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          conductor.dispatch({ type: 'SELECT_LIST', payload: list.id });
                          onClose();
                        }}
                      >
                        <div className="font-bold text-app-text">{list.name}</div>
                        <div className="text-xs text-app-text-muted">{list.movieCount} Filme</div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('Liste wirklich löschen?')) {
                            conductor.dispatch({ type: 'DELETE_LIST', payload: list.id });
                          }
                        }}
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

            {/* Die anderen Tabs (profile, settings, appearance, data) bleiben exakt wie im Original */}
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
