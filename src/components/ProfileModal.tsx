import { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, Mail, Shield, User } from 'lucide-react';
import { AuthService } from '../services/AuthService';

interface AdminNotification {
  id: string;
  type: 'new_registration';
  created_at: string;
  read_at: string | null;
  payload: {
    email?: string;
    username?: string;
  };
}

interface ProfileData {
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string | null;
  last_login_at: string | null;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('de-DE');
};

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const authService = useMemo(() => AuthService.getInstance(), []);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileResult, notificationsResult] = await Promise.all([
          authService.getProfile(),
          authService.getAdminNotifications(),
        ]);

        if (!active) return;
        setProfile(profileResult);
        setNotifications(notificationsResult || []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Profil konnte nicht geladen werden.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isOpen, authService]);

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <header className="profile-modal-header">
          <h2>Profil & Einstellungen</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>

        {loading && <div className="profile-state">Lade Profil…</div>}
        {error && <div className="profile-state error">{error}</div>}

        {!loading && !error && profile && (
          <div className="profile-content">
            <section className="profile-card">
              <div className="profile-row"><User size={16} /><span>Benutzername</span><strong>{profile.username || '—'}</strong></div>
              <div className="profile-row"><Mail size={16} /><span>E-Mail</span><strong>{profile.email}</strong></div>
              <div className="profile-row"><Shield size={16} /><span>Rolle</span><strong>{profile.role}</strong></div>
              <div className="profile-row"><Calendar size={16} /><span>Registriert seit</span><strong>{formatDate(profile.created_at)}</strong></div>
              <div className="profile-row"><Calendar size={16} /><span>Letzte Anmeldung</span><strong>{formatDate(profile.last_login_at)}</strong></div>
            </section>

            {profile.role === 'admin' && (
              <section className="profile-card">
                <div className="profile-section-title"><Bell size={16} />Neue Registrierungen</div>
                {notifications.length === 0 ? (
                  <div className="profile-state">Keine neuen Meldungen.</div>
                ) : (
                  <ul className="notification-list">
                    {notifications.map(notification => (
                      <li key={notification.id} className="notification-item">
                        <strong>{notification.payload.username || 'Neuer Benutzer'}</strong>
                        <span>{notification.payload.email || '—'}</span>
                        <small>{formatDate(notification.created_at)}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
