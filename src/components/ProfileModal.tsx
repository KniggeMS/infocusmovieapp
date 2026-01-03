import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Settings, Database, LogOut, Upload, Download, Save, RefreshCw, Shield } from 'lucide-react';
import { UserProfile } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { Movie } from '../types/domain';

interface ProfileModalProps {
  user: UserProfile;
  conductor: MovieConductor;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export function ProfileModal({ user, conductor, onClose, onLogout, onUpdateUser }: ProfileModalProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'data'>('profile');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
  
      const handleSaveProfile = async () => {    setLoading(true);
    setMessage(null);
    try {
        await AuthService.getInstance().updateProfile(user.id, { displayName });
        onUpdateUser({ ...user, displayName });
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
       <div className="bg-[#1A1D24] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                {t('profile.title')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Tabs) */}
            <div className="w-1/3 bg-black/20 border-r border-white/5 p-4 space-y-2 hidden sm:block">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <User className="w-4 h-4" />
                    {t('profile.tabProfile')}
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <Settings className="w-4 h-4" />
                    {t('profile.tabSettings')}
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'data' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <Database className="w-4 h-4" />
                    {t('profile.tabData')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                
                {/* Mobile Tabs */}
                <div className="flex sm:hidden gap-2 mb-6 overflow-x-auto pb-2">
                     <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>{t('profile.tabProfile')}</button>
                     <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>{t('profile.tabSettings')}</button>
                     <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === 'data' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>{t('profile.tabData')}</button>
                </div>

                {message && (
                    <div className={`p-3 rounded-xl mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold">
                                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">{user.email}</div>
                                <div className="text-gray-500 text-sm flex items-center gap-1">
                                    {user.role === 'admin' && <Shield className="w-3 h-3 text-red-400" />}
                                    <span className="uppercase tracking-wider">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('profile.displayName')}</label>
                            <input 
                                type="text" 
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('profile.language')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`p-4 rounded-xl border text-center transition-all ${i18n.language === 'en' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                >
                                    🇬🇧 English
                                </button>
                                <button 
                                    onClick={() => i18n.changeLanguage('de')}
                                    className={`p-4 rounded-xl border text-center transition-all ${i18n.language === 'de' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                >
                                    🇩🇪 Deutsch
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('profile.changePassword')}</label>
                            <input 
                                type="password" 
                                placeholder={t('profile.newPassword')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                            />
                            <input 
                                type="password" 
                                placeholder={t('profile.confirmPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleUpdatePassword}
                                disabled={loading || !newPassword}
                                className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 mt-2"
                            >
                                {t('profile.updatePassword')}
                            </button>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <button 
                                onClick={clearCache}
                                className="w-full bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 p-4 rounded-xl flex items-center justify-between transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    {t('profile.clearCache')}
                                </span>
                            </button>
                        </div>
                        
                        <div className="text-center text-xs text-gray-600 mt-8">
                            InFocus v2.7.0
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Download className="w-4 h-4 text-green-400" />
                                {t('profile.export')}
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">{t('profile.exportDesc')}</p>
                            <button 
                                onClick={handleExport}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                                <p className="text-xs text-gray-400 mb-4">{t('profile.importDesc')}</p>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".json"
                                    onChange={handleImport}
                                    disabled={loading}
                                    className="block w-full text-sm text-gray-400
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
          <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
             <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold px-4 py-2">
                <LogOut className="w-4 h-4" />
                {t('common.signout')}
             </button>
          </div>
       </div>
    </div>
  );
}