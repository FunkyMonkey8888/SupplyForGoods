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
  message = '';
  loading = false;

  roles = ['CONSUMER', 'WHOLESALER', 'MANUFACTURER'];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router
  ) {}

  // ngOnInit(): void {
  //   this.itemForm = this.fb.group({
  //     username: ['', [Validators.required, Validators.minLength(4)]],
  //     email: ['', [Validators.required, Validators.email]],
  //     password: [
  //       '',
  //       [
  //         Validators.required,
  //         Validators.minLength(8),
  //         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  //       ]
  //     ],
  //     role: ['', Validators.required]
  //   });
  // }

  ngOnInit(): void {
  this.itemForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required]
  });
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