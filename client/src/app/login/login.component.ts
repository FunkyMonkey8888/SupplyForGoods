import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  itemForm!: FormGroup;
  otpForm!: FormGroup;

  message = '';
  loading = false;

  step: 'PASSWORD' | 'OTP' = 'PASSWORD';

  otpEmail: string = '';
  otpUsername: string = '';

  resendSeconds = 0;
  private timer: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // ✅ STEP 1: username/password -> OTP sent
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields.';
      return;
    }

    this.loading = true;
    this.message = '';

    const payload = {
      username: this.itemForm.value.username,
      password: this.itemForm.value.password
    };

    this.http.login2fa(payload).subscribe({
      next: (res) => {
        this.loading = false;

        this.step = 'OTP';
        this.otpEmail = res?.email || '';
        this.otpUsername = res?.username || payload.username;

        this.otpForm.reset();
        this.startResendTimer(30);
      },
      error: () => {
        this.loading = false;
        this.message = 'Invalid username or password.';
      }
    });
  }

  // ✅ STEP 2: verify OTP -> JWT issued
  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.message = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.loading = true;
    this.message = '';

    const payload = {
      username: this.otpUsername || this.itemForm.value.username,
      otp: String(this.otpForm.value.otp).trim()
    };

    this.http.verify2fa(payload).subscribe({
      next: (res) => {
        const id = res?.id ?? res?.userId ?? res?.user?.id;
        const role = res?.role ?? res?.user?.role;
        const username = res?.username ?? res?.user?.username;
        const token = res?.token;

        this.auth.saveLoginData(token, role, String(id), username);

        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.message = 'Invalid / Expired OTP.';
      }
    });
  }

  // Optional resend (uses /api/auth/request-otp with email)
  resendOtp(): void {
    if (this.resendSeconds > 0 || this.loading || !this.otpEmail) return;

    this.loading = true;
    this.message = '';

    this.http.resendOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.startResendTimer(30);
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to resend OTP.';
      }
    });
  }

  backToPassword(): void {
    this.step = 'PASSWORD';
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