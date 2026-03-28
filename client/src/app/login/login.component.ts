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
  message: string = '';

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
      this.message = "Please fill all fields.";
      return;
    }

    this.http.Login(this.itemForm.value).subscribe({
      next: (res) => {
        // Save token, role, userId
        this.auth.saveToken(res.token);
        this.auth.SetRole(res.role);
        this.auth.saveUserId(res.userId);

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.message = "Invalid username or password.";
      }
    });
  }
}