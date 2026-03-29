import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm!: FormGroup;
  message = '';
  loading = false;

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
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = 'Please fill all fields.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http.Login(this.itemForm.value).subscribe({
      next: (res) => {
        // ✅ SAVE EVERYTHING AT ONCE (IMPORTANT)
        this.auth.saveLoginData(
          res.token,
          res.role,
          res.userId,
          res.username
        );

        // ✅ AUTO‑REDIRECT
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.message = 'Invalid username or password.';
        this.loading = false;
      }
    });
  }
}