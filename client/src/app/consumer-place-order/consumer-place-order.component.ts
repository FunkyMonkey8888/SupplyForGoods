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
  role: string | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  wishlistCount = 0;
  cartCount = 0;

  uiMessage = '';
  uiMessageType: 'success' | 'danger' | 'info' = 'info';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.role = this.auth.getRole();

    this.buildForm();

    if (!this.userId || !this.role) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    if (this.role !== 'CONSUMER') {
      this.errorMessage = 'Only consumers can place orders here.';
      return;
    }

    this.refreshCounts();
    this.loadProducts();
  }

  private buildForm(): void {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PENDING']
    });
  }

  private refreshCounts(): void {
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
  }

  private showUiMessage(msg: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.uiMessage = msg;
    this.uiMessageType = type;
    setTimeout(() => {
      this.uiMessage = '';
    }, 1800);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private loadProducts(): void {
    this.http.getProductsByConsumers().subscribe({
      next: res => this.products = res || [],
      error: () => {
        this.errorMessage = 'Failed to load products.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.clearMessages();
    this.orderForm.patchValue({ quantity: '' });
  }

  /* ===================== ✅ WISHLIST ===================== */

  isInWishlist(product: any): boolean {
    return this.http.isInWishlist(this.userId, product?.id);
  }

  toggleWishlist(product: any): void {
    this.http.toggleWishlist(this.userId, product);
    this.refreshCounts();
    const nowIn = this.isInWishlist(product);
    this.showUiMessage(nowIn ? 'Added to wishlist ♥' : 'Removed from wishlist', nowIn ? 'success' : 'info');
  }

  /* ===================== ✅ CART ===================== */

  addToCart(product: any): void {
    const stock = Number(product?.stockQuantity ?? 0);
    if (!isNaN(stock) && stock === 0) {
      this.showUiMessage('Out of stock — cannot add to cart', 'danger');
      return;
    }

    this.http.addToCart(this.userId, product, 1);
    this.refreshCounts();
    this.showUiMessage('Added to cart 🛒', 'success');
  }

  /* ===================== ✅ PLACE ORDER (uses extra APIs) ===================== */

  placeOrder(): void {
    this.clearMessages();

    if (this.role !== 'CONSUMER') {
      this.errorMessage = 'Only consumers can place orders here.';
      return;
    }

    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const qty = Number(this.orderForm.value.quantity);
    if (!qty || qty < 1) {
      this.errorMessage = 'Quantity must be at least 1';
      return;
    }

    this.loading = true;

    const productId = Number(this.selectedProduct?.id);

    // ✅ Extra feature: fetch latest product details (stock) before placing order
    this.http.getProductByConsumerById(productId).subscribe({
      next: (latest: any) => {
        const latestStock = Number(latest?.stockQuantity ?? 0);

        if (latestStock === 0) {
          this.errorMessage = 'Out of stock.';
          this.loading = false;
          this.selectedProduct = latest;
          return;
        }

        if (qty > latestStock) {
          this.errorMessage = `Insufficient stock. Available: ${latestStock}`;
          this.loading = false;
          this.selectedProduct = latest;
          return;
        }

        // ✅ Use PENDING to match backend (backend sets PENDING anyway)
        this.http.consumerPlaceOrder(
          {
            quantity: qty,
            status: 'PENDING'
          },
          productId,
          this.userId
        ).subscribe({
          next: () => {
            this.successMessage = 'Order placed successfully';
            this.loading = false;

            this.orderForm.reset({ status: 'PENDING', quantity: '' });
            this.selectedProduct = null;

            // refresh UI data
            this.refreshCounts();
            this.loadProducts();
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Order placement failed';
            this.loading = false;
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
      },
      error: () => {
        this.errorMessage = 'Unable to verify latest stock. Please try again.';
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  incrementQty(): void {
  const current = Number(this.orderForm.value.quantity || 1);
  this.orderForm.patchValue({ quantity: current + 1 });
}

decrementQty(): void {
  const current = Number(this.orderForm.value.quantity || 1);
  if (current > 1) {
    this.orderForm.patchValue({ quantity: current - 1 });
  }
}

}