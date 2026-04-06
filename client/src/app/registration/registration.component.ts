import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  itemForm!: FormGroup;
  otpForm!: FormGroup;

  message = '';
  loading = false;

  roles = ['CONSUMER', 'WHOLESALER', 'MANUFACTURER'];

  step: 'FORM' | 'OTP' = 'FORM';
  otpVerified = false;

  // ✅ Store the email used to request OTP (single source of truth)
  otpEmail = '';

  resendSeconds = 0;
  private timer: any = null;

  passwordRules = {
    minLen: false,
    upper: false,
    lower: false,
    digit: false,
    special: false
  };

  passwordStrength = 0; // 0..100
  passwordStrengthLabel: 'Weak' | 'Medium' | 'Strong' = 'Weak';

  private pwdSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // ✅ FIXED: in TypeScript use '&' not '&amp;'
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
        ]
      ],
      role: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.pwdSub = this.itemForm.get('password')!.valueChanges.subscribe((val: string) => {
      const pwd = (val || '').toString();

      this.passwordRules.minLen = pwd.length >= 8;
      this.passwordRules.upper = /[A-Z]/.test(pwd);
      this.passwordRules.lower = /[a-z]/.test(pwd);
      this.passwordRules.digit = /\d/.test(pwd);
      this.passwordRules.special = /[@$!%*?&]/.test(pwd);

      this.computeStrength(pwd);
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.pwdSub) this.pwdSub.unsubscribe();
  }

  private computeStrength(pwd: string): void {
    let score = 0;

    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/\d/.test(pwd)) score += 15;
    if (/[@$!%*?&]/.test(pwd)) score += 15;

    const variety = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[@$!%*?&]/.test(pwd)
    ].filter(Boolean).length;

    if (variety >= 3) score += 10;
    if (score > 100) score = 100;

    this.passwordStrength = score;

    if (score < 45) this.passwordStrengthLabel = 'Weak';
    else if (score < 75) this.passwordStrengthLabel = 'Medium';
    else this.passwordStrengthLabel = 'Strong';
  }

  // ================= STEP 1: SEND OTP =================
  sendOtp(): void {
    if (this.loading) return;

    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields correctly.';
      return;
    }

    this.loading = true;
    this.message = '';

    // reset otp state every time user requests OTP
    this.otpVerified = false;
    this.step = 'FORM';

    // ✅ Lock OTP email once (prevents mismatch)
    this.otpEmail = String(this.itemForm.value.email || '').trim().toLowerCase();

    this.http.requestRegisterOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'OTP';
        this.otpForm.reset();

        // ✅ disable email editing while OTP screen is open
        this.itemForm.get('email')?.disable();

        this.startResendTimer(30);
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Failed to send OTP. Try again.';
      }
    });
  }

  // ================= STEP 2: VERIFY OTP =================
  verifyOtp(): void {
    if (this.loading) return;

    if (this.otpForm.invalid) {
      this.message = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.loading = true;
    this.message = '';

    const otp = String(this.otpForm.value.otp || '').trim();

    // ✅ Use stored otpEmail (not live form email)
    this.http.verifyRegisterOtp(this.otpEmail, otp).subscribe({
      next: () => {
        this.loading = false;
        this.otpVerified = true;
        this.message = '';
        this.registerNow();
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Invalid / Expired OTP.';
      }
    });
  }

  // ================= FINAL: REGISTER USER =================
  private registerNow(): void {
    if (!this.otpVerified) {
      this.message = 'Please verify OTP first.';
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.message = '';

    // ✅ ensure email is included even if control is disabled
    const payload = {
      ...this.itemForm.getRawValue(), // includes disabled fields like email
      email: this.otpEmail
    };

    this.http.registerUser(payload).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Registration completed successfully.';

        // reset local state (optional)
        this.resetAllState();

        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Registration failed. Try again.';
      }
    });
  }

  // ================= UX: RESEND / BACK =================
  resendOtp(): void {
    if (this.loading) return;
    if (this.resendSeconds > 0) return;

    // resend should use same locked email
    if (!this.otpEmail) {
      this.message = 'Email missing. Please go back and try again.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.requestRegisterOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'OTP resent.';
        this.otpForm.reset();
        this.startResendTimer(30);
        setTimeout(() => (this.message = ''), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  backToForm(): void {
    if (this.loading) return;

    this.step = 'FORM';
    this.message = '';
    this.otpForm.reset();
    this.stopTimer();

    this.otpVerified = false;
    this.otpEmail = '';

    // ✅ allow editing email again
    this.itemForm.get('email')?.enable();
  }

  private startResendTimer(seconds: number): void {
    this.stopTimer();
    this.resendSeconds = seconds;

    this.timer = setInterval(() => {
      this.resendSeconds -= 1;
      if (this.resendSeconds <= 0) {
        this.resendSeconds = 0;
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetAllState(): void {
    this.stopTimer();

    this.step = 'FORM';
    this.otpVerified = false;
    this.otpEmail = '';
    this.resendSeconds = 0;

    this.itemForm.reset();
    this.itemForm.get('email')?.enable();

    this.passwordStrength = 0;
    this.passwordStrengthLabel = 'Weak';
    this.passwordRules = {
      minLen: false,
      upper: false,
      lower: false,
      digit: false,
      special: false
    };
  }
}
