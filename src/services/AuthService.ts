import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types/auth';
import { AppConfig } from '../core/config/AppConfig';

export class AuthService {
  private client: SupabaseClient;
  private static instance: AuthService;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Fetches the user's role from the 'profiles' table.
   * If no profile exists, defaults to 'user'.
   */
  private async fetchUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await this.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Create a default profile if it doesn't exist (optional, but good for self-healing)
      // For now, just return default 'user' role
      console.warn('Could not fetch user role, defaulting to "user":', error?.message);
      return 'user';
    }

    return data.role as UserRole;
  }

  /**
   * Maps a Supabase User to our internal UserProfile.
   */
  private async mapUser(user: User): Promise<UserProfile> {
    const role = await this.fetchUserRole(user.id);
    return {
      id: user.id,
      email: user.email || '',
      role: role,
      createdAt: user.created_at,
    };
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session }, error } = await this.client.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }

    return this.mapUser(session.user);
  }

  public async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    return this.mapUser(data.user);
  }

  public async signUp(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: AppConfig.getRedirectUrl(),
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    // Note: In a real app, you might trigger a profile creation via Postgres trigger
    // or manually insert into 'profiles' here.
    
    return this.mapUser(data.user);
  }

  public async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
}
