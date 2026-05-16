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
   * Fetches the user's profile data from the profiles table.
   * Robust: falls back gracefully if columns don't exist yet.
   */
  private async fetchUserProfile(userId: string): Promise<{
    role: UserRole;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    theme?: 'light' | 'dark' | 'glass';
    lastLoginAt?: string;
  }> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not found — create it
        const { data: newData, error: insertError } = await this.client
          .from('profiles')
          .upsert({ id: userId, role: 'user' })
          .select()
          .single();

        if (insertError) throw insertError;
        return {
          role: (newData.role as UserRole) || 'user',
          displayName: newData.display_name || undefined,
          avatarUrl: newData.avatar_url || undefined,
          theme: newData.theme || 'dark',
          username: newData.username || undefined,
          lastLoginAt: newData.last_login_at || undefined,
        };
      }

      if (error) throw error;
      return {
        role: (data.role as UserRole) || 'user',
        displayName: data.display_name || undefined,
        avatarUrl: data.avatar_url || undefined,
        theme: data.theme || 'dark',
        username: data.username || undefined,
        lastLoginAt: data.last_login_at || undefined,
      };
    } catch (e) {
      console.warn('Error fetching profile, defaulting:', e);
      return { role: 'user', theme: 'dark' };
    }
  }

  /**
   * Maps a Supabase User + profile data to our internal UserProfile.
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
      username: profile.username,
      lastLoginAt: profile.lastLoginAt,
    };
  }

  /**
   * Updates last_login_at timestamp for the user.
   * Silent fail — non-critical.
   */
  private async touchLastLogin(userId: string): Promise<void> {
    try {
      await this.client
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (e) {
      // Column may not exist yet — safe to ignore
      console.warn('Could not update last_login_at:', e);
    }
  }

  public async updateProfile(
    userId: string,
    updates: { displayName?: string; avatarUrl?: string; theme?: 'light' | 'dark' | 'glass'; username?: string }
  ): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.username !== undefined) dbUpdates.username = updates.username;

    const { error } = await this.client
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) throw error;
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  public async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: AppConfig.getRedirectUrl(),
    });
    if (error) throw error;
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    return this.mapUser(session.user);
  }

  /**
   * Sign in with email OR username.
   * If the input looks like an email, use it directly.
   * Otherwise, resolve the username to an email via the DB RPC.
   */
  public async signIn(emailOrUsername: string, password: string): Promise<UserProfile> {
    const isEmail = emailOrUsername.includes('@');
    let resolvedEmail = emailOrUsername;

    if (!isEmail) {
      // Resolve username → email via Supabase RPC
      try {
        const { data, error } = await this.client.rpc('get_email_by_username', {
          p_username: emailOrUsername,
        });
        if (error || !data) {
          throw new Error('Username not found. Please check your input.');
        }
        resolvedEmail = data as string;
      } catch (e: any) {
        // RPC not yet available (migration pending) — friendly error
        if (e.message?.includes('does not exist') || e.code === '42883') {
          throw new Error('Username login not yet configured. Please use your email address.');
        }
        throw e;
      }
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    await this.touchLastLogin(data.user.id);
    return this.mapUser(data.user);
  }

  /**
   * Sign up with email + password + optional username.
   * Username is passed via raw_user_meta_data so the DB trigger can pick it up.
   */
  public async signUp(email: string, password: string, username?: string): Promise<UserProfile> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: AppConfig.getRedirectUrl(),
        data: username ? { username } : {},
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    return this.mapUser(data.user);
  }

  /**
   * Sign in with Google (OAuth).
   */
  public async signInWithGoogle(): Promise<void> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: AppConfig.getRedirectUrl(),
      },
    });
    if (error) throw error;
  }

  /**
   * Sign in with a supported OAuth provider.
   */
  public async signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'apple'): Promise<void> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: AppConfig.getRedirectUrl(),
      },
    });
    if (error) throw error;
  }

  public async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  // ===== Admin / Manager Methods =====

  public async adminGetAllUsers(): Promise<any[]> {
    const { data, error } = await this.client.rpc('admin_get_all_users');
    if (error) throw error;
    return data || [];
  }

  public async adminUpdateUserRole(targetUserId: string, newRole: string): Promise<void> {
    const { error } = await this.client.rpc('admin_update_user_role', {
      target_user_id: targetUserId,
      new_role: newRole,
    });
    if (error) throw error;
  }

  public async adminDeleteUser(targetUserId: string): Promise<void> {
    const { error } = await this.client.rpc('admin_delete_user', {
      target_user_id: targetUserId,
    });
    if (error) throw error;
  }

  public async adminChangePassword(targetUserId: string, newPassword: string): Promise<void> {
    const { error } = await this.client.rpc('admin_change_password', {
      target_user_id: targetUserId,
      new_password: newPassword,
    });
    if (error) throw error;
  }
}
