import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private authStateSubject = new BehaviorSubject<{ event: string, session: Session | null }>({ event: 'INITIAL', session: null });

  constructor() {
    this.supabase = createClient(environment.supa_url, environment.supa_key, {
      auth: {
        storage: {
          getItem: async (key: string) => (await Preferences.get({ key })).value ?? null,
          setItem: async (key: string, value: string) => { await Preferences.set({ key, value }); },
          removeItem: async (key: string) => { await Preferences.remove({ key }); }
        },
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    // Initialize auth state
    this.supabase.auth.getSession().then(({ data }) => {
      this.authStateSubject.next({ event: 'INITIAL_SESSION', session: data.session });
    });

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.authStateSubject.next({ event, session });
    });
  }

  // --- OTP flow: identical methods you use on web ---
  sendOtp(phoneE164: string, shouldCreateUser = true) {
    return this.supabase.auth.signInWithOtp({
      phone: phoneE164,
      options: { channel: 'sms', shouldCreateUser }
    });
  }

  verifyOtp(phoneE164: string, token: string) {
    return this.supabase.auth.verifyOtp({ phone: phoneE164, token, type: 'sms' });
  }

  // session helpers (guards, auto-login)
  getSession() {
    return this.supabase.auth.getSession(); // { data: { session }, error }
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): Subscription {
    return this.authStateSubject.subscribe(({ event, session }) => {
      callback(event, session);
    });
  }

}
