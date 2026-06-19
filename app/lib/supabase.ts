import { createClient } from '@supabase/supabase-js';
import { INITIAL_HACKATHONS, type Hackathon, type UserBookmark } from './mockData';

// Config loaders
const supabaseUrl = typeof window !== 'undefined' 
  ? (window as any).env?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL 
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = typeof window !== 'undefined' 
  ? (window as any).env?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY 
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url');

// Standard Supabase Client (if configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'contribly.auth.token',
      },
    })
  : null;

// --- Mock Database State Management (Server & Client Safe) ---
const STORAGE_KEYS = {
  HACKATHONS: 'contribly.data.hackathons',
  BOOKMARKS: 'contribly.data.bookmarks',
  USER: 'contribly.data.user',
};

// Global in-memory cache for server-side loads
let serverHackathonsCache = [...INITIAL_HACKATHONS];
let serverBookmarksCache: UserBookmark[] = [];
let serverUserCache: { id: string; email: string } | null = null;

function isClient() {
  return typeof window !== 'undefined';
}

export function getMockHackathons(): Hackathon[] {
  if (isClient()) {
    const stored = localStorage.getItem(STORAGE_KEYS.HACKATHONS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore and fallback
      }
    }
    // Seed localStorage if empty
    localStorage.setItem(STORAGE_KEYS.HACKATHONS, JSON.stringify(INITIAL_HACKATHONS));
  }
  return serverHackathonsCache;
}

export function saveMockHackathons(data: Hackathon[]) {
  serverHackathonsCache = data;
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.HACKATHONS, JSON.stringify(data));
  }
}

export function getMockBookmarks(): UserBookmark[] {
  if (isClient()) {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
  }
  return serverBookmarksCache;
}

export function saveMockBookmarks(data: UserBookmark[]) {
  serverBookmarksCache = data;
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data));
  }
}

export function getMockUser(): { id: string; email: string } | null {
  if (isClient()) {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
  }
  return serverUserCache;
}

export function saveMockUser(user: { id: string; email: string } | null) {
  serverUserCache = user;
  if (isClient()) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
}

// --- Unified API Operations ---

export async function fetchHackathons(): Promise<Hackathon[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('starts_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } else {
    // Return mock data, but dynamically compute statuses based on date bounds
    const now = new Date();
    const mockData = getMockHackathons();
    const updated = mockData.map(h => {
      const start = new Date(h.starts_at);
      const end = new Date(h.ends_at);
      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
      if (now > end) {
        status = 'completed';
      } else if (now >= start && now <= end) {
        status = 'ongoing';
      }
      return { ...h, status };
    });
    saveMockHackathons(updated);
    return updated;
  }
}

export async function submitHackathon(h: Omit<Hackathon, 'id' | 'created_at' | 'submitted_by'>): Promise<Hackathon> {
  const user = await getCurrentUser();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('hackathons')
      .insert([{
        ...h,
        submitted_by: user?.id || null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const newHackathon: Hackathon = {
      ...h,
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      submitted_by: user?.id || 'system-scraped',
      created_at: new Date().toISOString()
    };
    const current = getMockHackathons();
    saveMockHackathons([newHackathon, ...current]);
    return newHackathon;
  }
}

export async function deleteHackathon(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('hackathons')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const current = getMockHackathons();
    saveMockHackathons(current.filter(h => h.id !== id));
  }
}

export async function fetchBookmarks(userId: string): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('user_hackathons')
      .select('hackathon_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(d => d.hackathon_id);
  } else {
    const bookmarks = getMockBookmarks();
    return bookmarks
      .filter(b => b.user_id === userId)
      .map(b => b.hackathon_id);
  }
}

export async function toggleBookmark(hackathonId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required to bookmark");

  if (isSupabaseConfigured && supabase) {
    // Check if exists
    const { data, error: selectError } = await supabase
      .from('user_hackathons')
      .select('id')
      .eq('user_id', user.id)
      .eq('hackathon_id', hackathonId)
      .maybeSingle();
    
    if (selectError) throw selectError;

    if (data) {
      // Remove
      const { error: deleteError } = await supabase
        .from('user_hackathons')
        .delete()
        .eq('id', data.id);
      if (deleteError) throw deleteError;
      return false; // Bookmarked: false
    } else {
      // Add
      const { error: insertError } = await supabase
        .from('user_hackathons')
        .insert([{ user_id: user.id, hackathon_id: hackathonId }]);
      if (insertError) throw insertError;
      return true; // Bookmarked: true
    }
  } else {
    const bookmarks = getMockBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.user_id === user.id && b.hackathon_id === hackathonId);
    if (existingIndex > -1) {
      bookmarks.splice(existingIndex, 1);
      saveMockBookmarks(bookmarks);
      return false;
    } else {
      bookmarks.push({
        id: 'b-' + Math.random().toString(36).substring(2, 9),
        user_id: user.id,
        hackathon_id: hackathonId,
        created_at: new Date().toISOString()
      });
      saveMockBookmarks(bookmarks);
      return true;
    }
  }
}

export async function getCurrentUser() {
  if (isSupabaseConfigured && supabase) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } else {
    return getMockUser();
  }
}

export async function authSignIn(email: string, password: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } else {
    // Simple password validation for mock demo: password must be at least 6 chars
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const user = { id: 'u-' + Math.random().toString(36).substring(2, 9), email };
    saveMockUser(user);
    return user;
  }
}

export async function authSignUp(email: string, password: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  } else {
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const user = { id: 'u-' + Math.random().toString(36).substring(2, 9), email };
    saveMockUser(user);
    return user;
  }
}

export async function authSignOut() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    saveMockUser(null);
  }
}

export async function authSignInGoogle(redirectToUrl: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectToUrl
      }
    });
    if (error) throw error;
  } else {
    // Mock sandbox mode: simulate successful sign-in
    const user = { id: 'u-google-' + Math.random().toString(36).substring(2, 9), email: 'google.developer@contribly.com' };
    saveMockUser(user);
    return user;
  }
}

