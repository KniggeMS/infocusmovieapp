import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, AlertCircle, Globe } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user;
      if (isLogin) {
        user = await authService.signIn(email, password);
      } else {
        user = await authService.signUp(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-all backdrop-blur-md"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase font-bold tracking-wide">{i18n.language.split('-')[0]}</span>
      </button>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">InFocus</h1>
          <p className="text-gray-400">
            {t('auth.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('auth.email')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              isLogin ? t('auth.login') : t('auth.signup')
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? (
              <>{t('auth.noAccount')} <span className="text-blue-400 font-bold">{t('auth.signup')}</span></>
            ) : (
              <>{t('auth.hasAccount')} <span className="text-blue-400 font-bold">{t('auth.login')}</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}