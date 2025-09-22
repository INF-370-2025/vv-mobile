// auth.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service'; // Add this import
import { Router } from '@angular/router'; // Add this import
import { NotificationService } from './notification.service'; // Add this import

// Add user interface to match the example
interface User {
  email: any;
  user_id?: number;
  name?: string;
  surname?: string;
  email_address?: string;
  phone_number?: string;
  image?: string;
  role_id?: number;
  title_id?: number;
  uuid?: string;
  is_employee?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private employeeSubject = new BehaviorSubject<any>(null);
  private userSubject = new BehaviorSubject<User | null>(null); // Add user subject
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Add logged in subject

  constructor(
    private apiService: ApiService, // Add ApiService
    private router: Router, // Add Router
    private notificationService: NotificationService // Add NotificationService
  ) {
    console.log('[AuthService] Initializing auth service');
    this.loadEmployeeData();
    this.loadUserData();
  }

  // Add getter for user
  get user(): User | null {
    return this.userSubject.value;
  }

  // Add getter for user observable
  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  // Add getter for isLoggedIn
  get isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  async setEmployee(employee: any) {
    console.log('[AuthService] Setting employee:', employee);
    try {
      await Preferences.set({
        key: 'employee',
        value: JSON.stringify(employee)
      });
      console.log('[AuthService] Employee data saved to storage');
      this.employeeSubject.next(employee);
    } catch (error) {
      console.error('[AuthService] Error saving employee data:', error);
    }
  }

  // Add method to set user
  async setUser(user: User) {
    console.log('[AuthService] Setting user:', user);
    try {
      await Preferences.set({
        key: 'user',
        value: JSON.stringify(user)
      });
      console.log('[AuthService] User data saved to storage');
      this.userSubject.next(user);
      this.isLoggedInSubject.next(true);
    } catch (error) {
      console.error('[AuthService] Error saving user data:', error);
    }
  }

  private async loadEmployeeData() {
    console.log('[AuthService] Loading employee data from storage');
    try {
      const { value } = await Preferences.get({ key: 'employee' });
      console.log('[AuthService] Raw storage value:', value);

      if (value) {
        const employee = JSON.parse(value);
        console.log('[AuthService] Parsed employee data:', employee);
        this.employeeSubject.next(employee);
      } else {
        console.log('[AuthService] No employee data found in storage');
      }
    } catch (error) {
      console.error('[AuthService] Error loading employee data:', error);
    }
  }

  // Add method to load user data
  private async loadUserData() {
    console.log('[AuthService] Loading user data from storage');
    try {
      const { value } = await Preferences.get({ key: 'user' });
      console.log('[AuthService] Raw user storage value:', value);

      if (value) {
        const user = JSON.parse(value);
        console.log('[AuthService] Parsed user data:', user);
        this.userSubject.next(user);
        this.isLoggedInSubject.next(true);
      } else {
        console.log('[AuthService] No user data found in storage');
      }
    } catch (error) {
      console.error('[AuthService] Error loading user data:', error);
    }
  }

  getEmployee() {
    console.log('[AuthService] Getting employee observable');
    return this.employeeSubject.asObservable();
  }

  getEmployeeId(): number {
    const employee = this.employeeSubject.value;
    if (!employee || !employee.employee_id) {
      console.error('[AuthService] No valid employee ID found');
      return 0; // Default to 0 if not found
    }
    console.log('[AuthService] Getting employee ID:', employee.employee_id);
    return employee.employee_id;
  }

  // Add method to get user ID
  getUserId(): number {
    const user = this.userSubject.value;
    if (!user || !user.user_id) {
      console.error('[AuthService] No valid user ID found');
      return 0; // Default to 0 if not found
    }
    console.log('[AuthService] Getting user ID:', user.user_id);
    return user.user_id;
  }

  async clear() {
    console.log('[AuthService] Clearing auth data');
    try {
      await Preferences.remove({ key: 'employee' });
      await Preferences.remove({ key: 'user' });
      this.employeeSubject.next(null);
      this.userSubject.next(null);
      this.isLoggedInSubject.next(false);
      console.log('[AuthService] Auth data cleared');
    } catch (error) {
      console.error('[AuthService] Error clearing auth data:', error);
    }
  }

  // Add method to load employee profile (from example)
  loadEmployeeProfile(userId: number): void {
    this.apiService.get_profile_employee(userId).subscribe({
      next: (employee) => {
        this.employeeSubject.next(employee);
      },
      error: (err) => {
        this.notificationService.showError('Failed to load employee profile');
      }
    });
  }

  // Add method to initialize user (from example)
  initializeUser(user: User): void {
    this.userSubject.next(user);
    this.isLoggedInSubject.next(true);

    // Load employee profile if user exists
    if (user && user.user_id) {
      this.loadEmployeeProfile(user.user_id);
    }
  }
}
