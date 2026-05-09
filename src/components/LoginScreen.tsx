import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User, Lock, Loader2, AlertCircle, Globe, Check } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const user = await authService.signIn(emailOrUsername, password);
        onLoginSuccess(user);
      } else if (mode === 'signup') {
        if (!username.trim()) {
          setError('Bitte gib einen Benutzernamen ein.');
          setLoading(false);
          return;
        }
        const user = await authService.signUp(email, password, username.trim());
        onLoginSuccess(user);
      } else if (mode === 'forgot') {
        await authService.resetPasswordForEmail(emailOrUsername.includes('@') ? emailOrUsername : email);
        setSuccessMsg(t('auth.resetSuccess'));
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'signup' | 'forgot') => {
    setMode(next);
    setError(null);
    setSuccessMsg(null);
    setEmailOrUsername('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-app-secondary hover:bg-app-secondary/80 border border-app-border rounded-full px-3 py-1.5 text-sm text-app-text-muted hover:text-app-text transition-all backdrop-blur-md"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase font-bold tracking-wide">{i18n.language.split('-')[0]}</span>
      </button>

      <div className="w-full max-w-md bg-app-card-bg/50 backdrop-blur-xl border border-app-border rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-app-text mb-2 tracking-tight">InFocus</h1>
          <p className="text-app-text-muted">
            {mode === 'forgot' ? t('auth.resetPasswordTitle') : t('auth.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-900/50 border border-green-500/50 text-green-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <Check className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login: email or username */}
          {mode === 'login' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider ml-1">
                E-Mail oder Username
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-app-text-muted group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="auth-input w-full bg-app-bg/40 border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-app-text-muted"
                  placeholder="name@example.com oder @username"
                />
              </div>
            </div>
          )}

          {/* Forgot: email only */}
          {mode === 'forgot' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider ml-1">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-app-text-muted group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="auth-input w-full bg-app-bg/40 border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-app-text-muted"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          )}

          {/* Signup: separate username + email */}
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider ml-1">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-app-text-muted group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="auth-input w-full bg-app-bg/40 border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-app-text-muted"
                    placeholder="dein_username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider ml-1">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-app-text-muted group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input w-full bg-app-bg/40 border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-app-text-muted"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password (login + signup) */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-app-text-muted uppercase tracking-wider ml-1">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-app-text-muted group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input w-full bg-app-bg/40 border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-app-text-muted"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

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
            ) : mode === 'login' ? (
              t('auth.login')
            ) : mode === 'signup' ? (
              t('auth.signup')
            ) : (
              t('auth.sendInstructions')
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          {mode === 'login' ? (
            <button
              onClick={() => switchMode('signup')}
              className="text-sm text-app-text-muted hover:text-app-text transition-colors"
            >
              {t('auth.noAccount')}{' '}
              <span className="text-blue-400 font-bold">{t('auth.signup')}</span>
            </button>
          ) : (
            <button
              onClick={() => switchMode('login')}
              className="text-sm text-app-text-muted hover:text-app-text transition-colors"
            >
              {t('common.back')} to{' '}
              <span className="text-blue-400 font-bold">{t('auth.login')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
