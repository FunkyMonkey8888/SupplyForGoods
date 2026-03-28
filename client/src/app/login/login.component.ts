import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm!: FormGroup;

  formModel: any = {
    username: '',
    password: ''
  };

  showError = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: [this.formModel.username, Validators.required],
      password: [this.formModel.password, Validators.required]
    });
  }

  /* -----------------------------
     LOGIN
  ------------------------------ */
  onLogin(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.authService.setRole(res.role);
        this.authService.saveUserId(res.userId);

        this.router.navigateByUrl('/dashboard');
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  /* -----------------------------
     GO TO REGISTRATION
  ------------------------------ */
  registration(): void {
    this.router.navigateByUrl('/registration');
  }
}