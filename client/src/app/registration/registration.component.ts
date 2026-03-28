import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  itemForm!: FormGroup;

  formModel: any = {
    username: '',
    email: '',
    password: '',
    role: null
  };

  showMessage = false;
  responseMessage: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: [this.formModel.username, Validators.required],
      email: [
        this.formModel.email,
        [Validators.required, Validators.email]
      ],
      password: [this.formModel.password, Validators.required],
      role: [this.formModel.role, Validators.required]
    });
  }

  onRegister(): void {
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
        this.responseMessage = 'Registration failed. Username or email may already exist.';
      }
    });
  }
}
``