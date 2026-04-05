import { Component, OnInit, OnDestroy } from '@angular/core';
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
  message = '';
  loading = false;

  roles = ['CONSUMER', 'WHOLESALER', 'MANUFACTURER'];

  // ✅ Password rules + strength UI state
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
          // ✅ Use '&' not '&amp;' in TS regex
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
        ]
      ],
      role: ['', Validators.required]
    });

    // ✅ Live evaluation (rules + strength)
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

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields correctly.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.message = 'Registration failed. Try again.';
      }
    });
  }
}