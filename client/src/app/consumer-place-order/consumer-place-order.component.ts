import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {

  itemForm!: FormGroup;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.message = "Please fill all fields.";
      return;
    }

    const userId = localStorage.getItem('userId');
    const productId = this.itemForm.value.productId;

    const payload = {
      quantity: this.itemForm.value.quantity,
      status: this.itemForm.value.status
    };

    this.http.consumerPlaceOrder(payload, productId, userId).subscribe({
      next: () => {
        this.message = "";
        this.router.navigate(['/consumer-get-orders']);
      },
      error: () => {
        this.message = "Order failed. Try again.";
      }
    });
  }
}