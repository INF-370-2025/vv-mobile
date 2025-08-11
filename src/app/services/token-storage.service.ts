import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const ACCESS_TOKEN_KEY = 'vv_access_token';
const REFRESH_TOKEN_KEY = 'vv_refresh_token';
const USER_KEY = 'vv_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  async setTokens(accessToken: string, refreshToken?: string) {
    await Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken });
    if (refreshToken !== undefined) {
      await Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken });
    }
  }

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: ACCESS_TOKEN_KEY });
    return value ?? null;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    return value ?? null;
  }

  async clearTokens() {
    await Preferences.remove({ key: ACCESS_TOKEN_KEY });
    await Preferences.remove({ key: REFRESH_TOKEN_KEY });
  }

  // Optional user snapshot (roles, name, etc.)
  async setUser(user: any) {
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  }

  async getUser<T = any>(): Promise<T | null> {
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) as T : null;
  }

  async clearUser() {
    await Preferences.remove({ key: USER_KEY });
  }

  async clearAll() {
    await this.clearTokens();
    await this.clearUser();
  }
}
