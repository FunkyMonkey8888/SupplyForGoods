import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {

  orderForm!: FormGroup;

  products: any[] = [];
  selectedProduct: any = null;

  userId!: number;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.buildForm();
    this.loadProducts();
  }

  private buildForm(): void {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PLACED']
    });
  }

  /* ✅ Load products from ALL wholesalers */
  private loadProducts(): void {
    this.http.getProductsByConsumers().subscribe({
      next: res => this.products = res,
      error: () => {
        this.errorMessage = 'Failed to load products.';
      }
    });
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.successMessage = '';
    this.errorMessage = '';
  }

  placeOrder(): void {

    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      return;
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http.consumerPlaceOrder(
      {
        quantity: this.orderForm.value.quantity,
        status: 'PLACED'
      },
      this.selectedProduct.id,
      this.userId
    ).subscribe({
      next: () => {
        this.successMessage = 'Order placed successfully';
        this.loading = false;
        this.orderForm.reset({ status: 'PLACED' });
        this.selectedProduct = null;
      },
      error: () => {
        this.errorMessage = 'Order placement failed';
        this.loading = false;
      }
    });
  }
}