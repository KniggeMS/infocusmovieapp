export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
