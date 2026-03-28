import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  itemForm: FormGroup;
  formModel: any = {};
  showError: boolean = false;
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.authService.saveUserId(res.id.toString());
        this.authService.setRole(res.role);
        this.router.navigateByUrl('/dashboard');
        window.location.reload();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  registration() {
    this.router.navigateByUrl('/registration');
  }
}