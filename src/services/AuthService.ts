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
   * Fetches the user's profile data.
   */
  private async fetchUserProfile(userId: string): Promise<{ role: UserRole, displayName?: string, avatarUrl?: string, theme?: 'light' | 'dark' | 'glass' }> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await this.client
          .from('profiles')
          .upsert({ id: userId, role: 'user' })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return { 
            role: newData.role as UserRole,
            displayName: newData.display_name || undefined,
            avatarUrl: newData.avatar_url || undefined,
            theme: newData.theme || 'dark'
        };
      }

      if (error) throw error;
      return { 
          role: data.role as UserRole,
          displayName: data.display_name || undefined,
          avatarUrl: data.avatar_url || undefined,
          theme: data.theme || 'dark'
      };
    } catch (e) {
      console.warn('Error fetching profile, defaulting:', e);
      return { role: 'user', theme: 'dark' };
    }
  }

  /**
   * Maps a Supabase User to our internal UserProfile.
   */
  private async mapUser(user: User): Promise<UserProfile> {
    const profile = await this.fetchUserProfile(user.id);
    return {
      id: user.id,
      email: user.email || '',
      role: profile.role,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
      createdAt: user.created_at,
    };
  }

  public async updateProfile(userId: string, updates: { displayName?: string, avatarUrl?: string, theme?: 'light' | 'dark' | 'glass' }): Promise<void> {
    const { error } = await this.client
        .from('profiles')
        .update({
            display_name: updates.displayName,
            avatar_url: updates.avatarUrl,
            theme: updates.theme
        })
        .eq('id', userId);
    
    if (error) throw error;
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }

  public async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: AppConfig.getRedirectUrl()
    });
    if (error) throw error;
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
