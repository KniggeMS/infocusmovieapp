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
    if(!newListName.trim()) return;
    setLoading(true);
    try {
        await conductor.dispatch({ type: 'CREATE_LIST', payload: { name: newListName } });
        setNewListName('');
        setMessage({ type: 'success', text: 'List created!' });
    } catch (e) {
        setMessage({ type: 'error', text: 'Failed to create list.' });
    } finally {
        setLoading(false);
    }
  };

  // Effect to apply theme immediately for preview
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'glass') => {
    setCurrentTheme(theme);
    // Auto-save on selection? Or explicit save?
    // Let's do explicit save for consistency, but preview is instant.
    // Actually, UX is better if we just save it in background:
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

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
        await AuthService.getInstance().updateProfile(user.id, { displayName, avatarUrl });
        onUpdateUser({ ...user, displayName, avatarUrl });
        setMessage({ type: 'success', text: 'Profile updated!' });
    } catch (e) {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setLoading(false);
    }
  };

          const handleUpdatePassword = async () => {
              if (newPassword !== confirmPassword) {
                  setMessage({ type: 'error', text: t('profile.passwordMatchError') });
                  return;
              }
              if (newPassword.length < 6) {
                  setMessage({ type: 'error', text: t('profile.passwordLengthError') });
                  return;
              }
      
              setLoading(true);
              setMessage(null);
              try {
                  await AuthService.getInstance().updatePassword(newPassword);
                  setMessage({ type: 'success', text: t('profile.passwordSuccess') });
                  setNewPassword('');
                  setConfirmPassword('');
              } catch (e: any) {
                  setMessage({ type: 'error', text: e.message || 'Failed to update password.' });
              } finally {
                  setLoading(false);
              }
          };  
      const handleExport = () => {    const data = JSON.stringify(conductor.getState().items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const items = JSON.parse(event.target?.result as string) as Movie[];
            if (!Array.isArray(items)) throw new Error('Invalid format');
            
            setLoading(true);
            let count = 0;
            for (const item of items) {
                // Ensure we don't import duplicates or garbage
                if (item.title) {
                    await conductor.dispatch({ type: 'ADD_MOVIE', payload: item });
                    count++;
                }
            }
            setMessage({ type: 'success', text: `Imported ${count} items successfully.` });
        } catch (err) {
            setMessage({ type: 'error', text: 'Import failed. Invalid JSON.' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

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
            {/* Sidebar (Tabs) */}
            <div className="w-1/3 bg-app-secondary/30 border-r border-app-border p-4 space-y-2 hidden sm:block">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}
                >
                    <User className="w-4 h-4" />
                    {t('profile.tabProfile')}
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}
                >
                    <Settings className="w-4 h-4" />
                    {t('profile.tabSettings')}
                </button>
                <button 
                    onClick={() => setActiveTab('appearance')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'appearance' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}
                >
                    <Palette className="w-4 h-4" />
                    {t('profile.tabAppearance')}
                </button>
                <button 
                    onClick={() => setActiveTab('lists')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'lists' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}
                >
                    <List className="w-4 h-4" />
                    My Lists
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'data' ? 'bg-blue-600/20 text-blue-400' : 'text-app-text-muted hover:bg-app-secondary/50'}`}
                >
                    <Database className="w-4 h-4" />
                    {t('profile.tabData')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                
                {/* Mobile Tabs */}
                <div className="flex sm:hidden gap-2 mb-6 overflow-x-auto pb-2">
                     <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-app-secondary text-app-text-muted'}`}>{t('profile.tabProfile')}</button>
                     <button onClick={() => setActiveTab('appearance')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'appearance' ? 'bg-blue-600 text-white' : 'bg-app-secondary text-app-text-muted'}`}>{t('profile.tabAppearance')}</button>
                     <button onClick={() => setActiveTab('lists')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'lists' ? 'bg-blue-600 text-white' : 'bg-app-secondary text-app-text-muted'}`}>My Lists</button>
                     <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-app-secondary text-app-text-muted'}`}>{t('profile.tabSettings')}</button>
                     <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'data' ? 'bg-blue-600 text-white' : 'bg-app-secondary text-app-text-muted'}`}>{t('profile.tabData')}</button>
                </div>

                {message && (
                    <div className={`p-3 rounded-xl mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold overflow-hidden border-2 border-app-border shadow-lg">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        displayName ? displayName[0].toUpperCase() : user.email[0].toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 flex gap-1">
                                    <button 
                                        onClick={handleGenerateAvatar}
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-lg border border-app-bg transition-all active:scale-90 active:rotate-180"
                                        title={t('profile.generateAvatar')}
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                    </button>
                                    {avatarUrl && (
                                        <button 
                                            onClick={handleRemoveAvatar}
                                            className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg border border-app-bg transition-all active:scale-90"
                                            title={t('profile.removeAvatar')}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-app-text font-bold text-lg">{user.email}</div>
                                <div className="text-app-text-muted text-sm flex items-center gap-1">
                                    {user.role === 'admin' && <Shield className="w-3 h-3 text-red-400" />}
                                    <span className="uppercase tracking-wider">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-muted uppercase">{t('profile.displayName')}</label>
                            <input 
                                type="text" 
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? t('common.loading') : t('profile.save')}
                        </button>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-muted uppercase">{t('profile.language')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`p-4 rounded-xl border text-center transition-all ${i18n.language === 'en' ? 'bg-blue-600/20 border-blue-500 text-app-text' : 'bg-app-secondary/30 border-transparent text-app-text-muted hover:bg-app-secondary/50'}`}
                                >
                                    🇬🇧 English
                                </button>
                                <button 
                                    onClick={() => i18n.changeLanguage('de')}
                                    className={`p-4 rounded-xl border text-center transition-all ${i18n.language === 'de' ? 'bg-blue-600/20 border-blue-500 text-app-text' : 'bg-app-secondary/30 border-transparent text-app-text-muted hover:bg-app-secondary/50'}`}
                                >
                                    🇩🇪 Deutsch
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-app-border">
                            <label className="text-xs font-bold text-app-text-muted uppercase">{t('profile.changePassword')}</label>
                            <input 
                                type="password" 
                                placeholder={t('profile.newPassword')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                            />
                            <input 
                                type="password" 
                                placeholder={t('profile.confirmPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-app-secondary/20 border border-app-border rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleUpdatePassword}
                                disabled={loading || !newPassword}
                                className="w-full bg-app-secondary hover:bg-app-secondary/80 text-app-text px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 mt-2"
                            >
                                {t('profile.updatePassword')}
                            </button>
                        </div>

                        <div className="pt-6 border-t border-app-border">
                            <button 
                                onClick={clearCache}
                                className="w-full bg-app-secondary/20 hover:bg-red-500/10 text-app-text-muted hover:text-red-400 p-4 rounded-xl flex items-center justify-between transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    {t('profile.clearCache')}
                                </span>
                            </button>
                        </div>
                        
                        <div className="text-center text-xs text-app-text-muted/50 mt-8">
                            InFocus v2.8.1
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-app-text font-bold mb-4">{t('profile.theme')}</h3>
                        {/* ... (Theme buttons kept implicitly by not changing them here, but since I replace by context I should be careful) ... */}
                        {/* Wait, the context is huge. I should try to target the END of appearance block or start of Data block */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            {/* DARK */}
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`group relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${currentTheme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-app-border hover:border-blue-500/50'}`}
                            >
                                <div className="absolute inset-0 bg-[#111827]" />
                                <div className="relative z-10 flex flex-col items-center gap-3 py-4">
                                    <div className="p-3 bg-gray-800 rounded-full text-white">
                                        <Moon className="w-6 h-6" />
                                    </div>
                                    <span className="text-gray-200 font-medium">{t('profile.themeDark')}</span>
                                </div>
                                {currentTheme === 'dark' && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                                )}
                            </button>

                            {/* LIGHT */}
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`group relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${currentTheme === 'light' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-app-border hover:border-blue-500/50'}`}
                            >
                                <div className="absolute inset-0 bg-white" />
                                <div className="relative z-10 flex flex-col items-center gap-3 py-4">
                                    <div className="p-3 bg-gray-100 rounded-full text-gray-900">
                                        <Sun className="w-6 h-6" />
                                    </div>
                                    <span className="text-gray-900 font-medium">{t('profile.themeLight')}</span>
                                </div>
                                {currentTheme === 'light' && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                                )}
                            </button>

                            {/* GLASS */}
                            <button
                                onClick={() => handleThemeChange('glass')}
                                className={`group relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${currentTheme === 'glass' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-app-border hover:border-blue-500/50'}`}
                            >
                                {/* Simulated Glass Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40" />
                                <div className="absolute inset-0 backdrop-blur-md bg-white/5" />
                                
                                <div className="relative z-10 flex flex-col items-center gap-3 py-4">
                                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <span className="text-white font-medium shadow-black drop-shadow-md">{t('profile.themeGlass')}</span>
                                </div>
                                {currentTheme === 'glass' && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'lists' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-app-text font-bold mb-4">My Lists</h3>
                        
                        {/* Create List */}
                        <div className="flex gap-2">
                            <input 
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="New List Name..."
                                className="flex-1 bg-app-secondary/20 border border-app-border rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleCreateList}
                                disabled={!newListName.trim() || loading}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center"
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
                                        <div className="text-xs text-app-text-muted">{list.movieCount} movies</div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(confirm('Delete this list?')) {
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
                                    No lists created yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        <div className="bg-app-secondary/20 rounded-2xl p-4 border border-app-border">
                            <h3 className="text-app-text font-bold mb-2 flex items-center gap-2">
                                <Download className="w-4 h-4 text-green-400" />
                                {t('profile.export')}
                            </h3>
                            <p className="text-xs text-app-text-muted mb-4">{t('profile.exportDesc')}</p>
                            <button 
                                onClick={handleExport}
                                className="bg-app-secondary hover:bg-app-secondary/80 text-app-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Download JSON
                            </button>
                        </div>

                        {user.role === 'admin' && (
                            <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                                <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    {t('profile.import')}
                                </h3>
                                <p className="text-xs text-app-text-muted mb-4">{t('profile.importDesc')}</p>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".json"
                                    onChange={handleImport}
                                    disabled={loading}
                                    className="block w-full text-sm text-app-text-muted
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-600 file:text-white
                                        hover:file:bg-blue-500
                                        cursor-pointer"
                                />
                            </div>
                        )}
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