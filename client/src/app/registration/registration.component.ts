<<<<<<< HEAD
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent {

  itemForm: FormGroup;
  formModel: any = { role: null, email: '', password: '', username: '' };
  showMessage: boolean = false;
  responseMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {
    this.itemForm = this.fb.group({
      username: [this.formModel.username, Validators.required],
      email: [this.formModel.email, [Validators.required, Validators.email]],
      password: [this.formModel.password, Validators.required],
      role: [this.formModel.role, Validators.required]
    });
  }

  onRegister() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.httpService.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'You are successfully registered';
        this.itemForm.reset();
      },
      error: () => {
        this.showMessage = true;
        this.responseMessage = 'Registration failed';
      }
    });
  }
}
=======
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  itemForm!: FormGroup;
  message: string = '';
  roles = ['CONSUMER', 'WHOLESALER', 'MANUFACTURER'];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = "Please fill all fields correctly.";
      return;
    }

    this.http.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.message = "";
        this.router.navigate(['/login']);
      },
      error: () => {
        this.message = "Registration failed. Try again.";
      }
    });
  }
}
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
