import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, AlertCircle, Globe, Check, User } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { UserProfile } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

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
        const user = await authService.signUp({ email, password, username });
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
    <div className="login-screen">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-header">
          <Globe size={18} />
          <h1>{mode === 'signup' ? t('auth.signup') : mode === 'forgot' ? t('auth.forgotPassword') : t('auth.login')}</h1>
        </div>

        {mode === 'signup' && (
          <label>
            <span>{t('auth.username')}</span>
            <div className="input-with-icon">
              <User size={18} />
              <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
            </div>
          </label>
        )}

        {mode !== 'signup' && (
          <label>
            <span>{mode === 'forgot' ? t('auth.email') : t('auth.emailOrUsername')}</span>
            <div className="input-with-icon">
              <Mail size={18} />
              <input value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" required />
            </div>
          </label>
        )}

        {mode === 'signup' && (
          <label>
            <span>{t('auth.email')}</span>
            <div className="input-with-icon">
              <Mail size={18} />
              <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </label>
        )}

        {mode !== 'forgot' && (
          <label>
            <span>{t('auth.password')}</span>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
            </div>
          </label>
        )}

        {error && <div className="auth-message error"><AlertCircle size={16} />{error}</div>}
        {successMsg && <div className="auth-message success"><Check size={16} />{successMsg}</div>}

        <button type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : null}
          {mode === 'signup' ? t('auth.createAccount') : mode === 'forgot' ? t('auth.sendResetLink') : t('auth.login')}
        </button>

        <div className="login-switches">
          {mode !== 'login' && <button type="button" onClick={() => setMode('login')}>{t('auth.switchToLogin')}</button>}
          {mode !== 'signup' && <button type="button" onClick={() => setMode('signup')}>{t('auth.switchToSignup')}</button>}
          {mode !== 'forgot' && <button type="button" onClick={() => setMode('forgot')}>{t('auth.forgotPassword')}</button>}
        </div>
      </form>
    </div>
  );
}
