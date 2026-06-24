import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, Globe, Check, User, Film } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from './glass';
import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const formVariants = {
  enter: { opacity: 0, y: 10, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const authService = useMemo(() => AuthService.getInstance(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const user = await authService.signIn(identifier, password);
        onLoginSuccess(user);
      } else if (mode === 'signup') {
        const user = await authService.signUp(email, password, username);
        onLoginSuccess(user);
      } else if (mode === 'forgot') {
        await authService.resetPasswordForEmail(identifier);
        setSuccessMsg(t('auth.resetSuccess'));
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-app-text tracking-tight">InFocus</span>
          <span className="block text-[10px] text-app-text-muted tracking-widest uppercase -mt-0.5">
            Family CineLog
          </span>
        </div>
      </motion.div>

      {/* Language Toggle */}
      <GlassButton
        onClick={() => i18n.changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de')}
        pill
        className="fixed bottom-24 right-6 z-20 flex items-center gap-2 px-4 py-2 text-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="font-bold tracking-wide">{i18n.language.split('-')[0].toUpperCase()}</span>
      </GlassButton>

      {/* Auth Card */}
      <GlassCard className="w-full max-w-md p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-app-text">
                {mode === 'signup'
                  ? t('auth.signup')
                  : mode === 'forgot'
                    ? t('auth.forgotPassword')
                    : t('auth.login')}
              </h1>
              <p className="text-sm text-app-text-muted mt-1">
                {mode === 'login' ? t('auth.subtitle') : ''}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-app-text-muted uppercase tracking-wider ml-1">
                    {t('auth.username')}
                  </label>
                  <GlassInput
                    icon={<User className="w-5 h-5" />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    placeholder={t('auth.username')}
                  />
                </div>
              )}

              {mode !== 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-app-text-muted uppercase tracking-wider ml-1">
                    {mode === 'forgot' ? 'E-Mail' : 'E-Mail oder Benutzername'}
                  </label>
                  <GlassInput
                    icon={<Mail className="w-5 h-5" />}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                    placeholder={
                      mode === 'forgot' ? 'name@example.com' : 'name@example.com oder benutzername'
                    }
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-app-text-muted uppercase tracking-wider ml-1">
                    {t('auth.email')}
                  </label>
                  <GlassInput
                    icon={<Mail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-app-text-muted uppercase tracking-wider ml-1">
                    {t('auth.password')}
                  </label>
                  <GlassInput
                    icon={<Lock className="w-5 h-5" />}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-950/60 border border-red-800/50 text-red-200 p-3 rounded-xl flex items-center gap-3 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 p-3 rounded-xl flex items-center gap-3 text-sm"
                  >
                    <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <GlassButton
                type="submit"
                disabled={loading}
                accent
                className="w-full py-3.5 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'signup' ? (
                  t('auth.signup')
                ) : mode === 'forgot' ? (
                  t('auth.sendInstructions')
                ) : (
                  t('auth.login')
                )}
              </GlassButton>
            </form>

            {/* OAuth / Social Login — shown for login AND signup */}
            {mode !== 'forgot' && (
              <div className="mt-4 space-y-2">
                <div className="glass-divider flex items-center gap-3 text-xs text-app-text-muted uppercase tracking-wider">
                  <span className="flex-1" />
                  <span>oder</span>
                  <span className="flex-1" />
                </div>
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      await authService.signInWithGoogle();
                    } catch (e: any) {
                      setError(e?.message || 'Google Login fehlgeschlagen');
                    }
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-xl border border-gray-300 shadow-sm transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Weiter mit Google</span>
                </motion.button>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 mt-6 text-sm text-app-text-muted">
              {mode !== 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="hover:text-app-text transition-colors underline underline-offset-2"
                >
                  {t('auth.hasAccount')} {t('auth.login')}
                </button>
              )}
              {mode !== 'signup' && (
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="hover:text-app-text transition-colors underline underline-offset-2"
                >
                  {t('auth.noAccount')} {t('auth.signup')}
                </button>
              )}
              {mode !== 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="hover:text-app-text transition-colors underline underline-offset-2 text-xs"
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
