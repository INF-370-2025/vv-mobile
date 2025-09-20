import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

interface Employee {
  id?: number;
  employee_id?: number;
  user_id?: string;
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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  uploading = false;

  // Placeholder; will be replaced if user has an image
  imgSrc =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';

  private authSubscription?: Subscription;
  currentEmployee: Employee | null = null;
  employeeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email_address: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required]
    });
  }

  async ngOnInit() {
    console.log('ProfilePage initialized');
    // Let the view settle (helps with lock issues you saw)
    setTimeout(() => {
      this.loadEmployeeData();
    }, 100);
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  // ---------------- Load chain ----------------
  private async loadEmployeeData() {
    try {
      const employeeData = await this.getEmployeeDataSafely();

      if (employeeData && (employeeData.employee_id || employeeData.id)) {
        this.employeeId = (employeeData.employee_id ?? employeeData.id) as number;

        console.log('Employee data loaded successfully', {
          employeeId: this.employeeId
        });

        await this.loadProfile();
      } else {
        this.loading = false;
        this.showToast('Please sign in to access your profile', 'warning');
      }
    } catch (error) {
      console.error('Error in loadEmployeeData:', error);
      this.loading = false;
    }
  }

  private async getEmployeeDataSafely(): Promise<any> {
    try {
      // Fast path: localStorage (avoids auth lock)
      const directData = this.getDirectLocalStorageData();
      if (directData) return directData;

      // Fallback: AuthService with timeout guard
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 2000);

        this.authSubscription = this.authService.getEmployee().subscribe({
          next: (data) => {
            clearTimeout(timeout);
            resolve(data);
          },
          error: (err) => {
            clearTimeout(timeout);
            console.warn('Auth service error, using fallback:', err);
            resolve(this.getDirectLocalStorageData());
          }
        });
      });
    } catch (error) {
      console.warn('Error in getEmployeeDataSafely, using fallback:', error);
      return this.getDirectLocalStorageData();
    }
  }

  private getDirectLocalStorageData(): any {
    try {
      // Try multiple keys your app might use
      const storageKeys = [
        'vv_employee',
        'auth_employee',
        'employee_data',
        'supabase.auth.token',
        'sb-trkedwmdellrzzjbuvtr-auth-token'
      ];

      for (const key of storageKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.employee_id || parsed.user_id || parsed.id)) {
            return parsed;
          }
        } catch {
          // Ignore and continue
        }
      }
      return null;
    } catch (error) {
      console.error('Error in getDirectLocalStorageData:', error);
      return null;
    }
  }

  async loadProfile() {
    if (!this.employeeId) {
      this.loading = false;
      return;
    }

    try {
      this.loading = true;

      // Prefer backend API
      try {
        const userData = await firstValueFrom(this.apiService.get_user(this.employeeId));
        if (userData && !userData.error) {
          this.currentEmployee = userData;
          this.populateForm(userData);
          if (userData.image) this.imgSrc = userData.image;
          this.loading = false;
          return;
        }
      } catch (apiError) {
        console.warn('API load failed, using stored data:', apiError);
      }

      // Fallback on stored data
      this.createProfileFromStoredData();
    } catch (error) {
      console.error('Error in loadProfile:', error);
      this.createProfileFromStoredData();
    } finally {
      this.loading = false;
    }
  }

  private createProfileFromStoredData() {
    const stored = this.getDirectLocalStorageData();
    const basic: Employee = {
      id: this.employeeId || undefined,
      employee_id: this.employeeId || undefined,
      name: stored?.name || '',
      surname: stored?.surname || '',
      email_address: stored?.email_address || stored?.email || '',
      phone_number: stored?.phone_number || stored?.phone || '',
      image: stored?.image || ''
    };
    this.currentEmployee = basic;
    this.populateForm(basic);
    if (basic.image) this.imgSrc = basic.image!;
  }

  private populateForm(user: Employee) {
    this.form.patchValue({
      name: user.name || '',
      surname: user.surname || '',
      email_address: user.email_address || '',
      phone_number: user.phone_number || ''
    });
  }

  // ---------------- Save ----------------
  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('Please fill all required fields', 'warning');
      return;
    }
    if (!this.employeeId) {
      this.showToast('Cannot save: No employee ID', 'danger');
      return;
    }

    this.saving = true;
    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();

    try {
      const formData = this.form.value;
      const payload = { ...formData, id: this.employeeId, employee_id: this.employeeId };

      const result = await firstValueFrom(this.apiService.update_user(this.employeeId, payload));

      if (result && !result.error) {
        this.showToast('Profile saved!', 'success');
        this.updateLocalStorage(formData);
        // keep UI in sync
        this.currentEmployee = { ...(this.currentEmployee ?? {}), ...formData };
      } else {
        this.showToast('Save failed: ' + (result?.error || 'Unknown error'), 'danger');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      this.showToast('Error saving: ' + (error?.message || 'Unknown error'), 'danger');
    } finally {
      this.saving = false;
      await loading.dismiss();
    }
  }

  private updateLocalStorage(formData: any) {
    try {
      const keys = ['vv_employee', 'auth_employee'];
      for (const key of keys) {
        const existing = localStorage.getItem(key);
        if (existing) {
          const updated = { ...JSON.parse(existing), ...formData };
          localStorage.setItem(key, JSON.stringify(updated));
          break;
        }
      }
    } catch (error) {
      console.warn('Could not update localStorage:', error);
    }
  }

  // ---------------- Avatar ----------------
  onAvatarPicked(event: Event) {
    // Placeholder; wire to your storage/upload later
    this.showToast('Image upload coming soon', 'medium');
    // Example preview (local only)
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imgSrc = String(reader.result));
      reader.readAsDataURL(file);
    }
  }

  // ---------------- UX ----------------
  async doRefresh(event: any) {
    await this.loadProfile();
    event.target.complete();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
