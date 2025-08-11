import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, CanLoad, Route, UrlSegment } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private sb: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const { data } = await this.sb.getSession();
    return data.session ? true : this.router.parseUrl('/login');
  }

  async canLoad(_r: Route, _s: UrlSegment[]): Promise<boolean | UrlTree> {
    const { data } = await this.sb.getSession();
    return data.session ? true : this.router.parseUrl('/login');
  }
}
