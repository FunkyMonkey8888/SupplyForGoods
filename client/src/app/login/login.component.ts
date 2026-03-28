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
<<<<<<< HEAD
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
=======
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
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
}