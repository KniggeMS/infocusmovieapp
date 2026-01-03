export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  displayName?: string;
  avatarUrl?: string;
  theme?: 'light' | 'dark' | 'glass';
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
