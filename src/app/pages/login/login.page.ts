import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';

// Normalize to E.164 (+2782...) to match your web behavior
function toE164(raw: string): string {
  const t = (raw || '').trim();
  if (!t) return '';
  return t.startsWith('+') ? t : '+' + t.replace(/[^0-9]/g, '');
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnDestroy {
  step: 'phone' | 'code' = 'phone';
  loading = false;
  error: string | null = null;
  phoneStored = '';
  resendIn = 0;
  private resendTimer?: any;

  phoneForm = this.fb.group({
    phone: ['', [Validators.required]]
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]]
  });

  constructor(private fb: FormBuilder, private sb: SupabaseService, private router: Router) {}

  ngOnDestroy(): void {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  async sendCode() {
    if (this.phoneForm.invalid || this.loading) return;
    this.loading = true; this.error = null;

    const phone = toE164(this.phoneForm.value.phone!);
    const { error } = await this.sb.sendOtp(phone, /* mirror vv-app */ true);

    this.loading = false;
    if (error) { this.error = error.message || 'Failed to send code.'; return; }

    this.phoneStored = phone;
    this.step = 'code';
    this.startResendCountdown(30);
  }

  async verifyCode() {
    if (this.codeForm.invalid || this.loading) return;
    this.loading = true; this.error = null;

    const token = this.codeForm.value.code!;
    const { data, error } = await this.sb.verifyOtp(this.phoneStored, token);

    this.loading = false;
    if (error) { this.error = error.message || 'Invalid code.'; return; }

    if (data?.session) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.error = 'No session returned. Please try again.';
    }
  }

  async resend() {
    if (this.resendIn > 0 || !this.phoneStored) return;
    await this.sb.sendOtp(this.phoneStored, true);
    this.startResendCountdown(30);
  }

  private startResendCountdown(seconds: number) {
    this.resendIn = seconds;
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendIn--;
      if (this.resendIn <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }
}
