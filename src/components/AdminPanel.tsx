import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthService } from '../services/AuthService';
import { Shield, Trash2, Key, ChevronDown, RefreshCw } from 'lucide-react';

type Role = 'admin' | 'manager' | 'user';

interface UserRow {
  id: string;
  email: string;
  role: Role;
  username: string | null;
  display_name: string | null;
  created_at: string | null;
  last_login_at: string | null;
}

const ROLE_OPTIONS: Role[] = ['admin', 'manager', 'user'];

export function AdminPanel() {
  const authService = AuthService.getInstance();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ id: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<UserRow | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.adminGetAllUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  }, [authService]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await authService.adminUpdateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as Role } : u));
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Ändern der Rolle');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await authService.adminDeleteUser(deleteConfirm.id);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setSuccessMsg('Benutzer gelöscht');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Löschen');
      setDeleteConfirm(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordModal || !newPassword || newPassword.length < 6) return;
    try {
      await authService.adminChangePassword(passwordModal.id, newPassword);
      setPasswordModal(null);
      setNewPassword('');
      setSuccessMsg('Passwort geändert!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError('Fehler: ' + (e?.message || 'Unbekannter Fehler'));
    }
  };

  const formatDate = (v: string | null) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('de-DE');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" /> Benutzerverwaltung
        </h2>
        <button onClick={loadUsers} disabled={loading} className="p-2 text-app-text-muted hover:text-app-text transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800/50 text-red-200 p-3 rounded-xl text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Schließen</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 p-3 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-app-text-muted">Lade Benutzer...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-app-text-muted">Keine Benutzer gefunden.</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-app-card-bg border border-app-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-app-text truncate">{u.username || (u.email ? u.email.split('@')[0] : 'User ' + u.id.slice(0, 8))}</span>
                  <RoleBadge role={u.role} />
                </div>
                <div className="text-xs text-app-text-muted truncate">{u.email}</div>
                <div className="text-[10px] text-app-text-muted mt-0.5">
                  Registriert: {formatDate(u.created_at)} · Letzter Login: {formatDate(u.last_login_at)}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative group">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="appearance-none bg-app-secondary border border-app-border rounded-lg px-3 py-1.5 text-sm text-app-text cursor-pointer pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-muted pointer-events-none" />
                </div>

                <button
                  onClick={() => setPasswordModal({ id: u.id, email: u.email })}
                  className="p-2 rounded-lg bg-app-secondary/50 border border-app-border text-app-text-muted hover:text-yellow-400 transition-colors"
                  title="Passwort ändern"
                >
                  <Key className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirm(u)}
                  className="p-2 rounded-lg bg-app-secondary/50 border border-app-border text-app-text-muted hover:text-red-400 transition-colors"
                  title="Benutzer löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPasswordModal(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="relative bg-app-bg border border-app-border rounded-3xl p-6 w-full max-w-sm shadow-2xl z-10"
          >
            <h3 className="text-lg font-bold text-app-text mb-1">Passwort ändern</h3>
            <p className="text-sm text-app-text-muted mb-4">{passwordModal.email}</p>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              minLength={6}
              className="auth-input-field mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setPasswordModal(null)} className="flex-1 py-2.5 rounded-xl bg-app-secondary border border-app-border text-app-text font-medium transition-colors">
                Abbrechen
              </button>
              <button onClick={handlePasswordChange} disabled={newPassword.length < 6} className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors disabled:opacity-50">
                Speichern
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-app-bg border border-app-border rounded-3xl p-6 w-full max-w-sm shadow-2xl z-10"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-app-text">Benutzer löschen?</h3>
              <p className="text-sm text-app-text-muted mt-2">
                <strong className="text-app-text">{deleteConfirm.username || 'User ' + deleteConfirm.id.slice(0, 8)}</strong>
                <br />
                ({deleteConfirm.email || 'Keine E-Mail'})
              </p>
              <p className="text-xs text-red-400 mt-3">Alle Daten des Benutzers werden unwiderruflich gelöscht.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-app-secondary border border-app-border text-app-text font-medium transition-colors hover:bg-app-secondary/80">
                Abbrechen
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-colors">
                Löschen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const styles = {
    admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    user: 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles[role]}`}>
      {role}
    </span>
  );
}