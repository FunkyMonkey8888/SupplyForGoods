import { Component, OnInit, OnDestroy } from '@angular/core';
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

  // password login form
  itemForm!: FormGroup;

  // otp login form
  otpForm!: FormGroup;

  message = '';
  loading = false;

  mode: 'PASSWORD' | 'OTP' = 'PASSWORD';
  otpStep: 'EMAIL' | 'VERIFY' = 'EMAIL';

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
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.otpForm.get('otp')?.disable();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // ---------------- PASSWORD LOGIN ----------------

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.Login(this.itemForm.value).subscribe({
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
        this.message = 'Invalid username or password.';
        this.loading = false;
      }
    });
  }

  // ---------------- OTP LOGIN ----------------

  switchToOtp(): void {
    this.mode = 'OTP';
    this.otpStep = 'EMAIL';
    this.message = '';
    this.loading = false;

    this.otpForm.reset();
    this.otpForm.get('otp')?.disable();

    this.stopTimer();
  }

  switchToPassword(): void {
    this.mode = 'PASSWORD';
    this.message = '';
    this.loading = false;

    this.stopTimer();
  }

  sendOtp(): void {
    const emailCtrl = this.otpForm.get('email');
    if (!emailCtrl || emailCtrl.invalid) {
      this.message = 'Enter a valid email.';
      return;
    }

    this.loading = true;
    this.message = '';

    const email = String(emailCtrl.value).trim();

    this.http.requestOtp(email).subscribe({
      next: () => {
        this.loading = false;
        this.otpStep = 'VERIFY';

        this.otpForm.get('otp')?.enable();
        this.otpForm.get('otp')?.reset();

        this.startResendTimer(30);
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to send OTP. Try again.';
      }
    });
  }

  verifyOtp(): void {
    const emailCtrl = this.otpForm.get('email');
    const otpCtrl = this.otpForm.get('otp');

    if (!emailCtrl || !otpCtrl) return;

    if (emailCtrl.invalid) {
      this.message = 'Enter a valid email.';
      return;
    }

    if (otpCtrl.invalid) {
      this.message = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.loading = true;
    this.message = '';

    const email = String(emailCtrl.value).trim();
    const otp = String(otpCtrl.value).trim();

    this.http.verifyOtp(email, otp).subscribe({
      next: (res: any) => {
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

  resendOtp(): void {
    if (this.resendSeconds > 0 || this.loading) return;
    this.sendOtp();
  }

  backToEmail(): void {
    this.otpStep = 'EMAIL';
    this.message = '';
    this.otpForm.get('otp')?.disable();
    this.otpForm.get('otp')?.reset();

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