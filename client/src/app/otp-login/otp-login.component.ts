import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp-login',
  templateUrl: './otp-login.component.html',
  styleUrls: ['./otp-login.component.scss']
})
export class OtpLoginComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  step: 'EMAIL' | 'OTP' = 'EMAIL';

  message = '';
  loading = false;

  resendSeconds = 0;
  private timer: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.form.get('otp')?.disable();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  sendOtp(): void {
    const emailCtrl = this.form.get('email');
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
        this.step = 'OTP';
        this.form.get('otp')?.enable();
        this.form.get('otp')?.reset();
        this.startResendTimer(30);
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(): void {
    const emailCtrl = this.form.get('email');
    const otpCtrl = this.form.get('otp');

    if (!emailCtrl || !otpCtrl) return;

    if (emailCtrl.invalid) {
      this.message = 'Enter a valid email.';
      return;
    }

    if (otpCtrl.invalid) {
      this.message = 'OTP must be 6 digits.';
      return;
    }

    this.loading = true;
    this.message = '';

    const email = String(emailCtrl.value).trim();
    const otp = String(otpCtrl.value).trim();

    this.http.verifyOtp(email, otp).subscribe({
      next: (res: any) => {
        this.auth.saveLoginData(
          res.token,
          res.role,
          String(res.id),
          res.username
        );
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

  backToPasswordLogin(): void {
    this.router.navigate(['/login']);
  }

  private startResendTimer(seconds: number): void {
    if (this.timer) clearInterval(this.timer);

    this.resendSeconds = seconds;
    this.timer = setInterval(() => {
      this.resendSeconds -= 1;
      if (this.resendSeconds <= 0) {
        this.resendSeconds = 0;
        clearInterval(this.timer);
        this.timer = null;
      }
    }, 1000);
  }
}