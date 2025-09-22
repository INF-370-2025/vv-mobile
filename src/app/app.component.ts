import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { MenuController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';

type AppPage = { title: string; url: string; icon: string };

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false,
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private authStateSubscription: Subscription = new Subscription();

  // 👉 Side menu items (add Profile here)
  public readonly appPages: AppPage[] = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Time Logs', url: '/time-logs', icon: 'time' },
    { title: 'Profile',   url: '/profile',   icon: 'person-circle' },
    { title: 'Payslips', url: '/payslips', icon: 'time' }, // NEW
  ];

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.checkInitialAuthState();
    this.setupAuthListener();
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  private async checkInitialAuthState() {
    const session = await this.supabase.getSession();
    this.isLoggedIn$.next(!!session?.data.session);
  }

  private setupAuthListener() {
    this.authStateSubscription = this.supabase.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;
      this.isLoggedIn$.next(isLoggedIn);

      if (event === 'SIGNED_OUT') {
        this.closeMenu();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  async logout() {
    await this.supabase.signOut();
  }

  async closeMenu() {
    const menu = await this.menuCtrl.get('main-menu');
    if (menu) {
      menu.close();
    }
  }

  async toggleMenu() {
    const menu = await this.menuCtrl.get('main-menu');
    if (menu) {
      menu.toggle();
    }
  }
}
