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

  /* ✅ NEW: Search + Sort + Pagination variables */
  searchText: string = '';
  sortOption: string = '';
  page: number = 0;
  size: number = 12;   // You can adjust

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.buildForm();
    this.loadProducts();   // ✅ Now loads with enhanced features
  }

  private buildForm(): void {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PLACED']
    });
  }

  /* =====================================================
      ✅ UPDATED Load Products (Advanced + Backwards Safe)
     ===================================================== */
  private loadProducts(): void {

    this.http.getProductsByConsumersAdvanced(
      this.sortOption,
      this.searchText,
      this.page,
      this.size
    ).subscribe({
      next: res => this.products = res,
      error: () => this.errorMessage = 'Failed to load products.'
    });
  }

  /* ✅ Triggered when selecting sort dropdown */
  onSortChange(event: any): void {
    this.sortOption = event.target.value;
    this.page = 0; // reset page
    this.loadProducts();
  }

  /* ✅ Triggered when typing in search box */
  onSearch(): void {
    this.page = 0; // reset page
    this.loadProducts();
  }

  /* ✅ Pagination buttons */
  nextPage(): void {
    this.page++;
    this.loadProducts();
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  /* ✅ Rating helper (count feedback entries) */
  getRating(product: any): number {
    if (!product.orders) return 0;

    let count = 0;
    for (const order of product.orders) {
      if (order.feedbacks) {
        count += order.feedbacks.length;
      }
    }
    return count;
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