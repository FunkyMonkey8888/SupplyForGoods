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

  resendSeconds = 0;
  private timer: any = null;

  // ✅ Dynamic password validation state
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
          // ✅ IMPORTANT: use '&' not '&amp;' and validate whole string
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
        ]
      ],
      role: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // ✅ Live password rule evaluation + strength
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
    // Basic, reliable scoring (no external libs)
    let score = 0;

    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/\d/.test(pwd)) score += 15;
    if (/[@$!%*?&]/.test(pwd)) score += 15;

    // small bonus for variety
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
    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields correctly.';
      return;
    }

    this.loading = true;
    this.message = '';

    const email = String(this.itemForm.value.email).trim();

    this.http.requestRegisterOtp(email).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'OTP';
        this.otpForm.reset();
        this.startResendTimer(30);
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to send OTP. Try again.';
      }
    });
  }

  // ================= STEP 2: VERIFY OTP =================
  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.message = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.loading = true;
    this.message = '';

    const email = String(this.itemForm.value.email).trim();
    const otp = String(this.otpForm.value.otp).trim();

    this.http.verifyRegisterOtp(email, otp).subscribe({
      next: () => {
        this.loading = false;
        this.otpVerified = true;
        this.message = '';
        this.registerNow();
      },
      error: () => {
        this.loading = false;
        this.message = 'Invalid / Expired OTP.';
      }
    });
  }

  // ================= FINAL: REGISTER USER =================
  private registerNow(): void {
    if (!this.otpVerified) {
      this.message = 'Please verify OTP first.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Registration completed successfully.';
        this.router.navigate(['/login']);
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.loading = false;
        this.message = 'Registration failed. Try again.';
      }
    });
  }

  // ================= UX: RESEND / BACK =================
  resendOtp(): void {
    if (this.resendSeconds > 0 || this.loading) return;
    this.sendOtp();
  }

  backToForm(): void {
    this.step = 'FORM';
    this.message = '';
    this.otpForm.reset();
    this.stopTimer();
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
}