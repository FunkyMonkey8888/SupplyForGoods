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