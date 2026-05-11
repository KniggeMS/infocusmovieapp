import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from './AuthService';
import { supabase } from '../lib/supabase';

// Mock the supabase client instance directly
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    }
  }
}));

describe('AuthService - Theme Management', () => {
  let service: AuthService;

  beforeEach(() => {
    // Reset singleton if possible, or just get instance (it's stateless regarding client)
    service = AuthService.getInstance();
    vi.clearAllMocks();
  });

  it('should fetch user profile including theme', async () => {
    // Setup Mock for SELECT
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { role: 'user', display_name: 'TestUser', theme: 'glass' },
          error: null
        })
      })
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect
    });

    // We access private method via casting or testing public flow
    // Since fetchUserProfile is private, we test mapUser which calls it,
    // or we assume it works if we use `getCurrentUser`?
    // Let's test `mapUser` via `getCurrentUser` mock
    
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { 
        session: { 
          user: { id: '123', email: 'test@example.com', created_at: '2023-01-01' } 
        } 
      },
      error: null
    });

    const user = await service.getCurrentUser();

    expect(user).not.toBeNull();
    expect(user?.theme).toBe('glass');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('should default to dark theme if missing', async () => {
    // Setup Mock for SELECT (no theme in DB)
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { role: 'user', theme: null }, 
          error: null
        })
      })
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect
    });

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { 
        session: { 
          user: { id: '123', email: 'test@example.com', created_at: '2023-01-01' } 
        } 
      },
      error: null
    });

    const user = await service.getCurrentUser();
    expect(user?.theme).toBe('dark');
  });

  it('should update profile with theme', async () => {
    // Setup Mock for UPDATE
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as any).mockReturnValue({
      update: mockUpdate
    });

    await service.updateProfile('123', { theme: 'light' });

    expect(mockUpdate).toHaveBeenCalledWith({
      display_name: undefined,
      avatar_url: undefined,
      theme: 'light'
    });
  });
});
