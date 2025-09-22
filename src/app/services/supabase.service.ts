import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

type AuthState = { event: AuthChangeEvent | 'INITIAL' | 'INITIAL_SESSION'; session: Session | null };

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private authStateSubject = new BehaviorSubject<AuthState>({ event: 'INITIAL', session: null });
  public readonly authState$: Observable<AuthState> = this.authStateSubject.asObservable();

  /** Expose client for Storage/DB usage */
  public get client(): SupabaseClient { return this.supabase; }

  constructor() {
    this.supabase = createClient(environment.supa_url, environment.supa_key, {
      // Keep default schema typing ("public")
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

    // Seed initial session
    this.supabase.auth.getSession().then(({ data }) => {
      this.authStateSubject.next({ event: 'INITIAL_SESSION', session: data.session });
    });

    // Forward auth events
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.authStateSubject.next({ event, session });
    });
  }

  // OTP (SMS)
  sendOtp(phoneE164: string, shouldCreateUser = true) {
    return this.supabase.auth.signInWithOtp({
      phone: phoneE164,
      options: { channel: 'sms', shouldCreateUser }
    });
  }

  verifyOtp(phoneE164: string, token: string) {
    return this.supabase.auth.verifyOtp({ phone: phoneE164, token, type: 'sms' });
  }



  async uploadFileToStorage(file: File, bucket: string): Promise<string> {
    if (!file) throw new Error("Invalid file");

    const extension = file.name.split(".").pop() ?? "png";
    const fileName = `${new Date().getTime()}.${extension}`;

    const { error: uploadError } = await this.supabase
      .storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false, // prevent overwriting old files
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      throw uploadError;
    }

    // Get the public URL
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async update_profile_pic(user_id: number, url: string | null) {
    try {
      const { data, error } = await this.supabase
        .schema(environment.schema)
        .from('user')
        .update({ image: url })
        .eq('user_id', user_id);

      if (error) {
        console.error(error);
        return null;
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }





  // Session helpers
  getSession() {
    return this.supabase.auth.getSession(); // { data: { session }, error }
  }

  async getCurrentUserUuid(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  }

  // Add this method to get full user info
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getSession();
    return data?.session?.user ?? null;
  }

  // Add this method to get user with metadata
  async getCurrentUserWithMetadata(): Promise<{ user: User | null; metadata: any }> {
    const { data } = await this.supabase.auth.getSession();
    return {
      user: data?.session?.user ?? null,
      metadata: data?.session?.user?.user_metadata ?? null
    };
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): Subscription {
    return this.authState$.subscribe(({ event, session }) => callback(event, session));
  }

  // Add this method for better error handling
  async safeGetCurrentUserUuid(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return data?.session?.user?.id ?? null;
    } catch (error) {
      console.error('Exception getting user UUID:', error);
      return null;
    }
  }
}
