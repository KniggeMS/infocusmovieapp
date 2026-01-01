import { SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types/auth';
import { AppConfig } from '../core/config/AppConfig';
import { supabase } from '../lib/supabase';

export class AuthService {
  private client: SupabaseClient;
  private static instance: AuthService;

  private constructor() {
    this.client = supabase;
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
    try {
      // Try to get existing profile
      const { data, error } = await this.client
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create default one
        const { data: newData, error: insertError } = await this.client
          .from('profiles')
          .upsert({ id: userId, role: 'user' })
          .select('role')
          .single();
        
        if (insertError) throw insertError;
        return newData.role as UserRole;
      }

      if (error) throw error;
      return data.role as UserRole;
    } catch (e) {
      console.warn('Error fetching/creating user role, defaulting to "user":', e);
      return 'user';
    }
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
